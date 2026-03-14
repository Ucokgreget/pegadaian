"use server";

import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from "@/types/Auth";
import { cookies } from "next/headers";

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
    if (!res.ok || !result?.accessToken) {
      return {
        status: false,
        message: result?.error || "Login gagal",
        refreshToken: null,
      };
    }

    return {
      status: true,
      message: "Login berhasil",
      token: result.accessToken,
      refreshToken: result.refreshToken,
      rememberToken: result.rememberToken ?? null,
      user: result.user,
    };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { status: false, message: "Server tidak merespon", refreshToken: null };
  }
}

/* ================= REGISTER ================= */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        status: false,
        message: result?.error || "Register gagal",
        refreshToken: null,
      };
    }

    return {
      status: true,
      message: "Register berhasil",
      refreshToken: null,
      user: result.user,
    };
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return { status: false, message: "Server tidak merespon", refreshToken: null };
  }
}

/* ================= CURRENT USER ================= */
export async function getCurrentUser(token?: string): Promise<User | null> {
  try {
    // Kalau token tidak dikirim, baca dari cookie
    const authToken = token ?? (await cookies()).get("token")?.value;
    if (!authToken) return null;

    const res = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
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