import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables dari .env
dotenv.config();

// Cek apakah API Key sudah terbaca
if (!process.env.AGENT_ROUTER_API_KEY) {
  console.error("❌ Error: AGENT_ROUTER_API_KEY tidak ditemukan di file .env!");
  process.exit(1);
}

// Inisialisasi koneksi ke Agent Router
const openai = new OpenAI({
  baseURL: 'https://agentrouter.org/v1', // Wajib pakai /v1 untuk standar OpenAI SDK
  apiKey: process.env.AGENT_ROUTER_API_KEY,
});

async function runTest() {
  console.log("⏳ Sedang mencoba melakukan hit ke API Agent Router...\n");

  try {
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      // Ganti nama model sesuai yang terdaftar di API Information Agent Router kamu
      // Contoh: "deepseek-chat", "deepseek-v4-pro", atau "gpt-4o"
      model: "claude-haiku-4-5-20251001", 
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is 2 + 2?"}
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("✅ BERHASIL! (Waktu respons:", duration, "ms)");
    console.log("=========================================");
    console.log("🤖 AI:", response.choices[0].message.content);
    console.log("=========================================");
    console.log("📊 Token terpakai:", response.usage.total_tokens);

  } catch (error) {
    console.error("❌ GAGAL MENGHUBUNGI API!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Pesan Error:", error.message);
    }
  }
}

// Jalankan fungsi
runTest();