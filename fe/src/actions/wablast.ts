"use server";

import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:8000";

export interface Blast {
  id: number;
  message: string;
  recipients: string[]; // Frontend sends/receives array, DB might store JSON string
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export async function getBlastMessages(): Promise<Blast[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/chatbot/blast`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
         // If 404/Empty
         return [];
    }

    const data = await res.json();
    
    // Ensure recipients is parsed if it comes as string (depending on backend implementation)
    // Assuming backend returns it properly formatted or strings.
    // Generally standardizing on array for UI.
    return data;
  } catch (error) {
    console.error("GetBlastMessages error:", error);
    return [];
  }
}

export async function createBlast(message: string, recipients: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/chatbot/blast`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, recipients }),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Gagal membuat broadcast");
    }

    return await res.json();
  } catch (error) {
    console.error("CreateBlast error:", error);
    throw error;
  }
}
