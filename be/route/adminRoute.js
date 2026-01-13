import express from "express";
import {
  getAllUsersWithAnalytics,
  getUserById,
  updateUser,
  deleteUser,
} from "../controller/adminController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireAdmin, getAllUsersWithAnalytics);
router
  .route("/:id")
  .get(requireAdmin, getUserById)
  .put(requireAdmin, updateUser)
  .delete(requireAdmin, deleteUser);

export default router;
