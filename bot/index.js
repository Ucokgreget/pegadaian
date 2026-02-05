import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "baileys";

import qrcode from "qrcode-terminal";
import { askGemini } from "./gemini.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

process.on("uncaughtException", (err) => console.error("❌ UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.error("❌ UNHANDLED:", err));

let isRestarting = false;
let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  console.log(`Using Baileys version v${version.join(".")}`);

  sock = makeWASocket({
    printQRInTerminal: false,
    version,
    auth: state,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan QR:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot WA aktif");
    }

    if (connection === "close") {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === 401;

      if (isLoggedOut) {
        console.log(
          "❌ Session invalid / device removed. Menghapus session dan restart..."
        );

        // Hapus folder session secara otomatis
        const sessionPath = path.join(process.cwd(), "session");
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log("✅ Session dihapus");
        }

        // Restart bot untuk scan QR ulang
        if (!isRestarting) {
          isRestarting = true;
          setTimeout(() => {
            console.log("🔄 Restart bot untuk scan QR...");
            startBot();
            isRestarting = false;
          }, 2000);
        }
        return;
      }

      if (!isRestarting) {
        isRestarting = true;
        console.log("🔄 Reconnecting...");
        setTimeout(() => {
          startBot();
          isRestarting = false;
        }, 2000);
      }
    }
  });

  // HANDLE PESAN
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    if (msg.key.remoteJid?.includes(sock.user.id.split(":")[0])) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log(`🔥 Pesan dari ${sender}: ${text}`);

    await sock.sendPresenceUpdate("composing", sender);

    const prompt = `
      Anda adalah asisten penjualan yang membantu untuk bisnis e-commerce. 
      Pesan dari customer: "${text}"
      
      Mohon responlah dengan ramah dan profesional dalam Bahasa Indonesia. 
      Berikan jawaban yang singkat dan membantu. Jika mereka bertanya tentang produk, 
      harga, atau pesanan, berikan informasi yang membantu atau tanyakan detail lebih lanjut.

      Jika ditanya produk, maka tawarkan apakah pelanggan ingin dikirimkan katalog lengkap atau tidak. 
      Jika iya, maka kita punya produk-produk seperti:
      1. Smartphone XYZ - Harga: Rp 3.000.000
      2. Laptop ABC - Harga: Rp 7.500.000
      3. Headphone DEF - Harga: Rp 1.200.000

      Jika ditanya tentang status pesanan, minta nomor pesanan untuk pengecekan lebih lanjut.
      
      Jangan lupa untuk mengucapkan terima kasih kepada customer di akhir pesan Anda.
    `;

    const r = await askGemini(prompt);

    await sock.sendMessage(sender, { text: r });
    await sock.sendPresenceUpdate("available", sender);
  });
}

startBot();
