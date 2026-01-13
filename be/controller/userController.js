import { prisma } from "../lib/prisma.js";

// GET All Users with Analytics
export const getUsersWithAnalytics = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
            include: {
                package: true
            },
            orderBy: { createdAt: 'desc' }
        },
        _count: {
            select: {
                products: true,
                customers: true
            }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Analytics
    const totalUsers = users.length;
    const activeSubscriptions = await prisma.subscription.count({
        where: { status: 'ACTIVE' }
    });
    const totalProducts = await prisma.product.count();
    
    // Calculate total revenue from ALL active/expired subscriptions (assuming paid)
    // For more accuracy, payment status should be checked if available. Assuming ACTIVE/EXPIRED means paid.
    const paidSubs = await prisma.subscription.findMany({
        where: {
            status: { in: ['ACTIVE', 'EXPIRED'] }
        },
        include: {
            package: true
        }
    });
    
    const totalRevenue = paidSubs.reduce((acc, sub) => acc + (sub.package?.price || 0), 0);

    return res.json({
        users,
        analytics: {
            totalUsers,
            activeSubscriptions,
            totalProducts,
            totalRevenue
        }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch users data" });
  }
};

// PUT Update User (Role/Name)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name } = req.body;
        
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                role,
                name
            }
        });
        
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update user" });
    }
}

// DELETE User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete related data handled by cascade in schema usually, 
        // but if not, Prisma needs user to delete relations first.
        // Assuming schema has onDelete: Cascade, simple delete works.
        // If not, we might need a transaction.
        
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
}
