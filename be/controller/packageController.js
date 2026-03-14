import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";

// Helper: generate key dari name
const generateKey = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    nanoid(4)
  );
};

// GET All Packages
export const getPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });
    return res.json(packages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch packages" });
  }
};

// GET Single Package
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const packageData = await prisma.package.findUnique({
      where: { id: parseInt(id) },
      include: {
        subscriptions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!packageData)
      return res.status(404).json({ error: "Package not found" });
    return res.json(packageData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch package" });
  }
};

// POST Create Package
export const createPackage = async (req, res) => {
  try {
    const {
      name,
      price,
      priceLabel,
      billingPeriod = "monthly",
      isPopular = false,
      isCustomPrice = false,
      isActive = true,
      sortOrder = 0,
      durationDays = 30,
    } = req.body;

    if (!name || price === undefined || !durationDays) {
      return res
        .status(400)
        .json({ error: "name, price, dan durationDays wajib diisi" });
    }

    const key = generateKey(name);

    const newPackage = await prisma.package.create({
      data: {
        key,
        name,
        price: parseInt(price),
        priceLabel: priceLabel || null,
        billingPeriod,
        isPopular,
        isCustomPrice,
        isActive,
        sortOrder: parseInt(sortOrder),
        durationDays: parseInt(durationDays),
      },
    });

    return res.status(201).json(newPackage);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Package name or key already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create package" });
  }
};

// PUT Update Package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      priceLabel,
      billingPeriod,
      isPopular,
      isCustomPrice,
      isActive,
      sortOrder,
      durationDays,
    } = req.body;

    if (!name || price === undefined || !durationDays) {
      return res
        .status(400)
        .json({ error: "name, price, dan durationDays wajib diisi" });
    }

    const updatedPackage = await prisma.package.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseInt(price),
        priceLabel: priceLabel ?? null,
        billingPeriod: billingPeriod ?? "monthly",
        isPopular: isPopular ?? false,
        isCustomPrice: isCustomPrice ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        durationDays: parseInt(durationDays),
      },
    });

    return res.json(updatedPackage);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Package not found" });
    if (error.code === "P2002")
      return res.status(409).json({ error: "Package name already exists" });
    console.error(error);
    return res.status(500).json({ error: "Failed to update package" });
  }
};

// PATCH Toggle isActive
export const togglePackageActive = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.package.findUnique({
      where: { id: parseInt(id) },
    });
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    const updated = await prisma.package.update({
      where: { id: parseInt(id) },
      data: { isActive: !pkg.isActive },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to toggle package status" });
  }
};

// DELETE Package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const packageId = parseInt(id);

    const activeSubscriptions = await prisma.subscription.count({
      where: { packageId, status: "ACTIVE" },
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        error: "Tidak bisa hapus package yang masih memiliki subscriber aktif",
      });
    }

    await prisma.$transaction([
      prisma.packageFeature.deleteMany({ where: { packageId } }),
      prisma.invoiceItem.deleteMany({ where: { packageId } }),
      prisma.orderItem.deleteMany({ where: { packageId } }),
      prisma.order.deleteMany({ where: { packageId } }),
      prisma.subscription.deleteMany({ where: { packageId } }),
      prisma.package.delete({ where: { id: packageId } }),
    ]);

    return res.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Delete package error:", error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Package not found" });
    return res.status(500).json({ error: "Failed to delete package" });
  }
};

export const getPublicPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        price: true,
        priceLabel: true,
        billingPeriod: true,
        isPopular: true,
        isCustomPrice: true,
        isActive: true,
        sortOrder: true,
        durationDays: true,
      },
    });
    return res.json(packages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch packages" });
  }
};
