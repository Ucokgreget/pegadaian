import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-callback-signature") || "";

    const res = await fetch(`${API_URL}/checkout/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-signature": signature,
      },
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}