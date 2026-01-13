import express from "express";
import {
  getUsersWithAnalytics,
  updateUser,
  deleteUser,
} from "../controller/userController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// router.use(requireAuth);

// Middleware to ensure admin?
// Ideally yes, but for now rely on frontend protection or just requireAuth.
// Better: const requireAdmin = (req, res, next) => req.user.role === 'ADMIN' ? next() : res.sendStatus(403);
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Require Admin Role" });
  }
  next();
};

router.get("/user-analytics", requireAuth, requireAdmin, getUsersWithAnalytics);
router
  .route("/user/:id")
  .put(requireAuth, requireAdmin, updateUser)
  .delete(requireAuth, requireAdmin, deleteUser);

export default router;
