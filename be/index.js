import express from "express";
import cors from "cors";
import "dotenv/config";
import requireAuth from "./middleware/requireAuth.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

const app = express();
const port = process.env.PORT || 8000;

import postRoute from "./route/postRoute.js";
import authRoute from "./route/authRoute.js";
import userRoute from "./route/userRoute.js";
import customerRoute from "./route/customerRoute.js";
import productRoute from "./route/productRoute.js";
import subscriptionRoute from "./route/subscriptionRoute.js";
import packageRoute from "./route/packageRoute.js";
import packageFeatureRoute from "./route/packageFeatureRoute.js";
import adminRoute from "./route/adminRoute.js";
import chatbotRoute from "./route/chatbotRoute.js";
import productVariantRoute from "./route/productVariantRoute.js";
import promoCodeRoute from "./route/promoCodeRoute.js";
import { getPublicPackages } from "./controller/packageController.js";
import { getPublicFeatures } from "./controller/packageFeatureController.js";
import checkoutRoute from "./route/checkoutRoute.js";
import { validatePromoCode } from "./controller/promoCodeController.js";

app.use(express.json());
app.use("/public", express.static("public"));
app.use(
  cors({
    origin: "*",
    allowedHeaders: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

// ─── Public routes (tanpa auth) ────────────────────────────────────────────
app.use("/", authRoute);
app.get("/package/public", getPublicPackages);
app.get("/package/public/:id/features", getPublicFeatures);
app.post("/promo/validate", validatePromoCode);
// ─── Protected routes (wajib login) ────────────────────────────────────────
app.use("/post", requireAuth, postRoute);
app.use("/customer", requireAuth, customerRoute);
app.use("/product", requireAuth, productRoute);
app.use("/subscription", requireAuth, subscriptionRoute);
app.use("/chatbot", requireAuth, chatbotRoute);
app.use("/product-variant", requireAuth, productVariantRoute);
app.use("/checkout", requireAuth, checkoutRoute);

// ─── Admin only routes ──────────────────────────────────────────────────────
app.use(
  "/package/:packageId/features",
  requireAuth,
  requireAdmin,
  packageFeatureRoute,
);
app.use("/package", requireAuth, requireAdmin, packageRoute);
app.use("/admin", requireAuth, requireAdmin, adminRoute);
app.use("/promo", requireAuth, requireAdmin, promoCodeRoute);

// ─── Wildcard user route — HARUS PALING BAWAH ──────────────────────────────
app.use("/", requireAuth, userRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
