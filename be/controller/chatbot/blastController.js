import { prisma } from "../../lib/prisma.js";

import {
  fetchPendingBlast,
  updateBlastStatus,
} from "../../service/blast.service.js";
// --- Bagian Worker (System) ---

// GET: Ambil 1 antrian pending (FIFO)
export const getPendingBlast = async (req, res) => {
  try {
    const pending = await fetchPendingBlast();
    return res.json(pending || {});
  } catch (error) {
    return res.status(500).json({ error: "Error fetching pending blast" });
  }
};

// GET/PUT: Tandai blast sudah selesai
export const getCompletedBlast = async (req, res) => {
  try {
    const { id } = req.query; // Mengambil ?id=...
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    await updateBlastStatus(parseInt(id));

    return res.json({ success: true });
  } catch (error) {
    console.error("Error completing blast:", error);
    return res.status(500).json({ error: "Failed to update blast" });
  }
};

// --- Bagian Dashboard (User) ---

// GET: Ambil semua blast milik user (Protected)
export const getUserBlast = async (req, res) => {
  try {
    const userId = parseInt(req.user.id); // Dari middleware auth

    const data = await prisma.blastMessage.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching blasts" });
  }
};

// POST: Buat blast baru (Protected)
export const createBlast = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { message, recipients } = req.body;

    if (!message || !recipients || recipients.length === 0) {
      return res
        .status(400)
        .json({ error: "Message & recipients are required" });
    }

    const newBlast = await prisma.blastMessage.create({
      data: {
        userId: userId,
        message: message,
        recipients: JSON.stringify(recipients), // Sesuai kode aslimu
        status: "PENDING",
      },
    });

    return res.json(newBlast);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating blast" });
  }
};
