// prisma.js
import dotenv from "dotenv";
dotenv.config(); // kalau kamu pakai .env
// kalau kamu pakai .env.local: dotenv.config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
