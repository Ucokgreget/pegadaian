import express from "express";
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
  getPublicPackages,
} from "../controller/packageController.js";

const router = express.Router();

router.get("/public", getPublicPackages);
router.route("/").get(getPackages).post(createPackage);
router.patch("/:id/toggle", togglePackageActive);
router
  .route("/:id")
  .get(getPackageById)
  .put(updatePackage)
  .delete(deletePackage);
export default router;
