//chatbot.service.js
import { prisma } from "../lib/prisma.js";

export async function getRuntimeConfigByDevice(devicePhone) {
  return prisma.chatbotSettings.findFirst({
    where: {
      device: {
        phone: devicePhone,
      },
    },
    include: {
      user: true,
      device: true,
    },
  });
}

export async function saveConversation({
  userId,
  sender,
  message,
  response,
  isIncoming = true,
}) {
  return prisma.conversation.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      sender: sender,
      message: message,
      response: response,
      isIncoming: isIncoming,
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
        packageName: "FREE",
        isActive: true,
      },
    });
  } else {
    foundDevice = await prisma.device.update({
      where: { id: foundDevice.id },
      data: { status: "CONNECTED" },
    });
  }

  let setting = await prisma.chatbotSettings.findFirst({
    where: {
      userId,
    },
  });

  if (!setting) {
    return prisma.chatbotSettings.create({
      data: {
        userId,
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
      deviceId: foundDevice.id,
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
  return prisma.conversation.create({
    data: {
      userId,
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
  });
  return conversations.reverse();
}

