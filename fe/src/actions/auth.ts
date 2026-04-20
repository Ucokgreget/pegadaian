"use server";

import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from "@/types/Auth";
import { on } from "events";
import { cookies } from "next/headers";
import { json } from "zod";

const API_URL = process.env.API_URL;

function cookieConfig(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

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
        message: result?.message || "Login gagal",
        accessToken: null,
        refreshToken: null,
        rememberToken: null,
      };
    }
    const cookieStore = await cookies();

    cookieStore.set("token", result.accessToken, cookieConfig(60 * 15));

    if (result.refreshToken) {
      cookieStore.set(
        "refreshToken",
        result.refreshToken,
        cookieConfig(60 * 60 * 24 * 7),
      );
    } else {
      cookieStore.delete("refreshToken");
    }

    if (result.rememberToken) {
      cookieStore.set(
        "rememberToken",
        result.rememberToken,
        cookieConfig(60 * 60 * 24 * 30),
      );
    } else {
      cookieStore.delete("rememberToken");
    }

    return {
      status: true,
      message: result.message || "Login berhasil",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || null,
      rememberToken: result.rememberToken || null,
      user: result.user,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Server error",
      accessToken: null,
      refreshToken: null,
      rememberToken: null,
    };
  }
}

export async function loginAction(
  prevState: LoginResponse,
  formData: FormData,
): Promise<LoginResponse> {
  const email = String(formData.get("email") || null).trim();
  const password = String(formData.get("password") || null).trim();
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return {
      status: false,
      message: "Login Gagal",
      accessToken: null,
      refreshToken: null,
      rememberToken: null,
    };
  }

  return await login({
    email,
    password,
    rememberMe,
  });
}

export async function autoLogin(): Promise<LoginResponse> {
  try {
    const cookieStore = await cookies();
    const rememberToken = cookieStore.get("rememberToken")?.value;

    if (!rememberToken) {
      return {
        status: false,
        message: "Auto login gagal",
        accessToken: null,
        refreshToken: null,
        rememberToken: null,
      };
    }

    const res = await fetch(`${API_URL}/remember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rememberToken }),
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.accessToken) {
      cookieStore.delete("token");
      cookieStore.delete("refreshToken");
      cookieStore.delete("rememberToken");

      return {
        status: false,
        message: result?.error || "Auto login gagal",
        accessToken: null,
        refreshToken: null,
        rememberToken: null,
      };
    }

    cookieStore.set("token", result.accessToken, cookieConfig(60 * 15));

    if (result.refreshToken) {
      cookieStore.set(
        "refreshToken",
        result.refreshToken,
        cookieConfig(60 * 60 * 24 * 7),
      );
    } else {
      cookieStore.delete("refreshToken");
    }

    return {
      status: true,
      message: result.message || "Berhasil auto login",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberToken: result.rememberToken ?? rememberToken,
      user: result.user,
    };
  } catch (error) {
    console.log("Auto login gagal", error);
    return {
      status: false,
      message: "server error",
      accessToken: null,
      refreshToken: null,
      rememberToken: null,
    };
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
        accessToken: null,
        refreshToken: null,
        rememberToken: null,
      };
    }

    return {
      status: true,
      message: "Register berhasil",
      accessToken: null,
      refreshToken: null,
      rememberToken: null,
      user: result.user,
    };
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return {
      status: false,
      message: "Server tidak merespon",
      accessToken: null,
      refreshToken: null,
      rememberToken: null,
    };
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

export async function logout(): Promise<{ status: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }).catch(() => null);
    }

    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    cookieStore.delete("rememberToken");

    return { status: true };
  } catch (error) {
    console.log("Logout error", error);
    return {
      status: false,
    };
  }
}

/* ================= REFRESH TOKEN ================= */
export async function refreshTokenAction(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) return false;

    const res = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      cookieStore.delete("token");
      cookieStore.delete("refreshToken");
      return false;
    }

    const data = await res.json();
    cookieStore.set("token", data.accessToken, cookieConfig(60 * 15));
    return true;
  } catch (error) {
    return false;
  }
}
