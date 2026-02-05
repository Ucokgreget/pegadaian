import { prisma } from "../lib/prisma.js";

export async function getRuntimeConfigByDevice(device) {
  return prisma.chatbotSettings.findFirst({
    where: {
      device: device,
    },
    include: {
      user: true,
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

export async function updateDeviceForUser(userId, device) {
  return prisma.chatbotSettings.update({
    where: {
      userId: userId,
    },
    data: {
      device: device,
    },
  });
}
