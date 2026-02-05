import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "baileys";
import pino from "pino";
import dotenv from "dotenv";
import { askGemini } from "../bot/gemini.js";
import { prisma } from "./lib/prisma.js";
import * as qrStore from "./lib/qrStore.js";
import qrcode from "qrcode-terminal";

dotenv.config();

let sock;
let isRestarting = false;

// ========== GANTI FUNGSI API JADI QUERY DATABASE ==========

// 1. Ganti fetch runtime config
async function getRuntimeConfig(device) {
  try {
    const settings = await prisma.chatbotSettings.findFirst({
      where: { device: device },
      include: { user: true }, // Kita butuh userId
    });
    return settings;
  } catch (e) {
    console.error("❌ Error DB runtime config:", e.message);
    return null;
  }
}

// 2. Ganti fetch save log
async function saveConversation(userId, sender, message, response) {
  try {
    await prisma.conversation.create({
      data: {
        userId,
        sender,
        message,
        response,
        isIncoming: true,
      },
    });
  } catch (e) {
    console.error("❌ Error DB saving conversation:", e.message);
  }
}

// 3. Ganti proses blast queue
async function processBlastQueue() {
  try {
    // Ambil task pending langsung dari DB
    const task = await prisma.blastMessage.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    if (!task) return;

    console.log("🚀 Memproses WA Blast ID:", task.id);

    let numbers = [];
    try {
      // Cek apakah recipients sudah object atau string JSON
      // Note: Prisma might return it as string if mapped that way, or object if JSON type.
      // Schema says String.
      numbers =
        typeof task.recipients === "string"
          ? JSON.parse(task.recipients)
          : task.recipients;
    } catch (e) {
      console.error("❌ Gagal parse recipients:", e);
      // Opsional: Tandai failed agar tidak loop terus
      return;
    }

    for (const number of numbers) {
      const cleanNumber = number.toString().replace(/\D/g, "");
      const jid = cleanNumber + "@s.whatsapp.net";

      console.log("📨 Mengirim ke:", jid);

      try {
        if (sock) {
          await sock.sendMessage(jid, { text: task.message });
        }
      } catch (err) {
        console.error("❌ Gagal kirim ke:", jid, err);
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    // Update status jadi COMPLETED langsung di DB
    await prisma.blastMessage.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });

    console.log("✅ WA Blast selesai:", task.id);
  } catch (err) {
    console.error("❌ Blast Error:", err.message);
  }
}

// 4. Helper get products
async function getProducts(userId) {
  try {
    const products = await prisma.product.findMany({
      where: { userId: userId },
      take: 10,
    });
    return products;
  } catch (e) {
    return [];
  }
}

// ========== LOGIKA BOT UTAMA ==========

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  // Logger silent biar terminal bersih
  const logger = pino({ level: "silent" });

  sock = makeWASocket({
    printQRInTerminal: false, // Turn off terminal QR
    version,
    auth: state,
    logger,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 1. JIKA ADA QR CODE BARU
    if (qr) {
      console.log(" QR Code generated (menunggu scan di frontend)");
      qrcode.generate(qr, { small: true });
      qrStore.setQR(qr);
      qrStore.setStatus("scan_qr");
    }

    // 2. JIKA TERHUBUNG
    if (connection === "open") {
      console.log("🔥 WhatsApp Bot Connected");
      qrStore.setQR(null);
      qrStore.setStatus("connected");
    }

    // 3. JIKA SEDANG CONNECTING
    if (connection === "connecting") {
      qrStore.setStatus("connecting");
    }

    // 4. JIKA PUTUS
    if (connection === "close") {
      qrStore.setStatus("disconnected");
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      if (shouldReconnect && !isRestarting) {
        isRestarting = true;
        console.log("🔄 Reconnecting...");
        setTimeout(() => {
          startBot();
          isRestarting = false;
        }, 3000);
      }
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (!text) return;

    // --- LOGIC UTAMA ---
    const deviceId = sock.user?.id?.split(":")[0] || "";

    // 1. Panggil fungsi DB langsung
    // NOTE: deviceId might be undefined if not authorized yet? But messages come after auth.
    const settings = await getRuntimeConfig(deviceId);

    if (!settings || !settings.isActive) return;

    await sock.sendPresenceUpdate("composing", sender);

    // 2. Panggil fungsi DB Product
    const products = await getProducts(settings.userId);

    let productListText = "Belum ada produk.";
    if (products.length > 0) {
      productListText = products
        .map((p, i) => `${i + 1}. ${p.name} - Rp${p.price}`)
        .join("\n");
    }

    const prompt = `
    ${settings.aiPrompt || "Asisten Virtual"}
    
    Data Produk:
    ${productListText}
    
    User: "${text}"
    `;

    try {
      const response = await askGemini(prompt);
      await sock.sendMessage(sender, { text: response });

      // 3. Simpan log langsung ke DB
      await saveConversation(settings.userId, sender, text, response);
    } catch (err) {
      console.error("AI Error", err);
    }
  });
}

// Loop queue
setInterval(() => {
  if (sock?.user?.id) processBlastQueue();
}, 5000);

// 5. Delete Session
async function deleteSession() {
  try {
    console.log("⚠️ Deleting session...");

    // Tutup koneksi jika ada
    if (sock) {
      sock.end(undefined);
      sock = undefined;
    }

    // Hapus folder session
    const fs = await import("fs/promises");
    const path = "./session";
    try {
      await fs.rm(path, { recursive: true, force: true });
      console.log("✅ Session folder deleted");
    } catch (e) {
      console.log(
        "⚠️ Failed to delete session folder (might be empty):",
        e.message
      );
    }

    // Reset status store
    qrStore.setQR(null);
    qrStore.setStatus("disconnected");

    // Restart bot untuk generate QR baru
    startBot();

    return true;
  } catch (e) {
    console.error("❌ Error deleting session:", e);
    return false;
  }
}

startBot();
export { startBot, deleteSession };
