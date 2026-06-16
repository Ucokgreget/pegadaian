import { prisma } from "../../lib/prisma.js";

export const getUserSetting = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const device = await prisma.device.findFirst({ where: { userId } });
    if (!device) {
      return res
        .status(404)
        .json({ error: "Device not found. Please add a device first." });
    }

    let setting = await prisma.chatbotSettings.findUnique({
      where: {
        deviceId: device.id,
      },
    });

    if (!setting) {
      setting = await prisma.chatbotSettings.create({
        data: {
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
        deviceId: device.id,
      },
      update: {
        isActive: isActive,
        welcomeMessage: welcomeMessage,
        aiPrompt: aiPrompt,
      },
      create: {
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
