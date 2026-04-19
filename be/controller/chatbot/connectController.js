import { spawnBotForUser, stopBotForUser } from "../../bot/spawnBot.js";
import { prisma } from "../../lib/prisma.js";

export const connectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    // Spawn bot immediately so QR can be generated
    spawnBotForUser(userId);

    const device = await prisma.device.findFirst({ where: { userId } });
    
    let settings = null;
    if (device) {
      settings = await prisma.chatbotSettings.upsert({
        where: {
          userId: userId,
        },
        update: {
          isActive: true,
        },
        create: {
          userId: userId,
          deviceId: device.id,
          isActive: true,
        },
      });
    }

    return res.status(200).json({ success: true, status: "waiting for qr", settings });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};

export const disconnectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    stopBotForUser(userId);

    const device = await prisma.device.findFirst({ where: { userId } });
    let settings = null;
    
    if (device) {
      settings = await prisma.chatbotSettings.upsert({
        where: {
          userId: userId,
        },
        update: {
          isActive: false,
        },
        create: {
          userId: userId,
          deviceId: device.id,
          isActive: false,
        },
      });
    }

    return res.status(200).json({ success: true, status: "bot disconnected", settings });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};
