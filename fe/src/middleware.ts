import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPath = pathname === "/login" || pathname === "/register";

  const isPublicPath = pathname === "/";

  if (!token) {
    if (isPublicPath || isAuthPath) return NextResponse.next();
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
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
