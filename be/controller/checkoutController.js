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

// ── Helper: generate order code ───────────────────────────────────────────
const generateOrderCode = () => `INV-${Date.now()}-${nanoid(6).toUpperCase()}`;

// ── Helper: generate invoice number ──────────────────────────────────────
const generateInvoiceNumber = () =>
  `INV/${new Date().getFullYear()}/${nanoid(8).toUpperCase()}`;

// ── Helper: tripay signature ──────────────────────────────────────────────
const generateSignature = (merchantRef, amount) => {
  return crypto
    .createHmac("sha256", TRIPAY_PRIVATE_KEY)
    .update(`${TRIPAY_MERCHANT_CODE}${merchantRef}${amount}`)
    .digest("hex");
};

// ── GET payment channels ──────────────────────────────────────────────────
export const getPaymentChannels = async (req, res) => {
  try {
    const response = await fetch(
      `${TRIPAY_BASE_URL}/merchant/payment-channel`,
      {
        headers: { Authorization: `Bearer ${TRIPAY_API_KEY}` },
      },
    );
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch payment channels" });
  }
};

// ── POST create order + invoice + tripay transaction ──────────────────────
export const createOrder = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { packageId, paymentMethod } = req.body;

    if (!packageId || !paymentMethod) {
      return res
        .status(400)
        .json({ error: "packageId dan paymentMethod wajib diisi" });
    }

    // Ambil package
    const pkg = await prisma.package.findUnique({
      where: { id: parseInt(packageId) },
    });
    if (!pkg) return res.status(404).json({ error: "Package tidak ditemukan" });
    if (!pkg.isActive)
      return res.status(400).json({ error: "Package tidak aktif" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    const orderCode = generateOrderCode();
    const invoiceNumber = generateInvoiceNumber();
    const amount = pkg.price;
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    // Buat tripay transaction
    const signature = generateSignature(orderCode, amount);

    const tripayPayload = {
      method: paymentMethod,
      merchant_ref: orderCode,
      amount,
      customer_name: user.name || user.email,
      customer_email: user.email,
      customer_phone: "08123456789",
      order_items: [
        {
          sku: pkg.key,
          name: pkg.name,
          price: amount,
          quantity: 1,
          product_url: process.env.NEXT_PUBLIC_BASE_URL || "https://sijaka.id",
          image_url: "",
        },
      ],
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/invoice`,
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
      return res.status(400).json({
        error: tripayData.message || "Gagal membuat transaksi Tripay",
      });
    }

    const tripayTransaction = tripayData.data;

    // Simpan ke DB dalam satu transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Order
      const order = await tx.order.create({
        data: {
          userId,
          packageId: pkg.id,
          orderCode,
          type: "subscription",
          reference: tripayTransaction.reference,
          amount,
          status: "PENDING",
          tripayReference: tripayTransaction.reference,
          tripayPayload: tripayTransaction,
        },
      });

      // 2. Buat OrderItem
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          packageId: pkg.id,
          itemType: "package",
          itemName: pkg.name,
          qty: 1,
          price: amount,
          total: amount,
          durationDays: pkg.durationDays,
        },
      });

      // 3. Buat Invoice
      const invoice = await tx.invoice.create({
        data: {
          userId,
          invoiceNumber,
          orderId: order.id,
          subtotal: amount,
          tax: 0,
          total: amount,
          status: "UNPAID",
          issuedAt: new Date(),
          dueDate,
          meta: {
            paymentMethod,
            paymentUrl: tripayTransaction.checkout_url,
            tripayReference: tripayTransaction.reference,
          },
        },
      });

      // 4. Buat InvoiceItem
      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          packageId: pkg.id,
          description: `${pkg.name} - ${pkg.billingPeriod}`,
          qty: 1,
          price: amount,
          total: amount,
          durationDays: pkg.durationDays,
        },
      });

      return { order, invoice };
    });

    return res.status(201).json({
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
      paymentUrl: tripayTransaction.checkout_url,
      reference: tripayTransaction.reference,
      amount,
      dueDate,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ error: "Gagal membuat order" });
  }
};

// ── GET invoice detail ────────────────────────────────────────────────────
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.id);

    const invoice = await prisma.invoice.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        order: true,
        invoiceItems: {
          include: { package: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invoice)
      return res.status(404).json({ error: "Invoice tidak ditemukan" });
    return res.json(invoice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// ── GET user invoices ─────────────────────────────────────────────────────
export const getUserInvoices = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderCode: true, status: true } },
        invoiceItems: { include: { package: { select: { name: true } } } },
      },
    });
    return res.json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// ── POST tripay callback (webhook) ────────────────────────────────────────
export const handleCallback = async (req, res) => {
  try {
    // Verifikasi signature dari Tripay
    const callbackSignature = req.headers["x-callback-signature"];
    const json = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", TRIPAY_PRIVATE_KEY)
      .update(json)
      .digest("hex");

    if (callbackSignature !== expectedSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const { merchant_ref, status, reference } = req.body;

    if (status !== "PAID") {
      return res.json({
        success: true,
        message: "Status bukan PAID, diabaikan",
      });
    }

    // Cari order
    const order = await prisma.order.findUnique({
      where: { orderCode: merchant_ref },
      include: { package: true },
    });

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order tidak ditemukan" });
    if (order.status === "PAID")
      return res.json({ success: true, message: "Sudah diproses" });

    const now = new Date();
    const expiredAt = new Date(
      now.getTime() + order.package.durationDays * 24 * 60 * 60 * 1000,
    );

    await prisma.$transaction(async (tx) => {
      // 1. Update order
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: now, reference },
      });

      // 2. Update invoice
      const invoice = await tx.invoice.update({
        where: { orderId: order.id },
        data: { status: "PAID", paidAt: now },
      });

      // 3. Nonaktifkan subscription lama jika ada
      await tx.subscription.updateMany({
        where: {
          userId: order.userId,
          packageId: order.packageId,
          status: "ACTIVE",
        },
        data: { status: "CANCELLED", cancelledAt: now },
      });

      // 4. Buat subscription baru
      await tx.subscription.create({
        data: {
          userId: order.userId,
          packageId: order.packageId,
          invoiceId: invoice.id,
          startedAt: now,
          expiredAt,
          status: "ACTIVE",
        },
      });
    });

    return res.json({ success: true, message: "Payment processed" });
  } catch (error) {
    console.error("handleCallback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
