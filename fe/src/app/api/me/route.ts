import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const user = await getCurrentUser(token);
  if (!user) return NextResponse.json(null, { status: 401 });

  return NextResponse.json(user);
}