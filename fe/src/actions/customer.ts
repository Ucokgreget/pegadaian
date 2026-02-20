"use server";

const API_URL = process.env.API_URL;

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

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getCustomers(token: string): Promise<Customer[]> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/customer`, {
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

export async function createCustomer(
  token: string,
  data: CreateCustomerInput,
): Promise<Customer> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/customer`, {
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

export async function updateCustomer(
  token: string,
  id: number,
  data: UpdateCustomerInput,
): Promise<Customer> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/customer/${id}`, {
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

export async function deleteCustomer(token: string, id: number): Promise<{ message: string }> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${API_URL}/customer/${id}`, {
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
