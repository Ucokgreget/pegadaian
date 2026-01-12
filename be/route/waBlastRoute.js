import express from "express";
import {
    getBlastMessages,
    createBlast,
} from "../controller/waBlastController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.route("/blast").get(getBlastMessages).post(createBlast);

export default router;
