"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  userId: number;
}

export type CreateProductInput = Omit<Product, "id" | "userId">;
export type UpdateProductInput = Partial<CreateProductInput>;

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/product`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return await res.json();
  } catch (error) {
    console.error("GetProducts error:", error);
    return [];
  }
}

export async function createProduct(
  data: CreateProductInput,
): Promise<Product> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/product`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to create product");
    }

    return await res.json();
  } catch (error) {
    console.error("CreateProduct error:", error);
    throw error;
  }
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput,
): Promise<Product> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/product/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update product");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdateProduct error:", error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/product/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to delete product");
    }

    return await res.json();
  } catch (error) {
    console.error("DeleteProduct error:", error);
    throw error;
  }
}
