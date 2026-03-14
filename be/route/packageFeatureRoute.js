import express from "express";
import {
  getFeaturesByPackage,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  getPublicFeatures,
} from "../controller/packageFeatureController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getFeaturesByPackage);
router.post("/", createFeature);
router.patch("/reorder", reorderFeatures);
router.put("/:id", updateFeature);
router.delete("/:id", deleteFeature);
router.get("/public/:id/features", getPublicFeatures);

export default router;
