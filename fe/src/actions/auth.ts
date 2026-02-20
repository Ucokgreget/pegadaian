"use server";

import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from "@/types/Auth";

const API_URL = process.env.API_URL;

/* ================= LOGIN ================= */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.token) {
      return {
        status: false,
        message: result?.message || "Login gagal",
      };
    }

    return {
      status: true,
      message: "Login berhasil",
      token: result.token,
      user: result.user,
    };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { status: false, message: "Server tidak merespon" };
  }
}

/* ================= REGISTER ================= */
export async function register(
  data: RegisterRequest
): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.token) {
      return {
        status: false,
        message: result?.message || "Register gagal",
      };
    }

    return {
      status: true,
      message: "Register berhasil",
      token: result.token,
      user: result.user,
    };
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return { status: false, message: "Server tidak merespon" };
  }
}

/* ================= CURRENT USER ================= */
export async function getCurrentUser(token: string): Promise<User | null> {
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("GET USER ERROR:", err);
    return null;
  }
}
