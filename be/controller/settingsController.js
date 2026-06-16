// settingsController.js
import { prisma } from "../lib/prisma.js";
import { validateQRIS, parseQRIS } from "../lib/qris/index.js";

/**
 * PUT /api/settings/qris
 * Body: { qrisStatic: string }
 *
 * Validasi QRIS statis lalu simpan ke user.qrisStatic.
 */
export const setQrisStatic = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { qrisStatic } = req.body;

    if (!qrisStatic || typeof qrisStatic !== "string") {
      return res.status(400).json({ error: "Field qrisStatic wajib diisi" });
    }

    // Validasi struktur & CRC QRIS
    const validation = validateQRIS(qrisStatic.trim());
    if (!validation.valid) {
      return res.status(400).json({
        error: "QRIS tidak valid",
        details: validation.errors,
      });
    }

    // Parse untuk info tambahan di response
    const parsed = parseQRIS(qrisStatic.trim());

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { qrisStatic: qrisStatic.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        qrisStatic: true,
      },
    });

    return res.json({
      message: "QRIS statis berhasil disimpan",
      merchantName: parsed.merchantName,
      merchantCity: parsed.merchantCity,
      method: parsed.method,
      user: updatedUser,
    });
  } catch (error) {
    console.error("setQrisStatic error:", error);
    return res.status(500).json({ error: "Gagal menyimpan QRIS statis" });
  }
};

/**
 * GET /api/settings/qris
 *
 * Ambil info QRIS statis merchant (tanpa mengekspos string penuh ke client
 * selain untuk debug — cukup info parsed saja).
 */
export const getQrisStatic = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { qrisStatic: true },
    });

    if (!user?.qrisStatic) {
      return res.json({ configured: false, qrisStatic: null });
    }

    const parsed = parseQRIS(user.qrisStatic);

    return res.json({
      configured: true,
      merchantName: parsed.merchantName,
      merchantCity: parsed.merchantCity,
      method: parsed.method,
      currency: parsed.currency,
      // String lengkap dikembalikan agar frontend bisa preview / re-validate
      qrisStatic: user.qrisStatic,
    });
  } catch (error) {
    console.error("getQrisStatic error:", error);
    return res.status(500).json({ error: "Gagal mengambil info QRIS" });
  }
};
