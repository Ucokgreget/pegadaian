"use server";

import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:8000";

export interface Package {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  subscriptions?: any[]; // Simplified for display count
  createdAt: string;
}

export type CreatePackageInput = Omit<Package, "id" | "createdAt" | "subscriptions">;
export type UpdatePackageInput = Partial<CreatePackageInput>;

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getPackages(): Promise<Package[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/package`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch packages");
    }

    return await res.json();
  } catch (error) {
    console.error("GetPackages error:", error);
    return [];
  }
}

export async function createPackage(data: CreatePackageInput): Promise<Package> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/package`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to create package");
    }

    return await res.json();
  } catch (error) {
    console.error("CreatePackage error:", error);
    throw error;
  }
}

export async function updatePackage(id: number, data: UpdatePackageInput): Promise<Package> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/package/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update package");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdatePackage error:", error);
    throw error;
  }
}

export async function deletePackage(id: number): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/package/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to delete package");
    }

    return await res.json();
  } catch (error) {
    console.error("DeletePackage error:", error);
    throw error;
  }
}
