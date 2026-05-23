import path from "path";
import fs from "fs/promises";
import { stopBotForUser } from "../../bot/spawnBot.js";
import { getRuntimeConfigByDevice } from "../../service/chatbot.service.js";
import { setRuntime } from "../../lib/runtimeStore.js";

export const getRuntimeConfig = async (req, res) => {
  try {
    const { device } = req.params;
    const data = await getRuntimeConfigByDevice(device);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUserBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    // Hentikan proses bot bila sedang berjalan
    stopBotForUser(userId);

    // Reset runtime state agar FE tidak menampilkan QR/connected lama
    setRuntime(userId, { status: "disconnected", qr: null });

    // Hapus folder session WhatsApp milik user
    const sessionPath = path.join(
      process.cwd(),
      "sessions",
      `user-${userId}`
    );

    await fs.rm(sessionPath, { recursive: true, force: true });
    console.log(`Session dari user ${userId} telah dihapus`);

    return res.status(200).json({
      success: true,
      message: "Session bot berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal hapus session bot:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
