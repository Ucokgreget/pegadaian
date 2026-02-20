"use server";

const API_URL = process.env.API_URL;

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

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getAuthHeadersForFormData(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getProducts(token: string): Promise<Product[]> {
  try {
    const headers = getAuthHeaders(token);
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
      headers = getAuthHeadersForFormData(token);
      body = data;
    } else {
      headers = getAuthHeaders(token);
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
      headers = getAuthHeadersForFormData(token);
      body = data;
    } else {
      headers = getAuthHeaders(token);
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

export async function deleteProduct(token: string, id: number): Promise<{ message: string }> {
  try {
    const headers = getAuthHeaders(token);
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
