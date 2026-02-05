import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "baileys";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";

import {
  getRuntimeConfigByDevice,
  saveConversation,
  updateDeviceForUser,
} from "../service/chatbot.service.js";

import { askGemini } from "./gemini.js";
import { askGroq } from "./groq.js";
import { type } from "os";

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

    await sock.sendPresenceUpdate("composing", sender);

    const device = sock.user.id.split(":")[0];
    const settings = await getRuntimeConfigByDevice(device);

    console.log("🚀 ~ startBot ~ settings:", settings);

    if (!settings || !settings.isActive) {
      await sock.sendPresenceUpdate("available", sender);
      return;
    }

    const basePrompt = settings.aiPrompt
      ? settings.aiPrompt
      : `
      Anda adalah asisten penjualan yang membantu untuk bisnis e-commerce. 
      
      Mohon responlah dengan ramah dan profesional dalam Bahasa Indonesia. 
      Berikan jawaban yang singkat dan membantu. Jika mereka bertanya tentang produk, 
      harga, atau pesanan, berikan informasi yang membantu atau tanyakan detail lebih lanjut.
      
      Jawab dalam 1-2 kalimat saja.
      `;

    const prompt = `${basePrompt}
    
Pesan dari customer: "${text}"`;

    const response = await askGroq(prompt);

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
