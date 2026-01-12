import { prisma } from "../lib/prisma.js";

export const getMe = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: {
            package: {
              select: {
                id: true,
                name: true,
                price: true,
                durationDays: true,
              },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Ada yang salah" });
  }
};
