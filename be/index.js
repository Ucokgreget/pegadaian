import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import requireAuth from "./middleware/requireAuth.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { prisma } from "./lib/prisma.js";
import { spawnBotForUser } from "./bot/spawnBot.js";
import { setRuntime } from "./lib/runtimeStore.js";
import passport from "./config/passport.js";

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
import {
  handleCallback,
  handleWACallback,
} from "./controller/checkoutController.js";
import knowledgeRoute from "./route/knowledge.route.js";
import checkoutFieldRoute from "./route/checkoutFieldRoute.js";

app.use(express.json());
app.use("/public", express.static("public"));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL ?? "http://localhost:3000",
      "http://localhost:3002", // Next.js production port
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3002",
    ],
    credentials: true, // needed so cookies flow during OAuth
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ─── Session (OAuth state — short-lived, only needed between redirect & callback) ───
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "change-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, // 10 minutes — plenty for OAuth round-trip
    },
  })
);

// ─── Passport (must come after session) ───────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── Public routes ────────────────────────────────────────────────────────
app.use("/", authRoute);
app.get("/package/public", getPublicPackages);
app.get("/package/public/:id/features", getPublicFeatures);
app.post("/promo/validate", validatePromoCode);
app.post("/checkout/callback", handleCallback);
app.post("/checkout/wa-callback", handleWACallback);

// ─── Protected routes ─────────────────────────────────────────────────────
app.use("/post", requireAuth, postRoute);
app.use("/customer", requireAuth, customerRoute);
app.use("/product", requireAuth, productRoute);
app.use("/subscription", requireAuth, subscriptionRoute);
app.use("/chatbot", requireAuth, chatbotRoute);
app.use("/product-variant", requireAuth, productVariantRoute);
app.use("/api/knowledge", knowledgeRoute);
app.use("/checkout-fields", requireAuth, checkoutFieldRoute);

// ─── Admin only ───────────────────────────────────────────────────────────
app.use(
  "/package/:packageId/features",
  requireAuth,
  requireAdmin,
  packageFeatureRoute
);
app.use("/package", requireAuth, requireAdmin, packageRoute);
app.use("/admin", requireAuth, requireAdmin, adminRoute);
app.use("/promo", requireAuth, requireAdmin, promoCodeRoute);
app.use("/checkout", requireAuth, checkoutRoute);

// ─── Wildcard — PALING BAWAH ──────────────────────────────────────────────
app.use("/", requireAuth, userRoute);

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Auto-reconnect: spawn bot untuk semua user yang isActive
  try {
    const activeSettings = await prisma.chatbotSettings.findMany({
      where: { isActive: true },
      select: { userId: true },
    });

    for (const { userId } of activeSettings) {
      console.log(`🔄 Auto-reconnect bot for user: ${userId}`);
      setRuntime(userId, { status: "loading", qr: null });
      spawnBotForUser(userId);
    }

    if (activeSettings.length === 0) {
      console.log("ℹ️  No active bots to reconnect.");
    }
  } catch (error) {
    console.error("❌ Failed to auto-reconnect bots:", error.message);
  }
});
