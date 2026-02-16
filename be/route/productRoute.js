import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controller/productController.js";

import requireAuth from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getProducts).post(upload.single("image"), createProduct);
router.route("/:id").get(getProductById).put(upload.single("image"), updateProduct).delete(deleteProduct);

export default router;