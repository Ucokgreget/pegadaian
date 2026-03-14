import { prisma } from "../lib/prisma.js";

// GET All
export const getPromoCodes = async (req, res) => {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(promos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch promo codes" });
  }
};

// GET Single
export const getPromoCodeById = async (req, res) => {
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!promo) return res.status(404).json({ error: "Promo code not found" });
    return res.json(promo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch promo code" });
  }
};

// POST validate (untuk dipakai user saat checkout)
export const validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code wajib diisi" });

    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (!promo)
      return res.status(404).json({ error: "Kode promo tidak ditemukan" });
    if (!promo.isActive)
      return res.status(400).json({ error: "Kode promo tidak aktif" });

    const now = new Date();
    const start = new Date(promo.startAt);
    const end = new Date(promo.endAt);
    end.setHours(23, 59, 59, 999);

    if (now < start)
      return res.status(400).json({ error: "Kode promo belum berlaku" });
    if (now > end)
      return res.status(400).json({ error: "Kode promo sudah kadaluarsa" });
    if (promo.quota !== null && promo.used >= promo.quota) {
      return res.status(400).json({ error: "Kuota kode promo sudah habis" });
    }

    return res.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        maxDiscount: promo.maxDiscount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to validate promo code" });
  }
};

// POST Create
export const createPromoCode = async (req, res) => {
  try {
    const { code, type, value, maxDiscount, quota, startAt, endAt, isActive } =
      req.body;

    if (!code || !type || value === undefined || !startAt || !endAt) {
      return res
        .status(400)
        .json({ error: "code, type, value, startAt, endAt wajib diisi" });
    }

    if (!["fixed", "percent"].includes(type)) {
      return res.status(400).json({ error: "type harus fixed atau percent" });
    }

    if (type === "percent" && (value < 1 || value > 100)) {
      return res.status(400).json({ error: "Nilai persen harus antara 1-100" });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        type,
        value: parseInt(value),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        quota: quota ? parseInt(quota) : null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        isActive: isActive ?? true,
      },
    });

    return res.status(201).json(promo);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Kode promo sudah digunakan" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create promo code" });
  }
};

// PUT Update
export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, maxDiscount, quota, startAt, endAt, isActive } =
      req.body;

    if (!code || !type || value === undefined || !startAt || !endAt) {
      return res
        .status(400)
        .json({ error: "code, type, value, startAt, endAt wajib diisi" });
    }

    const promo = await prisma.promoCode.update({
      where: { id: parseInt(id) },
      data: {
        code: code.toUpperCase().trim(),
        type,
        value: parseInt(value),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        quota: quota ? parseInt(quota) : null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        isActive: isActive ?? true,
      },
    });

    return res.json(promo);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Promo code not found" });
    if (error.code === "P2002")
      return res.status(409).json({ error: "Kode promo sudah digunakan" });
    console.error(error);
    return res.status(500).json({ error: "Failed to update promo code" });
  }
};

// PATCH toggle isActive
export const togglePromoActive = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await prisma.promoCode.findUnique({
      where: { id: parseInt(id) },
    });
    if (!promo) return res.status(404).json({ error: "Promo code not found" });

    const updated = await prisma.promoCode.update({
      where: { id: parseInt(id) },
      data: { isActive: !promo.isActive },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to toggle promo status" });
  }
};

// DELETE
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promoCode.delete({ where: { id: parseInt(id) } });
    return res.json({ message: "Promo code deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Promo code not found" });
    console.error(error);
    return res.status(500).json({ error: "Failed to delete promo code" });
  }
};
