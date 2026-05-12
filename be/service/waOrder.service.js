import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import crypto from "crypto";

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const TRIPAY_BASE_URL =
  process.env.TRIPAY_MODE === "production"
    ? "https://tripay.co.id/api"
    : "https://tripay.co.id/api-sandbox";

const generateOrderCode = () =>
  `WA-${Date.now()}-${nanoid(6).toUpperCase()}`;

const generateSignature = (merchantRef, amount) => {
  return crypto
    .createHmac("sha256", TRIPAY_PRIVATE_KEY)
    .update(`${TRIPAY_MERCHANT_CODE}${merchantRef}${amount}`)
    .digest("hex");
};

// ===== SESSION MANAGEMENT =====
// senderPhone → { step, cart, shippingData }
const checkoutSessions = new Map();

export function getSession(senderPhone) {
  return checkoutSessions.get(senderPhone) ?? null;
}

export function setSession(senderPhone, data) {
  const current = checkoutSessions.get(senderPhone) ?? {};
  checkoutSessions.set(senderPhone, { ...current, ...data });
}

export function clearSession(senderPhone) {
  checkoutSessions.delete(senderPhone);
}

// Cleanup session lama setiap 30 menit (session expired setelah 2 jam)
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [phone, session] of checkoutSessions.entries()) {
    if (session.startedAt && now - session.startedAt > SESSION_EXPIRY_MS) {
      checkoutSessions.delete(phone);
      console.log(`🧹 Checkout session expired: ${phone}`);
    }
  }
}, 30 * 60 * 1000);

// ===== CART =====
export function addToCart(senderPhone, item) {
  const session = getSession(senderPhone) ?? {};
  const cart = session.cart ?? [];

  // Cek apakah item yang sama sudah ada di cart
  const existingIndex = cart.findIndex(
    (c) => c.productId === item.productId && c.variantId === item.variantId,
  );

  if (existingIndex >= 0) {
    cart[existingIndex].qty += item.qty ?? 1;
    cart[existingIndex].total = cart[existingIndex].price * cart[existingIndex].qty;
  } else {
    cart.push({
      productId: item.productId,
      variantId: item.variantId ?? null,
      productName: item.productName,
      variantName: item.variantName ?? null,
      price: item.price,
      qty: item.qty ?? 1,
      total: item.price * (item.qty ?? 1),
    });
  }

  setSession(senderPhone, { cart, startedAt: Date.now() });
}

export function getCartSummary(senderPhone) {
  const session = getSession(senderPhone);
  if (!session?.cart || session.cart.length === 0) return null;

  const subtotal = session.cart.reduce((sum, item) => sum + item.total, 0);
  return { items: session.cart, subtotal };
}

// ===== CHECKOUT STEPS =====
export const CHECKOUT_STEPS = {
  IDLE: "IDLE",
  CONFIRM_CART: "CONFIRM_CART",
  ASK_NAME: "ASK_NAME",
  ASK_PHONE: "ASK_PHONE",
  ASK_ADDRESS: "ASK_ADDRESS",
  ASK_CITY: "ASK_CITY",
  ASK_POSTAL: "ASK_POSTAL",
  ASK_NOTES: "ASK_NOTES",
  CONFIRM_ORDER: "CONFIRM_ORDER",
  WAITING_PAYMENT: "WAITING_PAYMENT",
};

export function getCurrentStep(senderPhone) {
  const session = getSession(senderPhone);
  return session?.step ?? CHECKOUT_STEPS.IDLE;
}

export function setStep(senderPhone, step) {
  setSession(senderPhone, { step });
}

