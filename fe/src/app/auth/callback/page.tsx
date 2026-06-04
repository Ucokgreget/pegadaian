/**
 * /auth/callback
 *
 * Server component — tidak perlu "use client".
 * Alur:
 *   1. Backend Google OAuth callback redirect ke sini dengan ?token=JWT
 *   2. Kita set token sebagai HTTP-only cookie (sama persis dengan login biasa)
 *   3. Decode JWT untuk tahu role, redirect ke /user atau /admin
 *   4. Middleware.ts sudah mengecualikan path ini dari cek auth
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

interface PageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function AuthCallbackPage({ searchParams }: PageProps) {
  const { token, error } = await searchParams;

  // ── OAuth gagal / tidak ada token ──────────────────────────────────────────
  if (error || !token) {
    const reason = error ?? "oauth_failed";
    redirect(`/login?error=${encodeURIComponent(reason)}`);
  }

  // ── Set cookie HTTP-only (identik dengan hasil login email/password) ────────
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 jam — cocok dengan expiresIn backend
  });

  // ── Decode JWT untuk redirect berdasarkan role ─────────────────────────────
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const role = (payload.role as string) ?? "USER";
    redirect(role === "ADMIN" ? "/admin" : "/user");
  } catch {
    // Token tidak bisa diverifikasi (mis. salah secret) — tetap redirect ke /user
    // Middleware akan catch dan redirect ke /login jika token benar-benar invalid
    redirect("/user");
  }
}
