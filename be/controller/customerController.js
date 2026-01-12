import { prisma } from "../lib/prisma.js";

// GET All Customers
export const getCustomers = async (req, res) => {
  try {
    // Pastikan req.user sudah di-set oleh middleware
    const userId = parseInt(req.user?.id || "0");

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const customers = await prisma.customer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(customers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// GET Customer Count
export const getCustomerCount = async (req, res) => {
    try {
        const userId = parseInt(req.user?.id || "0");
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const count = await prisma.customer.count({
            where: { userId }
        });
        return res.json({ count });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch customer count" });
    }
}

// GET Single Customer
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user?.id || "0");

    const customer = await prisma.customer.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.json(customer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// POST Create Customer
export const createCustomer = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id || "0");
    const { name, email, phone, address, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        notes,
        userId,
      },
    });

    return res.status(201).json(customer);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
};

// PUT Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user?.id || "0");
    const { name, email, phone, address, notes } = req.body;

    // Validasi input
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Cek keberadaan customer milik user ini
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        address,
        notes,
      },
    });

    return res.json(updatedCustomer);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to update customer" });
  }
};

// DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user?.id || "0");

    // Cek keberadaan customer
    const customer = await prisma.customer.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete customer" });
  }
};
