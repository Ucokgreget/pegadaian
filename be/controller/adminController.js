import { prisma } from "../lib/prisma.js";

export const getAllUsersWithAnalytics = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
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
          orderBy: {
            createdAt: "desc",
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        customers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
            products: true,
            customers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const analytics = {
      totalUsers: users.length,
      totalAdmins: users.filter((user) => user.role === "ADMIN").length,
      totalRegularUsers: users.filter((user) => user.role === "USER").length,
      activeSubscriptions: users.reduce(
        (count, user) =>
          count +
          user.subscriptions.filter((sub) => sub.status === "ACTIVE").length,
        0
      ),
      pendingSubscriptions: users.reduce(
        (count, user) =>
          count +
          user.subscriptions.filter((sub) => sub.status === "PENDING").length,
        0
      ),
      totalProducts: users.reduce(
        (count, user) => count + user._count.products,
        0
      ),
      totalCustomers: users.reduce(
        (count, user) => count + user._count.customers,
        0
      ),
      totalRevenue: users.reduce(
        (total, user) =>
          total +
          user.subscriptions
            .filter((sub) => sub.status === "ACTIVE")
            .reduce((sum, sub) => sum + sub.package.price, 0),
        0
      ),
    };
    return res.status(200).json({ users, analytics });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        subscriptions: {
          include: {
            package: true,
          },
        },
        _count: {
          subscriptions: true,
          customers: true,
          products: true,
        },
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "ada yang salah" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        role,
      },
      include: {
        subscriptions: {
          package: true,
        },
        _count: {
          subscriptions: true,
          customers: true,
          products: true,
        },
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "ada error di server" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUserId = parseInt(req.user.id);

    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: "gabisa hapus akun sendiri" });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json(`berhasil hapus user dengan id = ${id}`);
  } catch (error) {
    return res.status(500).json({ error: "ada yang salah" });
  }
};
