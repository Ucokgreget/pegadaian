import { prisma } from "../lib/prisma.js";

export async function fetchPendingBlast() {
  return prisma.blast.findFirst({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updateBlastStatus(id) {
  return prisma.blast.update({
    where: {
      id: id,
    },
    data: {
      status: "COMPLETED",
    },
  });
}
