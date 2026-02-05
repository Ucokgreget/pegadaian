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
      setting = await prisma.chatbotSettings.create({
        data: {
          userId: userId,
          isActive: false,
          welcomeMessage:
            "Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?",
          fontteToken: "",
          device: "",
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
    const { isActive, welcomeMessage, fontteToken, device, aiPrompt } =
      req.body;

    const setting = await prisma.chatbotSettings.update({
      where: {
        userId: userId,
      },
      data: {
        isActive: isActive,
        welcomeMessage: welcomeMessage,
        fontteToken: fontteToken,
        device: device,
        aiPrompt: aiPrompt,
      },
    });

    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
