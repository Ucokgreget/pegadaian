import { prisma } from "../lib/prisma.js";

// GET All Packages
export const getPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.json(packages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch packages" });
  }
};

// GET Single Package (with Subscriptions)
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const packageData = await prisma.package.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!packageData) {
      return res.status(404).json({ error: "Package not found" });
    }

    return res.json(packageData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch package" });
  }
};

// POST Create Package
export const createPackage = async (req, res) => {
  try {
    const { name, price, durationDays } = req.body;

    if (!name || !price || !durationDays) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPackage = await prisma.package.create({
      data: {
        name,
        price: parseInt(price),
        durationDays: parseInt(durationDays),
      },
    });

    return res.status(201).json(newPackage);
  } catch (error) {
    // Handle Unique Constraint Violation (Name sudah ada)
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Package name already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create package" });
  }
};

// PUT Update Package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, durationDays } = req.body;

    if (!name || !price || !durationDays) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedPackage = await prisma.package.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        price: parseInt(price),
        durationDays: parseInt(durationDays),
      },
    });

    return res.json(updatedPackage);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Package name already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to update package" });
  }
};

// DELETE Package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah ada subscription aktif yang menggunakan package ini
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        packageId: parseInt(id),
        status: "ACTIVE",
      },
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        error: "Cannot delete package with active subscriptions",
      });
    }

    await prisma.package.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.json({ message: "Package deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to delete package" });
  }
};
