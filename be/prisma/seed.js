import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
  const hashedUserPassword = await bcrypt.hash("userpassword", 10);

  // Menambahkan User dengan role ADMIN
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  // Menambahkan User dengan role USER
  await prisma.user.create({
    data: {
      name: "Regular User",
      email: "user@example.com",
      password: hashedUserPassword,
      role: Role.USER,
    },
  });

  console.log("Seed data berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
