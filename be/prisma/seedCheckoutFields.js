// prisma/seedCheckoutFields.js
// ─────────────────────────────────────────────────────────────────────────────
// Idempotent seeder: inserts the 6 default CheckoutFields for every existing
// user that does not already have any fields configured.
//
// Run with:   node prisma/seedCheckoutFields.js
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Default fields that mirror the previous hardcoded checkout flow. */
const DEFAULT_FIELDS = [
  {
    label: "Nama Lengkap",
    fieldKey: "customerName",
    question: "Silakan masukkan *nama lengkap* penerima:",
    inputType: "text",
    isRequired: true,
    order: 0,
    isActive: true,
  },
  {
    label: "Nomor HP",
    fieldKey: "customerPhone",
    question: "Masukkan *nomor HP* penerima:",
    inputType: "phone",
    isRequired: true,
    order: 1,
    isActive: true,
  },
  {
    label: "Alamat",
    fieldKey: "address",
    question: "Masukkan *alamat lengkap* pengiriman:",
    inputType: "textarea",
    isRequired: true,
    order: 2,
    isActive: true,
  },
  {
    label: "Kota",
    fieldKey: "city",
    question: "Masukkan *kota* tujuan pengiriman:",
    inputType: "text",
    isRequired: true,
    order: 3,
    isActive: true,
  },
  {
    label: "Kode Pos",
    fieldKey: "postalCode",
    question: "Masukkan *kode pos* (atau ketik *SKIP* jika tidak tahu):",
    inputType: "text",
    isRequired: false,
    order: 4,
    isActive: true,
  },
  {
    label: "Catatan",
    fieldKey: "notes",
    question:
      "Ada *catatan* untuk pesanan? (atau ketik *SKIP* jika tidak ada):",
    inputType: "textarea",
    isRequired: false,
    order: 5,
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Starting CheckoutField seeder...\n");

  const users = await prisma.user.findMany({ select: { id: true, email: true } });

  if (users.length === 0) {
    console.log("ℹ️  No users found. Seed skipped.");
    return;
  }

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const user of users) {
    // Check per individual fieldKey so existing custom configs are not disturbed.
    for (const field of DEFAULT_FIELDS) {
      const exists = await prisma.checkoutField.findFirst({
        where: { userId: user.id, fieldKey: field.fieldKey },
      });

      if (exists) {
        console.log(
          `  ⏭  User ${user.id} (${user.email}) — "${field.label}" already exists, skipped.`
        );
        totalSkipped++;
      } else {
        await prisma.checkoutField.create({
          data: { userId: user.id, ...field },
        });
        console.log(
          `  ✅ User ${user.id} (${user.email}) — "${field.label}" created.`
        );
        totalCreated++;
      }
    }
  }

  console.log(
    `\n✅ Seeder complete — ${totalCreated} fields created, ${totalSkipped} skipped.`
  );
}

main()
  .catch((err) => {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
