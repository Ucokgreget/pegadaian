// route/checkoutFieldRoute.js
import express from "express";
import {
  listFields,
  createField,
  reorderFields,
  updateField,
  deleteField,
} from "../controller/checkoutFieldController.js";

const router = express.Router();

// GET    /checkout-fields          — list all fields for current user
router.get("/", listFields);

// POST   /checkout-fields          — create a new field
router.post("/", createField);

// PUT    /checkout-fields/reorder  — bulk reorder (MUST be before /:id)
router.put("/reorder", reorderFields);

// PUT    /checkout-fields/:id      — update a single field
router.put("/:id", updateField);

// DELETE /checkout-fields/:id      — delete a field
router.delete("/:id", deleteField);

export default router;
