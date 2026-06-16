"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── QRIS Settings ─────────────────────────────────────────────────────────────

export interface QrisSettingsResponse {
  configured: boolean;
  merchantName?: string;
  merchantCity?: string;
  method?: "static" | "dynamic";
  currency?: string;
  qrisStatic?: string | null;
}

/** GET /api/settings/qris — get current merchant QRIS info */
export async function getQrisSettings(): Promise<QrisSettingsResponse> {
  try {
    const res = await fetch(`${API_URL}/api/settings/qris`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Gagal mengambil info QRIS");
    }
    return res.json();
  } catch (e) {
    console.error("getQrisSettings:", e);
    return { configured: false };
  }
}

/** PUT /api/settings/qris — save / update static QRIS string */
export async function saveQrisSettings(qrisStatic: string): Promise<{
  message: string;
  merchantName: string;
  merchantCity: string;
  method: string;
}> {
  const res = await fetch(`${API_URL}/api/settings/qris`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ qrisStatic }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(body.details) ? body.details.join(", ") : "";
    throw new Error(body.error + (detail ? `: ${detail}` : ""));
  }
  return body;
}

// ── Payment list (merchant) ───────────────────────────────────────────────────

export interface PaymentRecord {
  id: number;
  userId: number;
  waOrderId: number | null;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  proofUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  waOrder?: {
    orderCode: string;
    customerName: string;
    customerPhone: string;
    status: string;
  } | null;
}

/** GET /api/payments — list payments (merchant sees own, admin sees all) */
export async function getPayments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: PaymentRecord[];
  meta: { total: number; totalPages: number; page: number; limit: number };
}> {
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));

    const res = await fetch(`${API_URL}/api/payments?${qs.toString()}`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok)
      return {
        data: [],
        meta: { total: 0, totalPages: 0, page: 1, limit: 20 },
      };
    return res.json();
  } catch {
    return { data: [], meta: { total: 0, totalPages: 0, page: 1, limit: 20 } };
  }
}

/** PATCH /api/payments/:id/verify — verify (PAID) or reject (FAILED) a payment */
export async function verifyPayment(
  id: number,
  status: "PAID" | "FAILED",
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/payments/${id}/verify`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Gagal verifikasi payment");
  return body;
}
