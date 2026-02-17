import { spawnBotForUser, stopBotForUser } from "../../bot/spawnBot.js";
import { prisma } from "../../lib/prisma.js";

export const connectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    spawnBotForUser(userId);
    const settings = await prisma.chatbotSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        isActive: true,
      },
      create: {
        userId: userId,
        isActive: true,
      },
    });
    return res.status(200).json({ success: true, status: "waiting for qr", settings });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};

export const disconnectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    stopBotForUser(userId);
    const settings = await prisma.chatbotSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        isActive: false,
      },
      create: {
        userId: userId,
        isActive: false,
      },
    });
    return res.status(200).json({ success: true, status: "bot disconnected", settings });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};
