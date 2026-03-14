import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
export async function POST() {
  const response = NextResponse.json({ status: true });
  response.cookies.delete("token");
  response.cookies.delete("refreshToken");
  response.cookies.delete("rememberToken");
  return response;
}