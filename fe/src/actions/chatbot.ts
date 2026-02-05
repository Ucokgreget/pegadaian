"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function getChatbotSettings() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API_URL}/chatbot/runtime`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // If 404, might return default settings
      if (res.status === 404) {
        return {
          isActive: false,
          welcomeMessage: "",
          fontteToken: "",
          device: "",
          aiPrompt: "",
        };
      }
      throw new Error("Failed to fetch settings");
    }

    return await res.json();
  } catch (error) {
    console.error("GetChatbotSettings error:", error);
    // Return default empty settings on error to prevent crash
    return {
      isActive: false,
      welcomeMessage: "",
      fontteToken: "",
      device: "",
      aiPrompt: "",
    };
  }
}

export async function updateChatbotSettings(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API_URL}/chatbot/settings`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update settings");
    }

    return await res.json();
  } catch (error) {
    console.error("UpdateChatbotSettings error:", error);
    throw error;
  }
}

export async function testChatbot(message: string, customPrompt?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API_URL}/chatbot/test`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, customPrompt }),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to test chatbot");
    }

    return await res.json();
  } catch (error) {
    console.error("TestChatbot error:", error);
    throw error;
  }
}

export async function connectChatbot() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API_URL}/chatbot/connect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to connect chatbot");
    }

    return await res.json();
  } catch (error) {
    console.error("ConnectChatbot error:", error);
    throw error;
  }
}

export async function disconnectChatbot() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API_URL}/chatbot/disconnect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to disconnect chatbot");
    }

    return await res.json();
  } catch (error) {
    console.error("DisconnectChatbot error:", error);
    throw error;
  }
}
