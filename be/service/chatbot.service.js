//chatbot.service.js
import { prisma } from "../lib/prisma.js";

export async function getRuntimeConfigByDevice(devicePhone) {
  const settings = await prisma.chatbotSettings.findFirst({
    where: {
      device: {
        phone: devicePhone,
      },
    },
    include: {
      device: {
        include: { user: true },
      },
    },
  });

  if (settings) {
    settings.user = settings.device?.user;
    settings.userId = settings.device?.userId;
  }

  return settings;
}

export async function saveConversation({
  userId,
  deviceId,
  sender,
  message,
  response,
  isIncoming = true,
  isCheckout 
}) {
  let finalDeviceId = deviceId;
  if (!finalDeviceId) {
    const device = await prisma.device.findFirst({ where: { userId } });
    if (device) finalDeviceId = device.id;
  }

  return prisma.conversation.create({
    data: {
      userId: userId,
      deviceId: finalDeviceId,
      sender: sender,
      message: message,
      response: response,
      isIncoming: isIncoming,
      isCheckout: isCheckout
    },
  });
}

export async function updateDeviceForUser(userId, devicePhone) {
  let foundDevice = await prisma.device.findFirst({
    where: {
      userId,
      phone: devicePhone,
    },
  });

  if (!foundDevice) {
    foundDevice = await prisma.device.create({
      data: {
        userId,
        phone: devicePhone,
        status: "CONNECTED",
        isActive: true,
      },
    });
  } else {
    foundDevice = await prisma.device.update({
      where: { id: foundDevice.id },
      data: { status: "CONNECTED" },
    });
  }

  let setting = await prisma.chatbotSettings.findUnique({
    where: {
      deviceId: foundDevice.id,
    },
  });

  if (!setting) {
    return prisma.chatbotSettings.create({
      data: {
        deviceId: foundDevice.id,
        isActive: true,
        welcomeMessage:
          "Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?",
        aiPrompt: "",
      },
    });
  }

  return prisma.chatbotSettings.update({
    where: {
      id: setting.id,
    },
    data: {
      isActive: true,
    },
  });
}

export async function checkIfUserExists(userId, sender) {
  const count = await prisma.conversation.count({
    where: {
      userId,
      sender,
    },
  });
  return count > 0;
}

export async function markUserAsInteracted(userId, sender) {
  const device = await prisma.device.findFirst({ where: { userId } });
  return prisma.conversation.create({
    data: {
      userId,
      deviceId: device?.id || 1, // fallback
      sender,
      message: "SYSTEM_EVENT: FIRST_INTERACTION",
      response: "GREETING_SENT",
      isIncoming: true,
    },
  });
}

export async function getRecentConversations(userId, sender, limit = 10) {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      sender,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select:{
      message:true,
      response:true,
      isIncoming:true,
      isCheckout:true
    }
  });
  return conversations.reverse();
}

