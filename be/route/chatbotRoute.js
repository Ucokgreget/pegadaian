import express from "express";
import { getRuntimeConfig } from "../controller/chatbot/runtimeController.js";
import {
  getUserSetting,
  updateSetting,
} from "../controller/chatbot/settingController.js";
import { saveConversationController } from "../controller/chatbot/logController.js";
import {
  getPendingBlast,
  getCompletedBlast,
  getUserBlast,
  createBlast,
} from "../controller/chatbot/blastController.js";
import { getRuntime } from "../lib/runtimeStore.js";
import {
  connectBot,
  disconnectBot,
} from "../controller/chatbot/connectController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/runtime/:device", getRuntimeConfig);
router.get("/runtime", (req, res) => {
  const data = parseInt(req.user.id);
  return res.json(getRuntime(data));
});
router.get("/setting", getUserSetting);
router.put("/setting", updateSetting);
router.post("/conversation", saveConversationController);
router.get("/blast", getUserBlast);
router.post("/blast", createBlast);
router.get("/blast/pending", getPendingBlast);
router.get("/blast/completed", getCompletedBlast);
router.post("/connect", connectBot);
router.post("/disconnect", disconnectBot);

export default router;
