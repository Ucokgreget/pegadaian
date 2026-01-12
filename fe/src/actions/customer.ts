"use server";

import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:8000";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  userId: number;
}

export type CreateCustomerInput = Omit<Customer, "id" | "createdAt" | "userId">;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/customer`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
        throw new Error("Failed to fetch customers");
    }

    return await res.json();
  } catch (error) {
    console.error("GetCustomers error:", error);
    return [];
  }
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/customer`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to create customer");
    }

    return await res.json();
  } catch (error) {
    console.error("CreateCustomer error:", error);
    throw error;
  }
}

export async function updateCustomer(id: number, data: UpdateCustomerInput): Promise<Customer> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/customer/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to update customer");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdateCustomer error:", error);
    throw error;
  }
}

export async function deleteCustomer(id: number): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_URL}/customer/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete customer");
    }

    return await res.json();
  } catch (error) {
     console.error("DeleteCustomer error:", error);
     throw error;
  }
}
