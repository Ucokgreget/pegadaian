import dotenv from "dotenv";
import { prisma } from "../lib/prisma.js";
import { embedText } from "../lib/embedding.js";

dotenv.config();

function toPgVector(vector) {
  return `[${vector.join(",")}]`;
}

function buildProductKnowledge(product) {
  const variantsText =
    product.variants && product.variants.length > 0
      ? product.variants
          .map((variant) => {
            return `- ${variant.name}: Rp ${variant.price.toLocaleString("id-ID")}, stok ${variant.stock}${
              variant.description ? `, ${variant.description}` : ""
            }`;
          })
          .join("\n")
      : "Tidak ada varian.";

  return `
Produk: ${product.name}
Deskripsi: ${product.description || "Tidak ada deskripsi."}

Varian:
${variantsText}

Gunakan informasi ini untuk menjawab pertanyaan customer tentang produk, harga, varian, dan stok.
`.trim();
}

async function syncProductsToKnowledge(userId) {
  const products = await prisma.product.findMany({
    where: { userId },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Ditemukan ${products.length} produk`);

  for (const product of products) {
    const content = buildProductKnowledge(product);

    // Nonaktifkan dokumen product lama untuk produk ini
    await prisma.knowledgeDocument.updateMany({
      where: {
        userId,
        sourceType: "product",
        sourceId: product.id,
      },
      data: {
        isActive: false,
      },
    });

    const document = await prisma.knowledgeDocument.create({
      data: {
        userId,
        title: `Produk - ${product.name}`,
        content,
        sourceType: "product",
        sourceId: product.id,
        metadata: {
          productId: product.id,
          productName: product.name,
        },
        isActive: true,
      },
    });

    const embedding = await embedText(content);
    const vector = toPgVector(embedding);

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks
      (
        document_id,
        user_id,
        chunk_index,
        content,
        metadata,
        embedding,
        created_at
      )
      VALUES
      (
        ${document.id},
        ${userId},
        0,
        ${content},
        ${JSON.stringify({
          productId: product.id,
          productName: product.name,
          title: document.title,
          chunkIndex: 0,
        })}::jsonb,
        ${vector}::vector,
        NOW()
      )
    `;

    console.log(`Synced: ${product.name}`);
  }
}

const userId = Number(process.argv[2]);

if (!userId) {
  console.error("Gunakan: node scripts/syncProductsToKnowledge.js <userId>");
  process.exit(1);
}

await syncProductsToKnowledge(userId);

console.log("Sync product knowledge selesai");
process.exit(0);
