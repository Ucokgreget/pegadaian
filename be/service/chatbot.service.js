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
  const foundDevice = await prisma.device.findFirst({
    where: {
      userId,
      device: {
        phone: devicePhone,
      },
    },
  });

  if (!foundDevice) {
    throw new Error("Device gak ketemu");
  }

  const setting = await prisma.chatbotSettings.findFirst({
    where: {
      userId,
    },
  });

  if (!setting) {
    throw new Error("Chatbot Setting gak ketemu");
  }

  return prisma.chatbotSettings.update({
    where: {
      id: setting.id,
    },
    data: {
      deviceId: foundDevice.id,
    },
  });
}
