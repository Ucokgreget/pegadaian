// route/knowledge.route.js

import express from "express";
import {
  uploadKnowledgeDocument,
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

router.get("/", requireAuth, listKnowledgeDocuments);

export default router;
