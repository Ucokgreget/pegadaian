import { spawnBotForUser, stopBotForUser } from "../../bot/spawnBot.js";

export const connectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    spawnBotForUser(userId);
    return res.status(200).json({ success: true, status: "waiting for qr" });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};

export const disconnectBot = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    stopBotForUser(userId);
    return res.status(200).json({ success: true, status: "bot disconnected" });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: "error" });
  }
};
