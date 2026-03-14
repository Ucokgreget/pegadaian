"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export interface PromoCode {
  id: number;
  code: string;
  type: "fixed" | "percent";
  value: number;
  maxDiscount: number | null;
  quota: number | null;
  used: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CreatePromoInput = Omit<PromoCode, "id" | "used" | "createdAt" | "updatedAt">;
export type UpdatePromoInput = CreatePromoInput;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleError(res: Response, fallback: string): Promise<never> {
  const text = await res.text();
  let message = fallback;
  try { message = JSON.parse(text).error || fallback; } catch {}
  throw new Error(message);
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const res = await fetch(`${API_URL}/promo`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch promo codes");
    return await res.json();
  } catch (error) {
    console.error("getPromoCodes error:", error);
    return [];
  }
}

export async function createPromoCode(data: CreatePromoInput): Promise<PromoCode> {
  const res = await fetch(`${API_URL}/promo`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleError(res, "Failed to create promo code");
  return await res.json();
}

export async function updatePromoCode(id: number, data: UpdatePromoInput): Promise<PromoCode> {
  const res = await fetch(`${API_URL}/promo/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleError(res, "Failed to update promo code");
  return await res.json();
}

export async function togglePromoActive(id: number): Promise<PromoCode> {
  const res = await fetch(`${API_URL}/promo/${id}/toggle`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Failed to toggle promo status");
  return await res.json();
}

export async function deletePromoCode(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/promo/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Failed to delete promo code");
}