"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export interface Subscription {
  id: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  user: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    price: number;
    durationDays: number;
  };
  startDate?: string;
  endDate?: string;
  paymentProofName?: string;
  adminNotes?: string;
  createdAt: string;
}

export type UpdateSubscriptionInput = {
  status?: "PENDING" | "ACTIVE" | "EXPIRED";
  adminNotes?: string;
};

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getSubscriptions(
  status?: string,
): Promise<Subscription[]> {
  try {
    const headers = await getAuthHeaders();
    const query = status ? `?status=${status}` : "";
    const res = await fetch(`${API_URL}/subscription${query}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      // If 404 (no subs)
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("GetSubscriptions error:", error);
    return [];
  }
}

export async function updateSubscription(
  id: number,
  data: UpdateSubscriptionInput,
): Promise<Subscription> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/subscription/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update subscription");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdateSubscription error:", error);
    throw error;
  }
}

export async function deleteSubscription(
  id: number,
): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/subscription/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to delete subscription");
    }

    return await res.json();
  } catch (error) {
    console.error("DeleteSubscription error:", error);
    throw error;
  }
}
