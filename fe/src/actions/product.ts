"use server";
import { cookies } from "next/headers";
import type { Product } from "@/types/Product";

const API_URL = process.env.API_URL;

export type CreateProductInput = Omit<Product, "id" | "userId">;
export type UpdateProductInput = Partial<CreateProductInput>;

async function getAuthHeaders(token: string) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("token")?.value || "";
  const finalToken = cookieToken || token;
  return {
    Authorization: `Bearer ${finalToken}`,
    "Content-Type": "application/json",
  };
}

async function getAuthHeadersForFormData(token: string) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("token")?.value || "";
  const finalToken = cookieToken || token;
  return {
    Authorization: `Bearer ${finalToken}`,
  };
}

export async function getProducts(token: string): Promise<Product[]> {
  try {
    const headers = await getAuthHeaders(token);
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
  token: string,
  data: CreateProductInput | FormData,
): Promise<Product> {
  try {
    let headers;
    let body;

    if (data instanceof FormData) {
      headers = await getAuthHeadersForFormData(token);
      body = data;
    } else {
      headers = await getAuthHeaders(token);
      body = JSON.stringify(data);
    }

    const res = await fetch(`${API_URL}/product`, {
      method: "POST",
      headers,
      body,
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
  token: string,
  id: number,
  data: UpdateProductInput | FormData,
): Promise<Product> {
  try {
    let headers;
    let body;

    if (data instanceof FormData) {
      headers = await getAuthHeadersForFormData(token);
      body = data;
    } else {
      headers = await getAuthHeaders(token);
      body = JSON.stringify(data);
    }

    const res = await fetch(`${API_URL}/product/${id}`, {
      method: "PUT",
      headers,
      body,
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

export async function deleteProduct(
  token: string,
  id: number,
): Promise<{ message: string }> {
  try {
    const headers = await getAuthHeaders(token);
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
