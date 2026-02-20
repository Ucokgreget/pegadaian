"use server";

const API_URL = process.env.API_URL;

export interface Package {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  subscriptions?: any[];
  createdAt: string;
}

export type CreatePackageInput = Omit<
  Package,
  "id" | "createdAt" | "subscriptions"
>;
export type UpdatePackageInput = Partial<CreatePackageInput>;

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getPackages(token: string): Promise<Package[]> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/package`, {
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

export async function createPackage(
  token: string,
  data: CreatePackageInput,
): Promise<Package> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/package`, {
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

export async function updatePackage(
  token: string,
  id: number,
  data: UpdatePackageInput,
): Promise<Package> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/package/${id}`, {
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

export async function deletePackage(token: string, id: number): Promise<{ message: string }> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/package/${id}`, {
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
