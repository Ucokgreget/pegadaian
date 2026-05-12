// service/knowledge.service.js

import fs from "fs/promises";
import mammoth from "mammoth";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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
      const data = await pdfParse(dataBuffer);
      return data.text;
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
          "user_id",
          "chunk_index",
          "content",
          "metadata",
          "embedding",
          "created_at"
        )
        VALUES (
          ${document.id},
          ${numericUserId},
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

export async function getKnowledgeDocumentsByUser(userId) {
  const numericUserId = Number(userId);

  if (!numericUserId) {
    throw new Error("User ID tidak valid");
  }

  const documents = await prisma.knowledgeDocument.findMany({
    where: {
      userId: numericUserId,
      sourceType: "document_upload",
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
