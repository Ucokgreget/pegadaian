import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} from "baileys";
import qrcode from "qrcode-terminal";
import QRCodeGen from "qrcode";
import fs from "fs";
import path from "path";
import { convertQRIS } from "../lib/qris/index.js";
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
import { askDeepSeek } from "./deepseek.js";
import { embedText } from "../lib/embedding.js";
import { type } from "os";

import {
  getSession,
  setSession,
  clearSession,
  addToCart,
  getCartSummary,
  getCurrentStep,
  setStep,
  CHECKOUT_STEPS,
  startCheckout,
  createWAOrder,
  handleWAOrderCallback,
  formatCartMessage,
  formatOrderConfirmation,
  formatPaymentMessage,
  formatPaidNotification,
  formatOwnerNotification,
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
    console.error("❌ sock  belumsiap, tidak bisa kirim notifikasi");
    return;
  }

  try {
    const { to, text, imageBase64 } = msg;
    const jid = to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`;
    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, "base64");
      await sock.sendMessage(jid, { image: buffer, caption: text });
    } else {
      await sock.sendMessage(jid, { text });
    }
    console.log(`📤 Notifikasi terkirim ke ${jid}`);
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi WA:", error.message);
  }
});

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

  // Cleanup config cache setiap 5 menit
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of configCache.entries()) {
      if (now - entry.cachedAt > CONFIG_CACHE_TTL_MS) {
        configCache.delete(key);
      }
    }
    console.log(
      `🧹 Config cache cleanup, remaining entries: ${configCache.size}`
    );
  }, 5 * 60 * 1000);

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
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("🔴 Connection closed:", statusCode);

      // HARD LOGOUT — user unlink dari HP atau session expired
      if (statusCode === 401) {
        console.log("❌ Session revoked (401), cleaning up & stopping bot");

        // Hapus session files agar tidak retry dengan credentials invalid
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });

        // Set isActive = false di DB agar auto-reconnect tidak spawn ulang
        try {
          const devices = await prisma.device.findMany({ where: { userId } });
          const deviceIds = devices.map((d) => d.id);
          await prisma.chatbotSettings.updateMany({
            where: { deviceId: { in: deviceIds } },
            data: { isActive: false },
          });
          console.log(`🔒 User ${userId} isActive set to false`);
        } catch (dbErr) {
          console.error("⚠️ Failed to update isActive:", dbErr.message);
        }

        // Notify parent process
        process.send({ type: "disconnected", userId });
        process.exit(0);
        return;
      }

      // Notify parent untuk status codes selain 401
      process.send({ type: "disconnected", userId });

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
          elapsed < 5000 ? 3000 : 1000
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

    // Skip pesan dari grup dan newsletter/channel — bot hanya merespons DM
    if (sender.endsWith("@g.us") || sender.includes("@newsletter")) return;

    const text =
      msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";

    // Deteksi pesan gambar (untuk bukti pembayaran QRIS)
    const hasImage = !!(
      msg.message?.imageMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
    );

    // Lewatkan filter jika ada gambar ATAU ada teks — abaikan kalau keduanya kosong
    if (!text.trim() && !hasImage) {
      console.log(`💬 USER ${userId} ← ${sender}: No text or image, skipping`);
      return;
    }

    console.log(
      `💬 USER ${userId} ← ${sender}: ${hasImage ? "[image]" : ""} ${text}`
    );

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

    // ===== HANDLE IMAGE (bukti pembayaran QRIS) =====
    // Harus sebelum state machine supaya image tidak tersaring oleh text-guard
    if (hasImage) {
      const stepForImage = getCurrentStep(sender);
      if (stepForImage === CHECKOUT_STEPS.WAITING_PAYMENT) {
        try {
          // Download gambar dari WA
          const imgBuffer = await downloadMediaMessage(
            msg,
            "buffer",
            {},
            { reuploadRequest: sock.updateMediaMessage }
          );

          // Simpan ke disk
          const proofDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "payment-proofs"
          );
          fs.mkdirSync(proofDir, { recursive: true });
          const filename = `proof-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.jpg`;
          const proofPath = path.join(proofDir, filename);
          fs.writeFileSync(proofPath, imgBuffer);
          const proofUrl = `public/uploads/payment-proofs/${filename}`;

          // Cari WAOrder PENDING_PAYMENT untuk sender ini
          const pendingOrder = await prisma.wAOrder.findFirst({
            where: { senderPhone: sender, status: "PENDING_PAYMENT" },
            orderBy: { createdAt: "desc" },
          });

          if (pendingOrder) {
            // Buat / update Payment record
            const existingPayment = await prisma.payment.findFirst({
              where: { waOrderId: pendingOrder.id },
            });
            if (existingPayment) {
              await prisma.payment.update({
                where: { id: existingPayment.id },
                data: { proofUrl, status: "PENDING" },
              });
            } else {
              await prisma.payment.create({
                data: {
                  userId: pendingOrder.userId,
                  waOrderId: pendingOrder.id,
                  amount: pendingOrder.subtotal ?? 0,
                  proofUrl,
                  status: "PENDING",
                  paymentMethod: "QRIS",
                },
              });
            }

            const replyMsg = [
              `✅ *Bukti pembayaran diterima!*`,
              ``,
              `📦 Order: *${pendingOrder.orderCode}*`,
              `💰 Total: *Rp ${(pendingOrder.subtotal ?? 0).toLocaleString(
                "id-ID"
              )}*`,
              ``,
              `Merchant akan memverifikasi pembayaran Anda. Anda akan diberitahu setelah dikonfirmasi. 🙏`,
            ].join("\n");

            await sock.sendMessage(sender, { text: replyMsg });
            await saveConversation({
              userId: settings.userId,
              sender,
              message: "[Gambar: Bukti Pembayaran]",
              response: replyMsg,
              isCheckout: true,
            });
          } else {
            await sock.sendMessage(sender, {
              text: "Terima kasih, tapi kami tidak menemukan pesanan aktif Anda. Silakan hubungi merchant.",
            });
          }
        } catch (imgErr) {
          console.error("❌ Gagal proses bukti bayar:", imgErr.message);
          await sock.sendMessage(sender, {
            text: "Maaf, terjadi kesalahan saat memproses gambar. Silakan coba kirim ulang.",
          });
        }
        await sock.sendPresenceUpdate("available", sender);
        return;
      }

      // Gambar di konteks lain (bukan WAITING_PAYMENT) — abaikan jika tanpa teks
      if (!text.trim()) {
        await sock.sendPresenceUpdate("available", sender);
        return;
      }
    }

    // ===== CHECKOUT STATE MACHINE (PRIORITAS TERTINGGI) =====
    // Dicek SEBELUM command handler lainnya agar input angka/teks saat
    // sedang dalam flow checkout tidak "ditangkap" oleh handler nomor produk
    const currentStep = getCurrentStep(sender);

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
              qty: 1,
            });
            staticResponse = formatCartMessage(sender);
            setSession(sender, { pendingProduct: null });
          } else {
            staticResponse = "Silakan balas dengan nomor varian yang tersedia";
          }
        } else {
          if (text.toUpperCase() === "LANJUT") {
            // Fetch dynamic fields from DB and begin COLLECTING_FIELDS phase.
            const fields = await startCheckout(sender, settings.userId);
            if (fields.length === 0) {
              // Merchant has no active fields — skip straight to confirmation.
              setStep(sender, CHECKOUT_STEPS.CONFIRM_ORDER);
              staticResponse =
                formatOrderConfirmation(sender) ??
                "Tidak ada data pengiriman yang perlu diisi. Ketik *BAYAR* untuk lanjut.";
            } else {
              const firstField = fields[0];
              const hint = !firstField.isRequired
                ? `\n_(opsional, ketik *SKIP* untuk melewati)_`
                : "";
              staticResponse = firstField.question + hint;
            }
          } else if (text.toUpperCase() === "BATAL") {
            clearSession(sender);
            staticResponse = "Pesanan dibatalkan. Ada yang bisa kami bantu? 😊";
          } else {
            staticResponse = formatCartMessage(sender);
          }
        }

        // ── Dynamic field collection ─────────────────────────────────────────
      } else if (currentStep === CHECKOUT_STEPS.COLLECTING_FIELDS) {
        const { fields, fieldIndex } = session;

        if (!fields || fields.length === 0) {
          // Guard: no fields configured — go straight to confirm.
          setStep(sender, CHECKOUT_STEPS.CONFIRM_ORDER);
          staticResponse =
            formatOrderConfirmation(sender) ??
            "Ketik *BAYAR* untuk lanjut ke pembayaran.";
        } else {
          const currentField = fields[fieldIndex];
          const isSkip = text.toUpperCase() === "SKIP";

          if (isSkip && currentField.isRequired) {
            // Required field — cannot be skipped.
            staticResponse = `Kolom ini wajib diisi.\n${currentField.question}`;
          } else if (
            currentField.inputType === "phone" &&
            !isSkip &&
            !/^[0-9]{10,13}$/.test(text.replace(/\s/g, ""))
          ) {
            // Phone validation failed.
            staticResponse =
              "Nomor HP tidak valid. Masukkan nomor HP yang benar (10-13 digit):";
          } else {
            // Accept answer: null when the field was skipped (optional).
            const answer = isSkip ? null : text;
            const nextIndex = fieldIndex + 1;

            setSession(sender, {
              shippingData: {
                ...session.shippingData,
                [currentField.fieldKey]: answer,
              },
              fieldIndex: nextIndex,
            });

            if (nextIndex >= fields.length) {
              // All fields collected — move to order confirmation.
              setStep(sender, CHECKOUT_STEPS.CONFIRM_ORDER);
              staticResponse =
                formatOrderConfirmation(sender) ??
                "Terjadi kesalahan saat memformat konfirmasi pesanan.";
            } else {
              // Ask next field.
              const nextField = fields[nextIndex];
              const hint = !nextField.isRequired
                ? `\n_(opsional, ketik *SKIP* untuk melewati)_`
                : "";
              staticResponse = nextField.question + hint;
            }
          }
        }
      } else if (currentStep === CHECKOUT_STEPS.CONFIRM_ORDER) {
        if (text.toUpperCase() === "BAYAR") {
          try {
            const result = await createWAOrder({
              userId: settings.userId,
              senderPhone: sender,
              user: settings.user,
            });
            const { waOrder, paymentUrl, orderCode } = result;
            const subtotal = waOrder.subtotal ?? 0;

            // ─ 1. Pesan teks konfirmasi order ────────────────────────────────
            const confirmText = paymentUrl
              ? formatPaymentMessage(orderCode, paymentUrl)
              : [
                  `✅ Pesanan *${orderCode}* berhasil dibuat!`,
                  ``,
                  `💰 Total: *Rp ${subtotal.toLocaleString("id-ID")}*`,
                  ``,
                  `Silakan scan QR QRIS berikut untuk melakukan pembayaran.👇`,
                ].join("\n");

            setStep(sender, CHECKOUT_STEPS.WAITING_PAYMENT);
            await sock.sendMessage(sender, { text: confirmText });

            // ─ 2. QRIS QR Image (jika merchant punya qrisStatic) ─────────
            try {
              const merchant = await prisma.user.findUnique({
                where: { id: settings.userId },
                select: { qrisStatic: true },
              });

              if (merchant?.qrisStatic && subtotal > 0) {
                // Convert QRIS statis → dinamis dengan nominal order
                const qrString = convertQRIS(merchant.qrisStatic, {
                  amount: subtotal,
                });

                // Generate PNG buffer
                const qrBuffer = await QRCodeGen.toBuffer(qrString, {
                  errorCorrectionLevel: "M",
                  width: 512,
                  margin: 2,
                });

                // Buat caption dengan daftar item
                const itemLines = waOrder.items
                  .map((item) => {
                    const name = item.variantName
                      ? `${item.productName} - ${item.variantName}`
                      : item.productName;
                    return `• ${name} x${
                      item.qty
                    } — Rp ${item.total.toLocaleString("id-ID")}`;
                  })
                  .join("\n");

                const caption = [
                  `💳 *Pembayaran QRIS*`,
                  ``,
                  `*Produk:*`,
                  itemLines,
                  ``,
                  `💰 Total: *Rp ${subtotal.toLocaleString("id-ID")}*`,
                  `📦 Order: \`${orderCode}\``,
                  ``,
                  `_Scan QR di atas dengan aplikasi bank / e-wallet._`,
                  `_Setelah bayar, *kirim screenshot* bukti pembayaran ke sini ✅_`,
                ].join("\n");

                await sock.sendMessage(sender, {
                  image: qrBuffer,
                  caption,
                  mimetype: "image/png",
                });

                console.log(
                  `💳 QRIS dinamis terkirim ke ${sender} | order ${orderCode} | total Rp ${subtotal}`
                );
              }
            } catch (qrErr) {
              console.error("❌ Gagal generate/kirim QRIS QR:", qrErr.message);
              // Non-fatal — order tetap terbuat, user sudah dapat notif teks
            }

            await saveConversation({
              userId: settings.userId,
              sender,
              message: text,
              response: confirmText,
              isCheckout: true,
            });
            await sock.sendPresenceUpdate("available", sender);
            return; // ← early return, skip outer sock.sendMessage
          } catch (error) {
            console.error("❌ createWAOrder error:", error.message);
            staticResponse =
              "Terjadi kesalahan saat memproses pesanan. Silakan coba balas *BAYAR* lagi.";
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
            data: { status: "CANCELLED" },
          });
          clearSession(sender);
          staticResponse = "Pesanan dibatalkan.";
        } else {
          staticResponse =
            "Pesanan kamu sedang menunggu pembayaran 🕐\nSilakan selesaikan pembayaran melalui link yang sudah dikirim.\nKetik *BATAL* untuk membatalkan pesanan.";
        }
      }

      await sock.sendMessage(sender, { text: staticResponse });
      await saveConversation({
        userId: settings.userId,
        sender,
        message: text,
        response: staticResponse,
        isCheckout: true,
      });
      await sock.sendPresenceUpdate("available", sender);
      return;
    }

    // ===== BUY INTENT DETECTION (saat IDLE) =====
    const buyIntent =
      /(beli|order|pesan|mau beli|mau order|checkout|ingin beli|ingin pesan)/i.test(
        text
      );
    console.log(
      `🛒 DEBUG checkout: buyIntent=${buyIntent}, currentStep=${currentStep}, sender=${sender}`
    );

    if (buyIntent === true) {
      const allProducts = await prisma.product.findMany({
        where: { userId: settings.userId },
        include: { variants: true },
      });

      const textLower = text.toLowerCase();

      // Score every product by how many of its name-words appear in the message.
      // The best-scoring product wins, as long as at least 1 word matched.
      // This fixes the previous >= 2 hard threshold that broke single-keyword
      // product names like "Soundcore R60i NC" when the user only typed "soundcore".
      const scoredProducts = allProducts
        .map((p) => {
          const productWords = p.name
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2); // skip very short tokens
          if (productWords.length === 0) return { product: p, score: 0 };
          const matchCount = productWords.filter((w) =>
            textLower.includes(w)
          ).length;
          return { product: p, score: matchCount };
        })
        .filter(({ score }) => score >= 1) // at least 1 word must match
        .sort((a, b) => b.score - a.score); // highest score first

      const selectedProduct = scoredProducts[0]?.product ?? null;

      console.log(
        `🛒 DEBUG products: allProducts=[${allProducts
          .map((p) => p.name)
          .join(", ")}], selectedProduct=${selectedProduct?.name ?? "null"} ` +
          `(scores: ${scoredProducts
            .map((s) => `${s.product.name}:${s.score}`)
            .join(", ")})`
      );

      if (selectedProduct) {
        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
          const variantList = selectedProduct.variants
            .map(
              (v, i) =>
                `${i + 1}. ${v.name} - Rp ${v.price.toLocaleString("id-ID")}`
            )
            .join("\n");
          await sock.sendMessage(sender, {
            text: `*Pilih varian ${selectedProduct.name}:*\n\n${variantList}\n\nBalas dengan nomor varian`,
          });
          setStep(sender, CHECKOUT_STEPS.CONFIRM_CART);
          setSession(sender, {
            pendingProduct: {
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              variants: selectedProduct.variants,
            },
          });
        } else {
          addToCart(sender, {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            price: selectedProduct.price || 0,
            qty: 1,
          });
          const cartMsg = formatCartMessage(sender);
          await sock.sendMessage(sender, { text: cartMsg });
          setStep(sender, CHECKOUT_STEPS.CONFIRM_CART);
        }
        await saveConversation({
          userId: settings.userId,
          sender,
          message: text,
          response: "Checkout initiated",
          isCheckout: true,
        });
        await sock.sendPresenceUpdate("available", sender);
        return;
      }
      // Produk tidak ditemukan → lanjut ke AI agar tetap helpful
      console.log(`🛒 Produk tidak ditemukan untuk teks: "${text}"`);
    }

    // ===== AI RESPONSE =====
    const defaultPrompt = `
Anda adalah asisten penjualan yang membantu untuk bisnis e-commerce.
Balas dalam Bahasa Indonesia yang ramah dan profesional.
PENTING:
- HANYA sebut produk yang ada di Informasi Relevan / Daftar Produk
- JANGAN mengarang produk, harga, atau stok yang tidak ada di context
- Jika customer bertanya daftar produk, sebutkan SEMUA produk yang ada di context
- Jika ada "Data Produk Terkini dari Database", SELALU gunakan data tersebut untuk harga, varian, dan stok (lebih akurat dari knowledge base)

ATURAN CHECKOUT (SANGAT PENTING — JANGAN DILANGGAR):
- JANGAN PERNAH mensimulasikan proses pemesanan / checkout dalam percakapan ini
- JANGAN meminta customer memilih varian dengan mengirim angka ("balas dengan nomor varian")
- JANGAN meminta customer mengkonfirmasi pesanan, mengisi nama, alamat, atau nomor HP lewat chat AI ini
- Jika customer ingin membeli suatu produk, cukup arahkan mereka dengan kalimat seperti:
  "Untuk memesan, ketik: *mau beli [nama produk]* dan saya akan langsung proses pesanannya untuk Anda! 😊"
- Proses checkout, pemilihan varian, dan pengisian data pengiriman DITANGANI OTOMATIS oleh sistem,
  bukan oleh Anda. Tugas Anda hanya menjawab pertanyaan tentang produk.
-

ATURAN FORMAT WHATSAPP (WAJIB DIIKUTI):
- Gunakan *teks* untuk huruf tebal (bukan ** atau ___)
- Gunakan emoji secukupnya untuk memperindah pesan
- JANGAN gunakan tabel markdown (|---|---|)
- DILARANG menggunakan **teks** (double asterisk) — WhatsApp tidak mendukungnya.
Untuk tebal, HANYA gunakan *teks* (single asterisk).
- JANGAN gunakan heading markdown (##, ###)
- Pisahkan setiap produk/item dengan baris kosong
- Gunakan tanda strip (-) atau angka (1. 2. 3.) untuk list
- Untuk pertanyaan daftar produk, tampilkan SEMUA produk tanpa batasan
- Batasan 3-4 produk hanya untuk rekomendasi, bukan daftar lengkap
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

    // Deteksi pertanyaan umum tentang daftar produk (bypass RAG)
    const isGeneralProductQuery =
      /(ada produk apa|produk apa (saja|aja)|list produk|daftar produk|produk tersedia|apa (saja|aja) produk|jual apa (saja|aja)|apa yang dijual|katalog|semua produk)/i.test(
        text
      );

    if (isGeneralProductQuery) {
      console.log(
        "📦 General product query detected, bypassing RAG → fetching all products"
      );
      try {
        const allProducts = await prisma.product.findMany({
          where: { userId: settings.userId },
          include: { variants: true },
          orderBy: { createdAt: "desc" },
        });

        if (allProducts.length > 0) {
          contextText = "Daftar Semua Produk yang Tersedia:\n";
          allProducts.forEach((p, i) => {
            contextText += `${i + 1}. Produk: ${p.name}\n   Deskripsi: ${
              p.description || "-"
            }\n`;
            if (p.variants && p.variants.length > 0) {
              contextText += `   Varian:\n`;
              p.variants.forEach((v) => {
                contextText += `   - ${v.name}: Rp ${v.price.toLocaleString(
                  "id-ID"
                )} (Stok: ${v.stock})\n`;
              });
            }
            contextText += "\n";
          });
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch all products:", err.message);
      }
    } else {
      // RAG biasa untuk pertanyaan spesifik
      try {
        const embeddingValues = await embedText(text);
        const embeddingString = `[${embeddingValues.join(",")}]`;
        const SIMILARITY_THRESHOLD = 0.55;

        const relevantChunks = await prisma.$queryRaw`
          SELECT content, 1 - (embedding <=> ${embeddingString}::vector) AS similarity
          FROM "knowledge_chunks"
          WHERE user_id = ${settings.userId}
          AND 1 - (embedding <=> ${embeddingString}::vector) >= ${SIMILARITY_THRESHOLD}
          ORDER BY embedding <=> ${embeddingString}::vector
          LIMIT 5
        `;

        console.log(
          "RAG RESULT:",
          relevantChunks.map((c) => ({
            similarity: c.similarity,
            preview: c.content.substring(0, 50),
          }))
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
          ragError.message
        );
      }

      // --- PRODUCT DATA INJECTION (selalu inject semua produk) ---
      try {
        const allProducts = await prisma.product.findMany({
          where: { userId: settings.userId },
          include: { variants: true },
          orderBy: { createdAt: "desc" },
        });

        if (allProducts.length > 0) {
          console.log(
            `📋 Product DB injection: ${allProducts.length} products`
          );
          contextText +=
            "\n\nData Semua Produk dari Database (GUNAKAN INI untuk harga, varian, dan stok — lebih akurat dari knowledge base):\n";
          allProducts.forEach((p, i) => {
            contextText += `${i + 1}. Produk: ${p.name}\n   Deskripsi: ${
              p.description || "-"
            }\n`;
            if (p.variants && p.variants.length > 0) {
              contextText += `   Varian yang tersedia:\n`;
              p.variants.forEach((v) => {
                contextText += `   - ${v.name}: Rp ${v.price.toLocaleString(
                  "id-ID"
                )} (Stok: ${v.stock})${
                  v.description ? ` — ${v.description}` : ""
                }\n`;
              });
            } else {
              contextText += `   (Tidak ada varian)\n`;
            }
            contextText += "\n";
          });
        }
      } catch (dbErr) {
        console.error("⚠️ Product DB injection failed:", dbErr.message);
      }
    }

    const systemPromptContent = `${basePrompt}\n${
      contextText ? `\n${contextText}\n` : ""
    }`.trim();

    const recentConvos = await getRecentConversations(
      settings.userId,
      sender,
      5
    );
    const messages = [];

    messages.push({ role: "system", content: systemPromptContent });

    for (const convo of recentConvos.filter((c) => !c.isCheckout)) {
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
    console.log("📨 Messages to DeepSeek:");
    messages.forEach((m, i) => {
      console.log(
        `[${i}] ${m.role.toUpperCase()}: ${m.content.substring(0, 100)}...`
      );
    });

    const response = await askDeepSeek(messages);

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
