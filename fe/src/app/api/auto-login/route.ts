// app/api/auto-login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const rememberToken = request.cookies.get("rememberToken")?.value;

  if (!rememberToken) {
    return NextResponse.json({ error: "No remember token" }, { status: 401 });
  }

  // Kirim rememberToken ke backend Express untuk validasi
  const res = await fetch(`${process.env.API_URL}/auth/remember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rememberToken }),
  });

  if (!res.ok) {
    // rememberToken tidak valid / tidak cocok di DB → hapus cookie
    const response = NextResponse.json({ error: "Invalid remember token" }, { status: 401 });
    response.cookies.delete("rememberToken");
    return response;
  }

  const data = await res.json();

  // Simpan accessToken baru ke cookie
  const response = NextResponse.json({
    status: true,
    role: data.user.role,
  });

  response.cookies.set("token", data.accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return response;
}