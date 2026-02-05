import { saveConversation } from "../../service/chatbot.service.js";

export const saveConversationController = async (req, res) => {
  try {
    const { userId, sender, message, response } = req.body;

    const conversation = await saveConversation({
      userId: userId,
      sender: sender,
      message: message,
      response: response,
      isIncoming: false,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
