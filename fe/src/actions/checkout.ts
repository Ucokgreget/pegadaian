"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export interface PaymentChannel {
  name: string;
  code: string;
  group: string;
  type: string;
  fee_merchant: { flat: number; percent: number };
  fee_customer: { flat: number; percent: number };
  total_fee: { flat: number; percent: number };
  minimum_fee: number;
  maximum_fee: number;
  icon_url: string;
  active: boolean;
}

export interface CreateOrderInput {
  packageId: number;
  paymentMethod: string;
  billingMultiplier?: number;
  addonIds?: number[];
  promoCode?: string;
}

export interface CreateOrderResult {
  invoiceId: number;
  invoiceNumber: string;
  paymentUrl: string;
  reference: string;
  amount: number;
  dueDate: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "UNPAID" | "PAID" | "CANCELLED" | "REFUNDED";
  issuedAt: string;
  dueDate: string | null;
  paidAt: string | null;
  meta: {
    paymentMethod: string;
    paymentUrl: string;
    tripayReference: string;
  } | null;
  user: { id: number; name: string; email: string };
  order: { orderCode: string; status: string };
  invoiceItems: {
    id: number;
    description: string;
    qty: number;
    price: number;
    total: number;
    durationDays: number;
    package: { name: string };
  }[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getPaymentChannels(): Promise<PaymentChannel[]> {
  try {
    const res = await fetch(`${API_URL}/checkout/payment-channels`, {
      headers: await getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("getPaymentChannels error:", error);
    return [];
  }
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const res = await fetch(`${API_URL}/checkout/order`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Response tidak valid"); }
  if (!res.ok) throw new Error(data.error || "Gagal membuat order");
  return data;
}

export async function getInvoice(id: number): Promise<Invoice | null> {
  try {
    const res = await fetch(`${API_URL}/checkout/invoice/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getUserInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(`${API_URL}/checkout/invoice`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}