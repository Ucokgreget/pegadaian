import { prisma } from "./lib/prisma.js";

async function main() {
  try {
    const customers = await prisma.customer.findMany();
    console.log("--- ALL CUSTOMERS IN DB ---");
    console.table(customers.map(c => ({ id: c.id, name: c.name, userId: c.userId })));
    console.log("---------------------------");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
