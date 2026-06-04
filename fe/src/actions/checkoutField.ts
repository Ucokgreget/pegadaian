"use server";

import { cookies } from "next/headers";
import type {
  CheckoutField,
  CreateCheckoutFieldInput,
  UpdateCheckoutFieldInput,
  ReorderItem,
} from "@/types/CheckoutField";

const API_URL = process.env.API_URL;

async function getAuthHeaders(token?: string): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("token")?.value ?? "";
  const finalToken = cookieToken || token?.trim() || "";
  return {
    Authorization: `Bearer ${finalToken}`,
    "Content-Type": "application/json",
  };
}

/** GET /checkout-fields — fetch all fields (active + inactive) for the current user */
export async function getCheckoutFields(token?: string): Promise<CheckoutField[]> {
  try {
    const res = await fetch(`${API_URL}/checkout-fields`, {
      method: "GET",
      headers: await getAuthHeaders(token),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil checkout fields");
    return await res.json();
  } catch (error) {
    console.error("getCheckoutFields error:", error);
    return [];
  }
}

/** POST /checkout-fields — create a new field */
export async function createCheckoutField(
  token: string,
  data: CreateCheckoutFieldInput
): Promise<CheckoutField> {
  const res = await fetch(`${API_URL}/checkout-fields`, {
    method: "POST",
    headers: await getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error ?? "Gagal membuat checkout field");
  }
  return await res.json();
}

/** PUT /checkout-fields/:id — update a single field */
export async function updateCheckoutField(
  token: string,
  id: number,
  data: UpdateCheckoutFieldInput
): Promise<CheckoutField> {
  const res = await fetch(`${API_URL}/checkout-fields/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error ?? "Gagal memperbarui checkout field");
  }
  return await res.json();
}

/** DELETE /checkout-fields/:id — delete a field */
export async function deleteCheckoutField(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_URL}/checkout-fields/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(token),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error ?? "Gagal menghapus checkout field");
  }
}

/** PUT /checkout-fields/reorder — bulk-update the display order */
export async function reorderCheckoutFields(
  token: string,
  items: ReorderItem[]
): Promise<void> {
  const res = await fetch(`${API_URL}/checkout-fields/reorder`, {
    method: "PUT",
    headers: await getAuthHeaders(token),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error ?? "Gagal mengubah urutan checkout fields");
  }
}
