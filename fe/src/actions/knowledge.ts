"use server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

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

export async function getKnowledgeDocuments(token: string): Promise<any[]> {
  try {
    const headers = await getAuthHeaders(token);
    const res = await fetch(`${API_URL}/api/knowledge`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch knowledge documents");
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("GetKnowledgeDocuments error:", error);
    return [];
  }
}

export async function uploadKnowledgeDocument(
  token: string,
  data: FormData,
): Promise<any> {
  try {
    const headers = await getAuthHeadersForFormData(token);

    const res = await fetch(`${API_URL}/api/knowledge/upload`, {
      method: "POST",
      headers,
      body: data,
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to upload knowledge document");
    }

    return await res.json();
  } catch (error) {
    console.error("UploadKnowledgeDocument error:", error);
    throw error;
  }
}
