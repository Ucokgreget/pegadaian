"use server";

const API_URL = process.env.API_URL;

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getUsersWithAnalytics(token: string) {
  try {
    const headers = getAuthHeaders(token);
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

export async function deleteUser(token: string, id: number) {
  try {
    const headers = getAuthHeaders(token);
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
  token: string,
  id: number,
  role: "USER" | "ADMIN",
  name?: string,
) {
  try {
    const headers = getAuthHeaders(token);
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
