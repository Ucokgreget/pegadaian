// paymentController.js
import { prisma } from "../lib/prisma.js";
import { convertQRIS } from "../lib/qris/index.js";
import QRCode from "qrcode";
import { sendWAMessage } from "../bot/spawnBot.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Hitung total order dari subtotal atau fallback ke sum of items.
 * @param {{ subtotal?: number|null, items: { total: number }[] }} waOrder
 */
function calcTotal(waOrder) {
  if (waOrder.subtotal != null && waOrder.subtotal > 0) {
    return waOrder.subtotal;
  }
  return waOrder.items.reduce((sum, item) => sum + item.total, 0);
}

// ─── #4 Generate QRIS Dinamis ─────────────────────────────────────────────────

/**
 * POST /api/wa-orders/:orderCode/payment-qr
 *
 * Ambil WAOrder → hitung total → ambil QRIS statis merchant →
 * convert ke QRIS dinamis → generate QR image (base64).
 * TIDAK disimpan ke DB.
 */
export const generatePaymentQR = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const userId = parseInt(req.user?.id);

    const waOrder = await prisma.wAOrder.findUnique({
      where: { orderCode },
      include: { items: true },
    });

    if (!waOrder) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    // Merchant (owner) atau ADMIN yang bisa generate QR
    if (waOrder.userId !== userId && req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Tidak memiliki akses ke order ini" });
    }

    const total = calcTotal(waOrder);
    if (total <= 0) {
      return res.status(400).json({ error: "Total order tidak valid (0 atau negatif)" });
    }

    // Ambil QRIS statis milik merchant pemilik order
    const merchant = await prisma.user.findUnique({
      where: { id: waOrder.userId },
      select: { qrisStatic: true },
    });

    if (!merchant?.qrisStatic) {
      return res.status(400).json({
        error: "QRIS belum diatur oleh merchant. Hubungi merchant untuk mengatur QRIS terlebih dahulu.",
      });
    }

    // Convert static → dynamic QRIS
    const qrString = convertQRIS(merchant.qrisStatic, { amount: total });

    // Generate QR image sebagai base64 data URL
    const qrImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "M",
      width: 400,
      margin: 2,
    });

    if (waOrder.senderPhone) {
      try {
        const itemLines = waOrder.items
          .map((item) => {
            const name = item.variantName
              ? `${item.productName} - ${item.variantName}`
              : item.productName;
            return `• ${name} x${item.qty} — Rp ${item.total.toLocaleString("id-ID")}`;
          })
          .join("\n");

        const caption = [
          `💳 *Pembayaran QRIS*`,
          ``,
          `*Produk:*`,
          itemLines,
          ``,
          `💰 Total: *Rp ${total.toLocaleString("id-ID")}*`,
          `📦 Order: \`${orderCode}\``,
          ``,
          `_Scan QR di atas dengan aplikasi bank / e-wallet._`,
          `_Setelah bayar, *kirim screenshot* bukti pembayaran ke sini ✅_`,
        ].join("\n");

        const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
        const phone = waOrder.senderPhone.replace("@s.whatsapp.net", "");
        
        sendWAMessage(waOrder.userId, phone, caption, base64Data);
      } catch (err) {
        console.error("Gagal mengirim WA Message QRIS:", err);
      }
    }

    return res.json({
      qrString,
      qrImage, // "data:image/png;base64,..."
      amount: total,
      orderCode,
    });
  } catch (error) {
    console.error("generatePaymentQR error:", error);
    return res.status(500).json({ error: "Gagal generate QRIS dinamis" });
  }
};

// ─── #5 Upload Bukti Pembayaran ───────────────────────────────────────────────

/**
 * POST /api/wa-orders/:orderCode/payment-proof
 * Content-Type: multipart/form-data  (field: "proof")
 *
 * Upload screenshot bukti bayar → buat/update Payment record →
 * update WAOrder.status ke PENDING_PAYMENT.
 */
