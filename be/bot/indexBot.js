//indexBot.js
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "baileys";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";

import {
  getRuntimeConfigByDevice,
  saveConversation,
  updateDeviceForUser,
  checkIfUserExists,
  markUserAsInteracted,
  getRecentConversations,
} from "../service/chatbot.service.js";

import { askGemini } from "./gemini.js";
import { askGroq } from "./groq.js";
import { embedText } from "../lib/embedding.js";
import { type } from "os";

import {
  getSession, setSession, clearSession,
  addToCart, getCartSummary,
  getCurrentStep, setStep, CHECKOUT_STEPS,
  createWAOrder, handleWAOrderCallback,
  formatCartMessage, formatOrderConfirmation,
  formatPaymentMessage, formatPaidNotification, formatOwnerNotification,
} from "../service/waOrder.service.js";

process.on("uncaughtException", (err) => console.error("❌ UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.error("❌ UNHANDLED:", err));

/**
 * ⬇️ USER_ID DIKIRIM DARI spawnBot.js
 */
const userId = parseInt(process.env.USER_ID);

if (!userId) {
  console.error("❌ USER_ID env is required");
  process.exit(1);
}

/**
 * ⬇️ SESSION PER USER
 */
const SESSION_DIR = path.join(process.cwd(), "sessions", `user-${userId}`);

process.on("message", async (msg) => {
  if (!msg || msg.type !== "send_wa_message") return;
  if (!sock) {
    console.error("❌ sock belum siap, tidak bisa kirim notifikasi");
    return;
  }

  try {
    const { to, text } = msg;
    // Format nomor: pastikan pakai format JID WhatsApp
    const jid = to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    console.log(`📤 Notifikasi terkirim ke ${jid}`);
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi WA:", error.message);
  }
});

// // Rate limiter: sender -> { count, windowStart }
// const rateLimiter = new Map();
// const RATE_LIMIT_MAX = 10;       // max pesan per window
// const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit

// function isRateLimited(sender) {
//   const now = Date.now();
//   const entry = rateLimiter.get(sender);

//   if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
//     // Reset window
//     rateLimiter.set(sender, { count: 1, windowStart: now });
//     return false;
//   }

//   if (entry.count >= RATE_LIMIT_MAX) {
//     return true;
//   }

//   entry.count += 1;
//   return false;
// }

// Runtime config cache: device -> { data, cachedAt }
const configCache = new Map();
const CONFIG_CACHE_TTL_MS = 60 * 1000; // cache 1 menit

async function getCachedRuntimeConfig(device) {
  const now = Date.now();
  const cached = configCache.get(device);

  if (cached && now - cached.cachedAt < CONFIG_CACHE_TTL_MS) {
    console.log(`⚡ Config cache HIT: ${device}`);
    return cached.data;
  }

  console.log(`🔄 Config cache MISS: ${device}`);
  const data = await getRuntimeConfigByDevice(device);

  if (data) {
    configCache.set(device, { data, cachedAt: now });
  }

  return data;
}

let sock;
let isRestarting = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  // // Cleanup rate limiter setiap 5 menit
  // setInterval(() => {
  //   const now = Date.now();
  //   for (const [key, entry] of rateLimiter.entries()) {
  //     if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
  //       rateLimiter.delete(key);
  //     }
  //   }
  //   console.log(`🧹 Rate limiter cleanup, remaining entries: ${rateLimiter.size}`);
  // }, 5 * 60 * 1000);

  // Cleanup config cache setiap 5 menit
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of configCache.entries()) {
        if (now - entry.cachedAt > CONFIG_CACHE_TTL_MS) {
          configCache.delete(key);
        }
      }
      console.log(
        `🧹 Config cache cleanup, remaining entries: ${configCache.size}`,
      );
    },
    5 * 60 * 1000,
  );

  // ================= CONNECTION =================

  let isPairing = false;
  let pairingStartAt = null;
  let isRestarting = false;

  sock.ev.on("connection.update", async (update) => {
    console.log("Connection Update", update);

    const { connection, qr, lastDisconnect, isNewLogin } = update;

    // ===== QR =====
    if (qr) {
      console.log("bot send qr ke", userId);
      process.send({
        type: "qr",
        userId,
        qr,
      });
    }

    // ===== PAIRING FINISHED (WAITING RECONNECT) =====
    if (isNewLogin) {
      isPairing = true;
      pairingStartAt = Date.now();
      console.log(`🟡 USER ${userId} PAIRING done, waiting reconnect`);
      return;
    }

    // ===== CONNECTED =====
    if (connection === "open") {
      process.send({
        type: "connected",
        userId,
      });
      isPairing = false;
      pairingStartAt = null;
      isRestarting = false;

      const device = sock.user.id.split(":")[0];
      console.log(`✅ USER ${userId} CONNECTED → ${device}`);

      await updateDeviceForUser(userId, device);

      // Invalidate config cache on reconnect
      configCache.delete(device);
      console.log(`🗑️ Config cache invalidated for device: ${device}`);

      return;
    }

    // ===== CONNECTION CLOSED =====
    if (connection === "close") {
      process.send({
        type: "disconnected",
        userId,
      });
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("🔴 Connection closed:", statusCode);

      // HARD LOGOUT
      if (statusCode === 401) {
        console.log("❌ Logged out, deleting session");
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        return;
      }

      // PREVENT DOUBLE RESTART
      if (isRestarting) {
        console.log("⏸ Restart already in progress, skip");
        return;
      }

      // PAIRING PHASE → DELAY RESTART
      if (isPairing) {
        const elapsed = Date.now() - pairingStartAt;

        console.log("⏳ Pairing phase, delaying restart", elapsed);

        isRestarting = true;
        setTimeout(
          () => {
            isRestarting = false;
            startBot();
          },
          elapsed < 5000 ? 3000 : 1000,
        );

        return;
      }

      // NORMAL RESTART
      isRestarting = true;
      setTimeout(() => {
        isRestarting = false;
        startBot();
      }, 2000);
    }
  });

  // ================= MESSAGE =================
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key?.fromMe) return;

    const sender = msg.key?.remoteJid;
    if (!sender || sender.includes("@status") || sender === "status@broadcast")
      return;

    const text =
      msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";

    if (!text || text.trim() === "") {
      console.log(`💬 USER ${userId} ← ${sender}: No text`);
      return;
    }

    console.log(`💬 USER ${userId} ← ${sender}: ${text}`);

    // if (isRateLimited(sender)) {
    //   console.log(`🚫 Rate limited: ${sender}`);
    //   return;
    // }

    await sock.sendPresenceUpdate("composing", sender);

    const device = sock.user.id.split(":")[0];
    const settings = await getCachedRuntimeConfig(device);

    console.log("🚀 ~ startBot ~ settings:", settings);

    if (!settings || !settings.isActive) {
      await sock.sendPresenceUpdate("available", sender);
      return;
    }

    // ===== FIRST MESSAGE GREETING =====
    const hasChatted = await checkIfUserExists(settings.userId, sender);

    if (!hasChatted) {
      const greeting =
        settings.welcomeMessage ||
        "Halo 👋 Saya asisten resmi kami. Ada yang bisa saya bantu?\nKetik *.main* untuk melihat menu utama.";

      await sock.sendMessage(sender, { text: greeting });

      await markUserAsInteracted(settings.userId, sender);

      await sock.sendPresenceUpdate("available", sender);
      return;
    }

    // ===== COMMAND HANDLING =====
    const command = text.trim().toLowerCase();

    // Check if the command is a pure number for product selection
    const commandNumber = parseInt(command);
    if (
      !isNaN(commandNumber) &&
      commandNumber > 0 &&
      commandNumber.toString() === command
    ) {
      const products = await prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { variants: true },
      });

      const selectedProduct = products[commandNumber - 1];
      let staticResponse = "";

      if (selectedProduct) {
        let variantText =
          selectedProduct.variants && selectedProduct.variants.length > 0
            ? selectedProduct.variants
                .map(
                  (v, i) =>
                    `  ${String.fromCharCode(97 + i)}. ${v.name} - Rp ${v.price.toLocaleString("id-ID")} (Stok: ${v.stock})`,
                )
                .join("\n")
            : "  Tidak ada varian.";

        staticResponse = `*DETAIL PRODUK*\n\n*Nama:* ${selectedProduct.name}\n*Deskripsi:* ${selectedProduct.description || "-"}\n\n*Varian:*\n${variantText}`;

        let messagePayload = { text: staticResponse };

        if (selectedProduct.imageUrl) {
          if (selectedProduct.imageUrl.startsWith("http")) {
            messagePayload = {
              image: { url: selectedProduct.imageUrl },
              caption: staticResponse,
            };
          } else {
            const localPath = path.join(
              process.cwd(),
              selectedProduct.imageUrl,
            );
            if (fs.existsSync(localPath)) {
              messagePayload = {
                image: fs.readFileSync(localPath),
                caption: staticResponse,
              };
            }
          }
        }

        await sock.sendMessage(sender, messagePayload);
      } else {
        staticResponse =
          "Maaf, nomor produk tidak ditemukan. Silakan ketik *.produk* untuk melihat daftar produk yang tersedia.";
        await sock.sendMessage(sender, { text: staticResponse });
      }
      await saveConversation({
        userId: settings.userId,
        sender,
        message: text,
        response: staticResponse,
      });
      console.log(staticResponse);
      await sock.sendPresenceUpdate("available", sender);
      return; // Stop execution
    }

    if (command.startsWith(".")) {
      let staticResponse = "";

      if (command === ".main") {
        staticResponse =
          "*MAIN MENU*\n\nSilakan pilih opsi berikut:\n👉 *.produk* - Lihat daftar produk dan varian";
      } else if (command === ".produk") {
        const products = await prisma.product.findMany({
          where: {
            userId,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
          },
        });

        if (products && products.length > 0) {
          const productList = products
            .map(
              (p, index) =>
                `${index + 1}. ${p.name}\n   - ${p.description || "Tidak ada deskripsi"}`,
            )
            .join("\n");
          staticResponse = `*DAFTAR PRODUK*\n\n${productList}\n\nBalas dengan nama produk atau tanya AI kami untuk info lebih lanjut.`;
        } else {
          staticResponse =
            "*DAFTAR PRODUK*\n\nMaaf, saat ini belum ada produk yang tersedia.";
        }
      } else {
        staticResponse =
          "Maaf, perintah tidak dikenali. Ketik *.main* untuk melihat menu utama.";
      }

      await sock.sendMessage(sender, { text: staticResponse });
      await saveConversation({
        userId: settings.userId,
        sender,
        message: text,
        response: staticResponse,
      });
      console.log(staticResponse);
      await sock.sendPresenceUpdate("available", sender);
      return; // Stop execution, block AI response for ANY command starting with "."
    }

    // ===== CHECKOUT STATE MACHINE =====
    const buyIntent = /(beli|order|pesan|mau beli|mau order|checkout|ingin beli|ingin pesan)/i.test(text);
    const currentStep = getCurrentStep(sender);
    console.log(`🛒 DEBUG checkout: buyIntent=${buyIntent}, currentStep=${currentStep}, sender=${sender}`);

    if (buyIntent === true && currentStep === CHECKOUT_STEPS.IDLE) {
      const allProduct = await prisma.product.findMany({
        where:{userId:settings.userId},
        include:{variants: true}
      })
      const selectedProduct = allProduct.find(p =>
        text.toLowerCase().includes(p.name.toLowerCase())
      )
      console.log(`🛒 DEBUG products: allProducts=${allProducts.map(p => p.name)}, selectedProduct=${selectedProduct?.name}`);
      if (selectedProduct) {
        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
          const variantList = selectedProduct.variants.map((v, i) => `${i + 1}. ${v.name} - Rp ${v.price.toLocaleString("id-ID")}`).join("\n");
          await sock.sendMessage(sender, { text: `*Pilih varian ${selectedProduct.name}:*\n\n${variantList}\n\nBalas dengan nomor varian` });
          setStep(sender, CHECKOUT_STEPS.CONFIRM_CART);
          setSession(sender, { pendingProduct: { productId: selectedProduct.id, productName: selectedProduct.name, variants: selectedProduct.variants } });
        } else {
          addToCart(sender, { productId: selectedProduct.id, productName: selectedProduct.name, price: selectedProduct.price || 0, qty: 1 });
          const cartMsg = formatCartMessage(sender);
          await sock.sendMessage(sender, { text: cartMsg });
          setStep(sender, CHECKOUT_STEPS.CONFIRM_CART);
        }
        await saveConversation({
          userId: settings.userId,
          sender,
          message: text,
          response: "Checkout initiated"
        });
        await sock.sendPresenceUpdate("available", sender);
        return;
      }
    }

    if (currentStep !== CHECKOUT_STEPS.IDLE) {
      let staticResponse = "";
      const session = getSession(sender);

      if (currentStep === CHECKOUT_STEPS.CONFIRM_CART) {
        if (session.pendingProduct) {
          const choice = parseInt(text);
          const variants = session.pendingProduct.variants;
          if (!isNaN(choice) && choice > 0 && choice <= variants.length) {
            const selectedVariant = variants[choice - 1];
            addToCart(sender, { 
              productId: session.pendingProduct.productId, 
              productName: `${session.pendingProduct.productName} - ${selectedVariant.name}`, 
              price: selectedVariant.price, 
              qty: 1 
            });
            staticResponse = formatCartMessage(sender);
            setSession(sender, { pendingProduct: null });
          } else {
            staticResponse = "Silakan balas dengan nomor varian yang tersedia";
          }
        } else {
          if (text.toUpperCase() === "LANJUT") {
            setStep(sender, CHECKOUT_STEPS.ASK_NAME);
            staticResponse = "Silakan masukkan *nama lengkap* penerima:";
          } else if (text.toUpperCase() === "BATAL") {
            clearSession(sender);
            staticResponse = "Pesanan dibatalkan. Ada yang bisa kami bantu? 😊";
          } else {
            staticResponse = formatCartMessage(sender);
          }
        }
      } else if (currentStep === CHECKOUT_STEPS.ASK_NAME) {
        setSession(sender, { shippingData: { ...session.shippingData, customerName: text } });
        setStep(sender, CHECKOUT_STEPS.ASK_PHONE);
        staticResponse = "Masukkan *nomor HP* penerima:";
      } else if (currentStep === CHECKOUT_STEPS.ASK_PHONE) {
        if (/^[0-9]{10,13}$/.test(text.replace(/\s/g, ""))) {
          setSession(sender, { shippingData: { ...session.shippingData, phone: text } });
          setStep(sender, CHECKOUT_STEPS.ASK_ADDRESS);
          staticResponse = "Masukkan *alamat lengkap* pengiriman:";
        } else {
          staticResponse = "Nomor HP tidak valid. Masukkan nomor HP yang benar (10-13 digit):";
        }
      } else if (currentStep === CHECKOUT_STEPS.ASK_ADDRESS) {
        setSession(sender, { shippingData: { ...session.shippingData, address: text } });
        setStep(sender, CHECKOUT_STEPS.ASK_CITY);
        staticResponse = "Masukkan *kota* tujuan pengiriman:";
      } else if (currentStep === CHECKOUT_STEPS.ASK_CITY) {
        setSession(sender, { shippingData: { ...session.shippingData, city: text } });
        setStep(sender, CHECKOUT_STEPS.ASK_POSTAL);
        staticResponse = "Masukkan *kode pos* (atau ketik *SKIP* jika tidak tahu):";
      } else if (currentStep === CHECKOUT_STEPS.ASK_POSTAL) {
        const postalCode = text.toUpperCase() === "SKIP" ? null : text;
        setSession(sender, { shippingData: { ...session.shippingData, postalCode } });
        setStep(sender, CHECKOUT_STEPS.ASK_NOTES);
        staticResponse = "Ada *catatan* untuk pesanan? (atau ketik *SKIP* jika tidak ada):";
      } else if (currentStep === CHECKOUT_STEPS.ASK_NOTES) {
        const notes = text.toUpperCase() === "SKIP" ? null : text;
        setSession(sender, { shippingData: { ...session.shippingData, notes } });
        setStep(sender, CHECKOUT_STEPS.CONFIRM_ORDER);
        staticResponse = formatOrderConfirmation(sender);
      } else if (currentStep === CHECKOUT_STEPS.CONFIRM_ORDER) {
        if (text.toUpperCase() === "BAYAR") {
          try {
            const waOrder = await createWAOrder({ userId: settings.userId, senderPhone: sender, user: settings.user });
            staticResponse = formatPaymentMessage(waOrder.orderCode, waOrder.paymentUrl);
            setStep(sender, CHECKOUT_STEPS.WAITING_PAYMENT);
          } catch (error) {
            staticResponse = "Terjadi kesalahan saat memproses pesanan. Silakan coba balas *BAYAR* lagi.";
          }
        } else if (text.toUpperCase() === "BATAL") {
          clearSession(sender);
          staticResponse = "Pesanan dibatalkan. Ada yang bisa kami bantu? 😊";
        } else {
          staticResponse = formatOrderConfirmation(sender);
        }
      } else if (currentStep === CHECKOUT_STEPS.WAITING_PAYMENT) {
        if (text.toUpperCase() === "BATAL") {
          await prisma.wAOrder.updateMany({ 
            where: { senderPhone: sender, status: "PENDING_PAYMENT" }, 
            data: { status: "CANCELLED" } 
          });
          clearSession(sender);
          staticResponse = "Pesanan dibatalkan.";
        } else {
          staticResponse = "Pesanan kamu sedang menunggu pembayaran 🕐\nSilakan selesaikan pembayaran melalui link yang sudah dikirim.\nKetik *BATAL* untuk membatalkan pesanan.";
        }
      }

      await sock.sendMessage(sender, { text: staticResponse });
      await saveConversation({
        userId: settings.userId,
        sender,
        message: text,
        response: staticResponse,
      });
      await sock.sendPresenceUpdate("available", sender);
      return;
    }

    // ===== AI RESPONSE =====
    const defaultPrompt = `
Anda adalah asisten penjualan yang membantu untuk bisnis e-commerce.
Balas dalam Bahasa Indonesia yang ramah dan profesional.

ATURAN FORMAT WHATSAPP (WAJIB DIIKUTI):
- Gunakan *teks* untuk huruf tebal (bukan ** atau ___)
- Gunakan emoji secukupnya untuk memperindah pesan
- JANGAN gunakan tabel markdown (|---|---|)
- DILARANG menggunakan **teks** (double asterisk) — WhatsApp tidak mendukungnya.
Untuk tebal, HANYA gunakan *teks* (single asterisk).
- JANGAN gunakan heading markdown (##, ###)
- Pisahkan setiap produk/item dengan baris kosong
- Gunakan tanda strip (-) atau angka (1. 2. 3.) untuk list
- Maksimal 3-4 produk per pesan, sisanya tawarkan untuk lihat lebih lanjut
- Tutup pesan dengan 1 kalimat ajakan/pertanyaan
`;

    const formattingInstruction = `

INGAT FORMAT WHATSAPP:
- Gunakan *teks* untuk tebal
- List pakai angka atau strip (-)
- DILARANG pakai tabel markdown
- DILARANG pakai heading (##)
- DILARANG menggunakan **teks** (double asterisk) — WhatsApp tidak mendukungnya.
Untuk tebal, HANYA gunakan *teks* (single asterisk).
`;

    const basePrompt = settings.aiPrompt
      ? settings.aiPrompt + formattingInstruction
      : defaultPrompt;

    // --- RAG INTEGRATION ---
    let contextText = "";
    try {
      const embeddingValues = await embedText(text);
      const embeddingString = `[${embeddingValues.join(",")}]`;
      const SIMILARITY_THRESHOLD = 0.65;

      const relevantChunks = await prisma.$queryRaw`
        SELECT content, 1 - (embedding <=> ${embeddingString}::vector) AS similarity
        FROM "knowledge_chunks"
        WHERE user_id = ${settings.userId}
        AND 1 - (embedding <=> ${embeddingString}::vector) >= ${SIMILARITY_THRESHOLD}
        ORDER BY embedding <=> ${embeddingString}::vector
        LIMIT 3
      `;

      console.log(
        "RAG RESULT:",
        relevantChunks.map((c) => ({
          similarity: c.similarity,
          preview: c.content.substring(0, 50),
        })),
      );

      if (relevantChunks && relevantChunks.length > 0) {
        contextText = "Informasi Relevan dari Knowledge Base:\n";
        relevantChunks.forEach((chunk, i) => {
          contextText += `${i + 1}. ${chunk.content}\n`;
        });
      }
    } catch (ragError) {
      console.error(
        "⚠️ RAG pipeline failed, continuing without context:",
        ragError.message,
      );
      // contextText tetap "" → AI tetap jalan tanpa RAG context
    }

    const systemPromptContent =
      `${basePrompt}\n${contextText ? `\n${contextText}\n` : ""}`.trim();

    const recentConvos = await getRecentConversations(
      settings.userId,
      sender,
      10,
    );
    const messages = [];

    messages.push({ role: "system", content: systemPromptContent });

    for (const convo of recentConvos) {
      if (convo.message && !convo.message.startsWith("SYSTEM_EVENT")) {
        messages.push({
          role: convo.isIncoming ? "user" : "assistant",
          content: convo.message,
        });
      }
      if (convo.response && convo.response !== "GREETING_SENT") {
        messages.push({ role: "assistant", content: convo.response });
      }
    }

    messages.push({ role: "user", content: text });

    const response = await askGroq(messages);

    await sock.sendMessage(sender, { text: response });

    await saveConversation({
      userId: settings.userId,
      sender,
      message: text,
      response,
    });

    await sock.sendPresenceUpdate("available", sender);
  });
}

startBot();
