"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export interface PackageFeature {
  id: number;
  packageId: number;
  featureText: string;
  isHighlighted: boolean;
  sortOrder: number;
  createdAt: string;
}

export type CreateFeatureInput = Omit<
  PackageFeature,
  "id" | "packageId" | "createdAt"
>;
export type UpdateFeatureInput = Partial<CreateFeatureInput>;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getFeatures(
  packageId: number,
): Promise<PackageFeature[]> {
  try {
    const url = `${API_URL}/package/${packageId}/features`;
    console.log("fetching:", url); // ← cek URL nya bener tidak
    const res = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    console.log("status:", res.status); // ← cek status
    console.log("content-type:", res.headers.get("content-type")); // ← cek response type

    if (!res.ok) {
      const text = await res.text();
      console.log("response body:", text); // ← lihat isi responsenya
      throw new Error("Failed to fetch features");
    }
    return await res.json();
  } catch (error) {
    console.error("getFeatures error:", error);
    return [];
  }
}

export async function createFeature(
  packageId: number,
  data: CreateFeatureInput,
): Promise<PackageFeature> {
  const res = await fetch(`${API_URL}/package/${packageId}/features`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to create feature");
  }
  return await res.json();
}

export async function updateFeature(
  packageId: number,
  id: number,
  data: UpdateFeatureInput,
): Promise<PackageFeature> {
  const res = await fetch(`${API_URL}/package/${packageId}/features/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to update feature");
  }
  return await res.json();
}

export async function deleteFeature(
  packageId: number,
  id: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/package/${packageId}/features/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to delete feature");
  }
}

export async function reorderFeatures(
  packageId: number,
  items: { id: number; sortOrder: number }[],
): Promise<void> {
  const res = await fetch(`${API_URL}/package/${packageId}/features/reorder`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to reorder features");
  }
}
