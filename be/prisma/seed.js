// prisma/seed.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
  // const hashedUserPassword = await bcrypt.hash("userpassword", 10);

  // await prisma.user.upsert({
  //   where: { email: "admin@example.com" },
  //   update: {},
  //   create: {
  //     name: "Admin User",
  //     email: "admin@example.com",
  //     password: hashedAdminPassword,
  //     role: "ADMIN",
  //   },
  // });

  // await prisma.user.upsert({
  //   where: { email: "user@example.com" },
  //   update: {},
  //   create: {
  //     name: "Regular User",
  //     email: "user@example.com",
  //     password: hashedUserPassword,
  //     role: "USER",
  //   },
  // });

  // ─── Packages ───────────────────────────────────────────────
  const free = await prisma.package.upsert({
    where: { key: "free" },
    update: {},
    create: {
      key: "free",
      name: "Free",
      price: 0,
      priceLabel: "Gratis",
      billingPeriod: "monthly",
      isPopular: false,
      isActive: true,
      sortOrder: 1,
      durationDays: 30,
    },
  });

  const basic = await prisma.package.upsert({
    where: { key: "basic" },
    update: {},
    create: {
      key: "basic",
      name: "Basic",
      price: 99000,
      priceLabel: "Rp 99.000/bln",
      billingPeriod: "monthly",
      isPopular: false,
      isActive: true,
      sortOrder: 2,
      durationDays: 30,
    },
  });

  const reguler = await prisma.package.upsert({
    where: { key: "reguler" },
    update: {},
    create: {
      key: "reguler",
      name: "Reguler",
      price: 199000,
      priceLabel: "Rp 199.000/bln",
      billingPeriod: "monthly",
      isPopular: true,
      isActive: true,
      sortOrder: 3,
      durationDays: 30,
    },
  });

  const premium = await prisma.package.upsert({
    where: { key: "premium" },
    update: {},
    create: {
      key: "premium",
      name: "Premium",
      price: 349000,
      priceLabel: "Rp 349.000/bln",
      billingPeriod: "monthly",
      isPopular: false,
      isActive: true,
      sortOrder: 4,
      durationDays: 30,
    },
  });

  // ─── Package Features ────────────────────────────────────────
  // Hapus dulu biar tidak duplikat kalau seed dijalankan ulang
  await prisma.packageFeature.deleteMany({
    where: {
      packageId: { in: [free.id, basic.id, reguler.id, premium.id] },
    },
  });

  await prisma.packageFeature.createMany({
    data: [
      // Free
      { packageId: free.id, featureText: "1 bot aktif",             isHighlighted: false, sortOrder: 1 },
      { packageId: free.id, featureText: "50 pesan/hari",           isHighlighted: false, sortOrder: 2 },
      { packageId: free.id, featureText: "Integrasi dasar",         isHighlighted: false, sortOrder: 3 },

      // Basic
      { packageId: basic.id, featureText: "3 bot aktif",            isHighlighted: true,  sortOrder: 1 },
      { packageId: basic.id, featureText: "500 pesan/hari",         isHighlighted: true,  sortOrder: 2 },
      { packageId: basic.id, featureText: "Multi-bot (s/d 3)",      isHighlighted: false, sortOrder: 3 },
      { packageId: basic.id, featureText: "Integrasi standar",      isHighlighted: false, sortOrder: 4 },

      // Reguler
      { packageId: reguler.id, featureText: "10 bot aktif",         isHighlighted: true,  sortOrder: 1 },
      { packageId: reguler.id, featureText: "2.000 pesan/hari",     isHighlighted: true,  sortOrder: 2 },
      { packageId: reguler.id, featureText: "Multi-bot (s/d 10)",   isHighlighted: false, sortOrder: 3 },
      { packageId: reguler.id, featureText: "Analitik lanjutan",    isHighlighted: false, sortOrder: 4 },
      { packageId: reguler.id, featureText: "Prioritas support",    isHighlighted: false, sortOrder: 5 },

      // Premium
      { packageId: premium.id, featureText: "Bot tak terbatas",       isHighlighted: true,  sortOrder: 1 },
      { packageId: premium.id, featureText: "Pesan tak terbatas",     isHighlighted: true,  sortOrder: 2 },
      { packageId: premium.id, featureText: "Multi-bot tak terbatas", isHighlighted: false, sortOrder: 3 },
      { packageId: premium.id, featureText: "Analitik lanjutan",      isHighlighted: false, sortOrder: 4 },
      { packageId: premium.id, featureText: "Prioritas support 24/7", isHighlighted: false, sortOrder: 5 },
      { packageId: premium.id, featureText: "Custom branding",        isHighlighted: false, sortOrder: 6 },
      { packageId: premium.id, featureText: "Dedicated account",      isHighlighted: false, sortOrder: 7 },
    ],
  });

  console.log("✅ Seed data berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });