"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface Package {
  id: number;
  key: string;
  name: string;
  price: number;
  priceLabel?: string | null;
  billingPeriod: string;
  isPopular: boolean;
  isCustomPrice: boolean;
  isActive: boolean;
  sortOrder: number;
  durationDays: number;
  subscriptions?: any[];
  _count?: { subscriptions: number };
  createdAt: string;
}

export type CreatePackageInput = Omit<Package, "id" | "key" | "createdAt" | "subscriptions" | "_count">;
export type UpdatePackageInput = Partial<CreatePackageInput>;

async function getToken(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value || "";
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchWithRefresh(url: string, options: RequestInit): Promise<Response> {
  let res = await fetch(url, options);

  if (res.status === 401) {
    // Pakai absolute URL karena ini server side — relative URL tidak bisa di server
    const refreshRes = await fetch(`${BASE_URL}/api/refresh`, { method: "POST" });
    if (!refreshRes.ok) return res;

    // Retry dengan token baru
    res = await fetch(url, {
      ...options,
      headers: await getAuthHeaders(),
    });
  }

  return res;
}

export async function getPackages(): Promise<Package[]> {
  try {
    const res = await fetchWithRefresh(`${API_URL}/package`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch packages");
    return await res.json();
  } catch (error) {
    console.error("getPackages error:", error);
    return [];
  }
}

export async function createPackage(data: CreatePackageInput): Promise<Package> {
  const res = await fetchWithRefresh(`${API_URL}/package`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to create package";
    try { message = JSON.parse(text).error || message; } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export async function updatePackage(id: number, data: UpdatePackageInput): Promise<Package> {
  const res = await fetchWithRefresh(`${API_URL}/package/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to update package";
    try { message = JSON.parse(text).error || message; } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export async function togglePackageActive(id: number): Promise<Package> {
  const res = await fetchWithRefresh(`${API_URL}/package/${id}/toggle`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to toggle package status";
    try { message = JSON.parse(text).error || message; } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export async function deletePackage(id: number): Promise<{ message: string }> {
  const res = await fetchWithRefresh(`${API_URL}/package/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  console.log("Deleting package id:", id);
  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to delete package";
    try { message = JSON.parse(text).error || message; } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export async function getPublicPackagesClient(): Promise<Package[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/package/public`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (error) {
    console.error("getPublicPackages error:", error);
    return [];
  }
}