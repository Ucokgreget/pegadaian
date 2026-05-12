// middleware/upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// =========================
// Helper
// =========================
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createStorage(uploadDir) {
  ensureDirExists(uploadDir);

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();

      const safeFieldName = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, "");
      cb(null, `${safeFieldName}-${uniqueSuffix}${ext}`);
    },
  });
}

// =========================
// Product Image Upload
// =========================
const productUploadDir = "public/uploads/products";

const productImageFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage: createStorage(productUploadDir),
  fileFilter: productImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// =========================
// Knowledge Document Upload
// =========================
const knowledgeUploadDir = "public/uploads/knowledge";

const knowledgeFileFilter = (req, file, cb) => {
  const allowedExtensions = [".txt", ".pdf", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error("Only .txt, .pdf, and .docx files are allowed!"),
      false,
    );
  }

  cb(null, true);
};

export const uploadKnowledge = multer({
  storage: createStorage(knowledgeUploadDir),
  fileFilter: knowledgeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
