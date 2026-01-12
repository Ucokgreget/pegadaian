"use server";

import { cookies } from "next/headers";
import { LoginRequest, LoginResponse, User } from "@/types/Auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const cookieStore = await cookies();

  try {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        status: false,
        message: result.message || "Terjadi kesalahan saat login",
      };
    }

    if (result.token) {
      cookieStore.set("token", result.token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return {
      status: true,
      message: "Login berhasil",
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: false,
      message: "Gagal terhubung ke server",
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await fetch("http://localhost:8000/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
        // If 401, token might be expired.
      return null;
    }

    const user: User = await res.json();
    return user;
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    return null;
  }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
}
