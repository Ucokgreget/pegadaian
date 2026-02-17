import express from "express";
import {
    getProductVariants,
    getProductVariantById,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant
} from "../controller/productVariantController.js";

import requireAuth from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getProductVariants).post(upload.single("image"), createProductVariant);
router.route("/:id").get(getProductVariantById).put(upload.single("image"), updateProductVariant).delete(deleteProductVariant);

export default router;