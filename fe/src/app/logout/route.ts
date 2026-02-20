import { NextResponse } from "next/server";

export async function GET() {
  // Token is now in localStorage (client-side), so we just redirect to login.
  // The actual localStorage.removeItem("token") is done client-side before navigating here.
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