// ===== CREATE ORDER + TRIPAY =====
export async function createWAOrder({ userId, senderPhone, user }) {
  const session = getSession(senderPhone);
  if (!session?.cart || !session?.shippingData) {
    throw new Error("Session tidak lengkap");
  }

  const { cart, shippingData } = session;
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const orderCode = generateOrderCode();
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const signature = generateSignature(orderCode, subtotal);

  // Build order items untuk Tripay
  const tripayItems = cart.map((item) => ({
    sku: `PROD-${item.productId}${item.variantId ? `-VAR-${item.variantId}` : ""}`,
    name: item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName,
    price: item.price,
    quantity: item.qty,
    product_url: process.env.FRONTEND_URL || "https://example.com",
    image_url: "",
  }));

  const tripayPayload = {
    method: "QRIS",
    merchant_ref: orderCode,
    amount: subtotal,
    customer_name: shippingData.customerName,
    customer_email: user.email ?? "customer@example.com",
    customer_phone: shippingData.customerPhone,
    order_items: tripayItems,
    callback_url: `${process.env.BACKEND_URL}/checkout/wa-callback`,
    return_url: `${process.env.FRONTEND_URL}/order/success`,
    expired_time: Math.floor(dueDate.getTime() / 1000),
    signature,
  };

  const tripayRes = await fetch(`${TRIPAY_BASE_URL}/transaction/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TRIPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripayPayload),
  });

  const tripayData = await tripayRes.json();
  if (!tripayData.success) {
    throw new Error(tripayData.message || "Gagal membuat transaksi Tripay");
  }

  const tripayTransaction = tripayData.data;

  // Simpan ke DB
  const waOrder = await prisma.wAOrder.create({
    data: {
      userId,
      senderPhone,
      customerName: shippingData.customerName,
      customerPhone: shippingData.customerPhone,
      address: shippingData.address,
      city: shippingData.city,
      postalCode: shippingData.postalCode ?? null,
      notes: shippingData.notes ?? null,
      subtotal,
      status: "PENDING_PAYMENT",
      orderCode,
      tripayReference: tripayTransaction.reference,
      paymentUrl: tripayTransaction.checkout_url,
      items: {
        create: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          productName: item.productName,
          variantName: item.variantName ?? null,
          price: item.price,
          qty: item.qty,
          total: item.total,
        })),
      },
    },
    include: { items: true },
  });

  return {
    waOrder,
    paymentUrl: tripayTransaction.checkout_url,
    orderCode,
  };
}

// ===== HANDLE TRIPAY CALLBACK =====
export async function handleWAOrderCallback({ merchant_ref, reference }) {
  const waOrder = await prisma.wAOrder.findUnique({
    where: { orderCode: merchant_ref },
    include: { user: true },
  });

  if (!waOrder) throw new Error("WAOrder tidak ditemukan");
  if (waOrder.status === "PAID") return waOrder; // idempotent

  const updated = await prisma.wAOrder.update({
    where: { orderCode: merchant_ref },
    data: {
      status: "PAID",
      tripayReference: reference,
      paidAt: new Date(),
    },
    include: { items: true, user: true },
  });

  return updated;
}

// ===== FORMAT MESSAGES =====
export function formatCartMessage(senderPhone) {
  const cart = getCartSummary(senderPhone);
  if (!cart) return null;

  let msg = "*🛒 Keranjang Belanja*\n\n";
  cart.items.forEach((item, i) => {
    const name = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    msg += `${i + 1}. ${name}\n`;
    msg += `   Rp ${item.price.toLocaleString("id-ID")} x${item.qty} = *Rp ${item.total.toLocaleString("id-ID")}*\n\n`;
  });

  msg += `*Total: Rp ${cart.subtotal.toLocaleString("id-ID")}*\n\n`;
  msg += `Ketik *LANJUT* untuk isi data pengiriman\nKetik *BATAL* untuk cancel`;
  return msg;
}

export function formatOrderConfirmation(senderPhone) {
  const session = getSession(senderPhone);
  if (!session?.cart || !session?.shippingData) return null;

  const cart = getCartSummary(senderPhone);
  const s = session.shippingData;

  let msg = "*📋 Konfirmasi Pesanan*\n\n";
  msg += "*Produk:*\n";
  session.cart.forEach((item, i) => {
    const name = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    msg += `${i + 1}. ${name} x${item.qty} - *Rp ${item.total.toLocaleString("id-ID")}*\n`;
  });

  msg += `\n*Total: Rp ${cart.subtotal.toLocaleString("id-ID")}*\n\n`;
  msg += `*Data Pengiriman:*\n`;
  msg += `- Nama: ${s.customerName}\n`;
  msg += `- HP: ${s.customerPhone}\n`;
  msg += `- Alamat: ${s.address}\n`;
  msg += `- Kota: ${s.city}\n`;
  if (s.postalCode) msg += `- Kode Pos: ${s.postalCode}\n`;
  if (s.notes) msg += `- Catatan: ${s.notes}\n`;

  msg += `\nKetik *BAYAR* untuk lanjut ke pembayaran\nKetik *BATAL* untuk cancel`;
  return msg;
}

export function formatPaymentMessage(orderCode, paymentUrl) {
  let msg = `✅ *Pesanan Berhasil Dibuat!*\n\n`;
  msg += `*Kode Order:* ${orderCode}\n\n`;
  msg += `Silakan selesaikan pembayaran melalui link berikut:\n`;
  msg += `${paymentUrl}\n\n`;
  msg += `_Link pembayaran berlaku selama 24 jam._`;
  return msg;
}

export function formatPaidNotification(waOrder) {
  let msg = `🎉 *Pembayaran Berhasil!*\n\n`;
  msg += `*Kode Order:* ${waOrder.orderCode}\n`;
  msg += `*Nama:* ${waOrder.customerName}\n\n`;
  msg += `*Produk:*\n`;
  waOrder.items.forEach((item) => {
    const name = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    msg += `- ${name} x${item.qty}\n`;
  });
  msg += `\n*Total: Rp ${waOrder.subtotal.toLocaleString("id-ID")}*\n\n`;
  msg += `Pesanan kamu sedang kami proses. Terima kasih! 😊`;
  return msg;
}

export function formatOwnerNotification(waOrder) {
  let msg = `🔔 *Order Baru Masuk!*\n\n`;
  msg += `*Kode:* ${waOrder.orderCode}\n`;
  msg += `*Customer:* ${waOrder.customerName} (${waOrder.customerPhone})\n`;
  msg += `*Alamat:* ${waOrder.address}, ${waOrder.city}`;
  if (waOrder.postalCode) msg += ` ${waOrder.postalCode}`;
  msg += `\n\n*Produk:*\n`;
  waOrder.items.forEach((item) => {
    const name = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    msg += `- ${name} x${item.qty} - Rp ${item.total.toLocaleString("id-ID")}\n`;
  });
  msg += `\n*Total: Rp ${waOrder.subtotal.toLocaleString("id-ID")}*`;
  if (waOrder.notes) msg += `\n*Catatan:* ${waOrder.notes}`;
  return msg;
}