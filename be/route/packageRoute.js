import express from "express";
import {
    getPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
} from "../controller/packageController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getPackages).post(createPackage);
router.route("/:id").get(getPackageById).put(updatePackage).delete(deletePackage);

export default router;