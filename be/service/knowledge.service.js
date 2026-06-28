// service/knowledge.service.js

import fs from "fs/promises";
import mammoth from "mammoth";
import path from "path";
import { PDFParse } from "pdf-parse";
import * as cheerio from "cheerio";

import { prisma } from "../lib/prisma.js";
import { chunkText } from "../lib/chunkText.js";
import { embedText } from "../lib/embedding.js";

async function extractTextFromFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === ".txt") {
      return await fs.readFile(file.path, "utf-8");
    }

    if (ext === ".pdf") {
      const dataBuffer = await fs.readFile(file.path);
      const pdf = new PDFParse({ data: dataBuffer });
      const result = await pdf.getText();
      await pdf.destroy();
      return result.text;
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({
        path: file.path,
      });

      return result.value;
    }

    throw new Error("Format file tidak didukung");
  } catch (error) {
    throw new Error(`Gagal extract text dari file: ${error.message}`);
  }
}

export async function createKnowledgeFromUploadedFile({ userId, file }) {
  const numericUserId = Number(userId);

  if (!numericUserId) {
    throw new Error("User ID tidak valid");
  }

  if (!file) {
    throw new Error("File tidak ditemukan");
  }

  const extractedText = await extractTextFromFile(file);

  if (!extractedText || extractedText.trim().length < 20) {
    throw new Error("File kosong atau teks tidak bisa diekstrak");
  }

  const chunks = chunkText(extractedText);

  if (!chunks || chunks.length === 0) {
    throw new Error("Dokumen tidak menghasilkan chunk");
  }

  let document;

  try {
    document = await prisma.knowledgeDocument.create({
      data: {
        userId: numericUserId,
        sourceType: "document_upload",
        sourceId: null,
        title: file.originalname,
        content: extractedText,
        metadata: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          size: file.size,
        },
      },
    });

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];

      const embedding = await embedText(chunkContent);
      const embeddingString = `[${embedding.join(",")}]`;

      const metadata = {
        sourceType: "document_upload",
        filename: file.originalname,
        chunkIndex: i,
      };

      await prisma.$executeRaw`
        INSERT INTO "knowledge_chunks" (
          "document_id",
          "chunk_index",
          "content",
          "metadata",
          "embedding",
          "created_at"
        )
        VALUES (
          ${document.id},
          ${i},
          ${chunkContent},
          ${JSON.stringify(metadata)}::jsonb,
          ${embeddingString}::vector,
          NOW()
        )
      `;
    }

    return {
      id: document.id.toString(),
      title: document.title,
      sourceType: document.sourceType,
      totalChunks: chunks.length,
      createdAt: document.createdAt,
    };
  } catch (error) {
    if (document?.id) {
      await prisma.knowledgeDocument.delete({
        where: {
          id: document.id,
        },
      });
    }

    throw new Error(`Gagal memproses knowledge document: ${error.message}`);
  }
}

export async function createKnowledgeFromUrl({ userId, url }) {
  const numericUserId = Number(userId);

  if (!numericUserId) {
    throw new Error("User ID tidak valid");
  }

  if (!url || typeof url !== "string") {
    throw new Error("URL tidak valid");
  }

  // ── 1. Fetch HTML dari URL ────────────────────────────────────────────────
  let html;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KnowledgeBot/1.0; +https://example.com)",
      },
      signal: AbortSignal.timeout(15000), // timeout 15 detik
    });

    if (!response.ok) {
      throw new Error(
        `Server merespons dengan status ${response.status} ${response.statusText}`
      );
    }

    html = await response.text();
  } catch (error) {
    throw new Error(`Gagal mengambil konten dari URL: ${error.message}`);
  }

  // ── 2. Parse & ekstrak teks bersih menggunakan cheerio ───────────────────
  const $ = cheerio.load(html);

  // Ambil judul dari tag <title>
  const pageTitle = $("title").text().trim() || url;

  // Hapus elemen yang tidak relevan
  $(
    "script, style, noscript, nav, footer, header, aside, iframe, svg, [role='navigation'], [role='banner'], [role='complementary']"
  ).remove();

  // Ambil teks dari body
  const rawText = $("body").text();

  // Normalisasi whitespace
  const extractedText = rawText.replace(/\s+/g, " ").trim();

  if (!extractedText || extractedText.length < 20) {
    throw new Error(
      "Halaman kosong atau tidak mengandung teks yang cukup untuk diproses"
    );
  }

  // ── 3. Chunking → embedding → simpan ─────────────────────────────────────
  const chunks = chunkText(extractedText);

  if (!chunks || chunks.length === 0) {
    throw new Error("Dokumen tidak menghasilkan chunk");
  }

  let document;

  try {
    document = await prisma.knowledgeDocument.create({
      data: {
        userId: numericUserId,
        sourceType: "website",
        sourceId: null,
        title: pageTitle,
        content: extractedText,
        metadata: {
          url,
        },
      },
    });

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];

      const embedding = await embedText(chunkContent);
      const embeddingString = `[${embedding.join(",")}]`;

      const metadata = {
        sourceType: "website",
        url,
        chunkIndex: i,
      };

      await prisma.$executeRaw`
        INSERT INTO "knowledge_chunks" (
          "document_id",
          "chunk_index",
          "content",
          "metadata",
          "embedding",
          "created_at"
        )
        VALUES (
          ${document.id},
          ${i},
          ${chunkContent},
          ${JSON.stringify(metadata)}::jsonb,
          ${embeddingString}::vector,
          NOW()
        )
      `;
    }

    return {
      id: document.id.toString(),
      title: document.title,
      sourceType: document.sourceType,
      metadata: document.metadata,
      totalChunks: chunks.length,
      createdAt: document.createdAt,
    };
  } catch (error) {
    if (document?.id) {
      await prisma.knowledgeDocument.delete({
        where: {
          id: document.id,
        },
      });
    }

    throw new Error(`Gagal memproses knowledge dari URL: ${error.message}`);
  }
}

export async function getKnowledgeDocumentsByUser(userId) {
  const numericUserId = Number(userId);

  if (!numericUserId) {
    throw new Error("User ID tidak valid");
  }

  const documents = await prisma.knowledgeDocument.findMany({
    where: {
      userId: numericUserId,
      sourceType: { in: ["document_upload", "website"] },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      sourceType: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          chunks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return documents.map((doc) => ({
    id: doc.id.toString(),
    title: doc.title,
    sourceType: doc.sourceType,
    metadata: doc.metadata,
    totalChunks: doc._count.chunks,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}
