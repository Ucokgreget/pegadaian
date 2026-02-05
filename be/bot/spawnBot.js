import { fork } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { getRuntime, setRuntime } from "../lib/runtimeStore.js";
import { ms } from "zod/v4/locales";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bots = new Map(); // userId → child_process

export function spawnBotForUser(userId) {
  if (bots.has(userId)) {
    console.log("⚠ Bot already running:", userId);
    return;
  }

  const botPath = path.resolve(__dirname, "indexBot.js");

  const child = fork(botPath, [], {
    env: {
      ...process.env,
      USER_ID: userId.toString(),
    },
  });

  child.on("message", (msg) => {
    console.log(msg);
    if (!msg || msg.userId !== userId) return;

    if (msg.type === "qr") {
      const current = getRuntime(userId);
      if (current.status === "connected" || current.status === "disconnected")
        return;
      setRuntime(userId, { status: "scan_qr", qr: msg.qr });
    }

    if (msg.type === "connected") {
      setRuntime(userId, { status: "connected", qr: null });
    }

    if (msg.type === "disconnected") {
      setRuntime(userId, { status: "disconnected", qr: null });
    }
  });

  bots.set(userId, child);

  child.on("exit", (code) => {
    console.log(` Bot user ${userId} exited (${code})`);
    bots.delete(userId);
  });

  console.log("Spawn bot for user:", userId);
}

export function stopBotForUser(userId) {
  const child = bots.get(userId);
  if (!child) return;

  child.kill();
  bots.delete(userId);
  console.log(" Bot stopped for user:", userId);
}
