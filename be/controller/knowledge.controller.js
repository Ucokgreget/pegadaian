// controller/knowledge.controller.js

import {
  createKnowledgeFromUploadedFile,
  getKnowledgeDocumentsByUser,
} from "../service/knowledge.service.js";

export const uploadKnowledgeDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const document = await createKnowledgeFromUploadedFile({
      userId,
      file,
    });

    return res.status(201).json({
      message: "Knowledge document processed successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error in uploadKnowledgeDocument:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const listKnowledgeDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const documents = await getKnowledgeDocumentsByUser(userId);

    return res.status(200).json({
      message: "Success",
      data: documents,
    });
  } catch (error) {
    console.error("Error in listKnowledgeDocuments:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
