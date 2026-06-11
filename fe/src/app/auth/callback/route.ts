import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  // ── OAuth gagal / tidak ada token ──────────────────────────────────────────
  if (error || !token) {
    const reason = error ?? "oauth_failed";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, request.url));
  }

  // ── Set cookie HTTP-only (identik dengan hasil login email/password) ────────
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 jam — cocok dengan expiresIn backend
  });

  // ── Decode JWT untuk redirect berdasarkan role ─────────────────────────────
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    const role = (payload.role as string) ?? "USER";
    
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/user", request.url));
  } catch (err) {
    // Jika JWT gagal diverifikasi
    return NextResponse.redirect(new URL("/user", request.url));
  }
}
