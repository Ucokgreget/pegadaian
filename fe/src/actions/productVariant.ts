"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export interface ProductVariant {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    productId: number;
    sku: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreateProductVariantInput = Omit<ProductVariant, "id" | "createdAt" | "updatedAt" | "sku" | "isActive"> & { sku?: string };
export type UpdateProductVariantInput = Partial<CreateProductVariantInput>;

async function resolveToken(token?: string): Promise<string> {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value || "";
    return cookieToken || token?.trim() || "";
}

async function getAuthHeaders(token: string) {
    const finalToken = await resolveToken(token);
    return {
        Authorization: `Bearer ${finalToken}`,
        "Content-Type": "application/json",
    };
}

async function getAuthHeadersForFormData(token: string) {
    const finalToken = await resolveToken(token);
    return {
        Authorization: `Bearer ${finalToken}`,
    };
}

export async function getProductVariants(token: string): Promise<ProductVariant[]> {
    try {
        const headers = await getAuthHeaders(token);
        const res = await fetch(`${API_URL}/product-variant`, {
            method: "GET",
            headers,
        });

        if (!res.ok) {
            throw new Error("Failed to fetch product variants");
        }

        return await res.json();
    } catch (error) {
        console.error("GetProductVariants error:", error);
        return [];
    }
}

export async function getProductVariantById(token: string, id: number): Promise<ProductVariant | null> {
    try {
        const headers = await getAuthHeaders(token);
        const res = await fetch(`${API_URL}/product-variant/${id}`, {
            method: "GET",
            headers,
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Failed to fetch product variant");
        }

        return await res.json();
    } catch (error) {
        console.error("GetProductVariantById error:", error);
        return null;
    }
}

export async function createProductVariant(
    token: string,
    data: CreateProductVariantInput | FormData,
): Promise<ProductVariant> {
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

        const res = await fetch(`${API_URL}/product-variant`, {
            method: "POST",
            headers,
            body,
        });

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || "Failed to create product variant");
        }

        return await res.json();
    } catch (error) {
        console.error("CreateProductVariant error:", error);
        throw error;
    }
}

export async function updateProductVariant(
    token: string,
    id: number,
    data: UpdateProductVariantInput | FormData,
): Promise<ProductVariant> {
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

        const res = await fetch(`${API_URL}/product-variant/${id}`, {
            method: "PUT",
            headers,
            body,
        });

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || "Failed to update product variant");
        }

        return await res.json();
    } catch (error) {
        console.error("UpdateProductVariant error:", error);
        throw error;
    }
}

export async function deleteProductVariant(token: string, id: number): Promise<{ message: string }> {
    try {
        const headers = await getAuthHeaders(token);
        const res = await fetch(`${API_URL}/product-variant/${id}`, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || "Failed to delete product variant");
        }

        return await res.json();
    } catch (error) {
        console.error("DeleteProductVariant error:", error);
        throw error;
    }
}
