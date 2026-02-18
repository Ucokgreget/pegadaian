"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getUsersWithAnalytics() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/user-analytics`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user analytics");
    }

    return await res.json();
  } catch (error) {
    console.error("GetUsersWithAnalytics error:", error);
    // Return safe default struct
    return {
      users: [],
      analytics: {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalProducts: 0,
        totalRevenue: 0,
      },
    };
  }
}

export async function deleteUser(id: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/user/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to delete user");
    }

    return await res.json();
  } catch (error) {
    console.error("DeleteUser error:", error);
    throw error;
  }
}

export async function updateUserRole(
  id: number,
  role: "USER" | "ADMIN",
  name?: string,
) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/user/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ role, name }),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update user");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdateUserRole error:", error);
    throw error;
  }
}
