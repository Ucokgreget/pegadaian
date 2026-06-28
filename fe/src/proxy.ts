import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPath = pathname === "/login" || pathname === "/register";

  // /auth/callback: token belum ada (sedang di-set di halaman ini)
  // harus diizinkan tanpa redirect ke /login
  const isOAuthCallback = pathname === "/auth/callback";

  const isPublicPath = pathname === "/";

  if (!token) {
    if (isPublicPath || isAuthPath || isOAuthCallback)
      return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (isAuthPath) {
      return NextResponse.redirect(
        new URL(role === "ADMIN" ? "/admin" : "/user", request.url),
      );
    }

    if (isPublicPath) return NextResponse.next();

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    if (pathname.startsWith("/user") && role !== "USER") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token expired/invalid → coba refresh dulu
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const res = await fetch(`${process.env.API_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          const response = NextResponse.next();
          response.cookies.set("token", data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15,
          });
          return response;
        }
      } catch {
        // refresh juga gagal, fall through ke redirect login
      }
    }

    // Refresh gagal atau nggak ada → redirect login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
