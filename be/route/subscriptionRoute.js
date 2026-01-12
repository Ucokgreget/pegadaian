import express from "express";
import {
    getSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} from "../controller/subscriptionController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getSubscriptions).post(createSubscription);
router.route("/:id").get(getSubscriptionById).put(updateSubscription).delete(deleteSubscription);

export default router;