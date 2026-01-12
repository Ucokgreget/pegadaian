import { prisma } from "../lib/prisma.js";

// GET All Subscriptions (with filtering)
export const getSubscriptions = async (req, res) => {
  try {
    const { status, userId } = req.query;

    // Membangun objek filter secara dinamis
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);

    const subscriptions = await prisma.userSubscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(subscriptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

// GET Single Subscription by ID
export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.userSubscription.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
          },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    return res.json(subscription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

// POST Create Subscription
export const createSubscription = async (req, res) => {
  try {
    const { userId, packageId, paymentProofUrl, paymentProofName, adminNotes } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({ error: "User ID and Package ID are required" });
    }

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: parseInt(userId),
        packageId: parseInt(packageId),
        paymentProofUrl,
        paymentProofName,
        adminNotes,
        status: "PENDING", // Default status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
          },
        },
      },
    });

    return res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
};

// PUT Update Subscription
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, startDate, endDate } = req.body;

    const updateData = {};

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    // Logika khusus: Jika status diubah jadi ACTIVE dan startDate belum ada
    if (status === "ACTIVE" && !startDate) {
      // Ambil data langganan saat ini untuk dapat durasi paket
      const subscription = await prisma.userSubscription.findUnique({
        where: { id: parseInt(id) },
        include: { package: true },
      });

      if (subscription) {
        updateData.startDate = new Date();
        // Hitung endDate: sekarang + durasi hari (dalam milidetik)
        updateData.endDate = new Date(
          Date.now() + subscription.package.durationDays * 24 * 60 * 60 * 1000
        );
      }
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
          },
        },
      },
    });

    return res.json(updatedSubscription);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subscription not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to update subscription" });
  }
};

// DELETE Subscription
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.userSubscription.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subscription not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to delete subscription" });
  }
};
