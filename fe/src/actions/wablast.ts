"use server";

const API_URL = process.env.API_URL;

export interface Blast {
  id: number;
  message: string;
  recipients: string[];
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export async function getBlastMessages(token: string): Promise<Blast[]> {
  try {
    const res = await fetch(`${API_URL}/chatbot/blast`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("GetBlastMessages error:", error);
    return [];
  }
}

export async function createBlast(token: string, message: string, recipients: string[]) {
  try {
    const res = await fetch(`${API_URL}/chatbot/blast`, {
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
