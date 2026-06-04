// route/knowledge.route.js

import express from "express";
import {
  uploadKnowledgeDocument,
  uploadKnowledgeFromUrl,
  listKnowledgeDocuments,
} from "../controller/knowledge.controller.js";
import { uploadKnowledge } from "../middleware/upload.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post(
  "/upload",
  requireAuth,
  uploadKnowledge.single("file"),
  uploadKnowledgeDocument
);

// Upload dari URL website — tidak perlu multer karena body JSON
router.post("/upload-url", requireAuth, uploadKnowledgeFromUrl);

router.get("/", requireAuth, listKnowledgeDocuments);

export default router;
