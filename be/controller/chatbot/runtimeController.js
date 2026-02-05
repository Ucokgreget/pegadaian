import { getRuntimeConfigByDevice } from "../../service/chatbot.service.js";

export const getRuntimeConfig = async (req, res) => {
  try {
    const { device } = req.params;
    const data = await getRuntimeConfigByDevice(device);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