export const uploadPaymentProof = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const waOrder = await prisma.wAOrder.findUnique({
      where: { orderCode },
      include: { items: true },
    });

    if (!waOrder) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ error: "File bukti pembayaran wajib diupload (field: proof)" });
    }

    // Normalize path separator (Windows compat)
    const proofUrl = req.file.path.replace(/\\/g, "/");
    const total = calcTotal(waOrder);

    // Cek apakah sudah ada payment record untuk order ini
    const existingPayment = await prisma.payment.findFirst({
      where: { waOrderId: waOrder.id },
    });

    let payment;
    if (existingPayment) {
      // Update proof jika sudah ada (misal: customer re-upload)
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          proofUrl,
          status: "PENDING",
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          userId: waOrder.userId,
          waOrderId: waOrder.id,
          amount: total,
          proofUrl,
          status: "PENDING",
          paymentMethod: "QRIS",
        },
      });
    }

    // Update WAOrder status ke PENDING_PAYMENT (menunggu verifikasi admin/merchant)
    await prisma.wAOrder.update({
      where: { id: waOrder.id },
      data: { status: "PENDING_PAYMENT" },
    });

    return res.status(201).json({
      message: "Bukti pembayaran berhasil diupload. Menunggu verifikasi.",
      payment,
      orderCode,
    });
  } catch (error) {
    console.error("uploadPaymentProof error:", error);
    return res.status(500).json({ error: "Gagal upload bukti pembayaran" });
  }
};

// ─── #6 Verifikasi Pembayaran (Admin / Merchant) ──────────────────────────────

/**
 * PATCH /api/payments/:id/verify
 * Body: { status: "PAID" | "FAILED" }
 *
 * Verifikasi manual bukti bayar.
 * Akses: ADMIN atau merchant pemilik order.
 * Kalau PAID → update WAOrder.status + WAOrder.paidAt juga.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = parseInt(req.user?.id);
    const userRole = req.user?.role;

    if (!status || !["PAID", "FAILED"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Field status wajib diisi: 'PAID' atau 'FAILED'" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment tidak ditemukan" });
    }

    // Hanya ADMIN atau merchant pemilik order yang bisa verifikasi
    if (userRole !== "ADMIN" && payment.userId !== userId) {
      return res.status(403).json({
        error: "Tidak memiliki akses untuk verifikasi payment ini",
      });
    }

    const now = new Date();

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        paidAt: status === "PAID" ? now : null,
      },
    });

    // Kalau PAID dan terkait WAOrder → update WAOrder status + paidAt
    if (status === "PAID" && payment.waOrderId) {
      await prisma.wAOrder.update({
        where: { id: payment.waOrderId },
        data: {
          status: "PAID",
          paidAt: now,
        },
      });
    }

    return res.json({
      message:
        status === "PAID"
          ? "Pembayaran berhasil diverifikasi"
          : "Pembayaran ditolak / gagal",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ error: "Gagal verifikasi payment" });
  }
};

// ─── Bonus: List payments (admin/merchant) ────────────────────────────────────

/**
 * GET /api/payments
 *
 * List semua payment milik merchant (atau semua jika ADMIN).
 * Query params: status, waOrderId, page, limit
 */
export const listPayments = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    const userRole = req.user?.role;
    const { status, waOrderId, page = 1, limit = 20 } = req.query;

    const where = {};

    // Non-admin hanya bisa lihat payment mereka sendiri
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    if (status) where.status = status;
    if (waOrderId) where.waOrderId = parseInt(waOrderId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
        include: {
          waOrder: {
            select: {
              orderCode: true,
              customerName: true,
              customerPhone: true,
              status: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return res.json({
      data: payments,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("listPayments error:", error);
    return res.status(500).json({ error: "Gagal mengambil data payment" });
  }
};

/**
 * GET /api/payments/:id
 *
 * Detail satu payment.
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user?.id);
    const userRole = req.user?.role;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        waOrder: {
          include: { items: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment tidak ditemukan" });
    }

    if (userRole !== "ADMIN" && payment.userId !== userId) {
      return res.status(403).json({ error: "Tidak memiliki akses ke payment ini" });
    }

    return res.json(payment);
  } catch (error) {
    console.error("getPaymentById error:", error);
    return res.status(500).json({ error: "Gagal mengambil data payment" });
  }
};
