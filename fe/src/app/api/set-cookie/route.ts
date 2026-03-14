import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, refreshToken, rememberToken } = await request.json();

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const response = NextResponse.json({ status: true });

  // accessToken — 15 menit
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  // refreshToken — 7 hari
  if (refreshToken) {
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // rememberToken — 30 hari, hanya kalau rememberMe dicentang
  if (rememberToken) {
    response.cookies.set("rememberToken", rememberToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}