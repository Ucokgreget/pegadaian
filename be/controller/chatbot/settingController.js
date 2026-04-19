import { prisma } from "../../lib/prisma.js";

export const getUserSetting = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    let setting = await prisma.chatbotSettings.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!setting) {
      const device = await prisma.device.findFirst({ where: { userId } });
      if (!device) {
        return res
          .status(404)
          .json({ error: "Device not found. Please add a device first." });
      }

      setting = await prisma.chatbotSettings.create({
        data: {
          userId: userId,
          deviceId: device.id,
          isActive: false,
          welcomeMessage:
            "Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?",
          aiPrompt: "",
        },
      });
    }

    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { isActive, welcomeMessage, aiPrompt } = req.body;

    const device = await prisma.device.findFirst({ where: { userId } });
    if (!device) {
      return res
        .status(404)
        .json({ error: "Device not found. Please add a device first." });
    }

    const setting = await prisma.chatbotSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        isActive: isActive,
        welcomeMessage: welcomeMessage,
        aiPrompt: aiPrompt,
      },
      create: {
        userId: userId,
        deviceId: device.id,
        isActive: isActive ?? false,
        welcomeMessage:
          welcomeMessage ??
          "Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?",
        aiPrompt: aiPrompt ?? "",
      },
    });

    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
