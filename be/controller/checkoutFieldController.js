// controller/checkoutFieldController.js
import {
  getAllCheckoutFields,
  createCheckoutField,
  updateCheckoutField,
  deleteCheckoutField,
  reorderCheckoutFields,
} from "../service/checkoutField.service.js";

/**
 * GET /checkout-fields
 * Returns all fields (active + inactive) for the authenticated user, ordered by `order`.
 */
export const listFields = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const fields = await getAllCheckoutFields(userId);
    return res.json(fields);
  } catch (error) {
    console.error("listFields error:", error);
    return res.status(500).json({ error: "Gagal mengambil checkout fields" });
  }
};

/**
 * POST /checkout-fields
 * Create a new checkout field for the authenticated user.
 * Body: { label, fieldKey, question, inputType?, isRequired?, order?, isActive? }
 */
export const createField = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { label, fieldKey, question, inputType, isRequired, order, isActive } =
      req.body;

    if (!label || !fieldKey || !question) {
      return res
        .status(400)
        .json({ error: "label, fieldKey, dan question wajib diisi" });
    }

    if (inputType && !["text", "phone", "textarea"].includes(inputType)) {
      return res
        .status(400)
        .json({ error: "inputType harus salah satu dari: text, phone, textarea" });
    }

    const field = await createCheckoutField(userId, {
      label,
      fieldKey,
      question,
      inputType,
      isRequired,
      order,
      isActive,
    });
    return res.status(201).json(field);
  } catch (error) {
    console.error("createField error:", error);
    return res.status(500).json({ error: "Gagal membuat checkout field" });
  }
};

/**
 * PUT /checkout-fields/reorder
 * Bulk-update the display order of fields.
 * Body: { items: Array<{ id: number, order: number }> }
 *
 * NOTE: This route must be registered BEFORE PUT /:id in the router
 * to prevent Express from matching "reorder" as an id param.
 */
export const reorderFields = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "items harus berupa array yang tidak kosong" });
    }

    const isValid = items.every(
      (item) =>
        typeof item.id === "number" && typeof item.order === "number"
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Setiap item harus memiliki id (number) dan order (number)" });
    }

    await reorderCheckoutFields(userId, items);
    return res.json({ message: "Urutan berhasil diperbarui" });
  } catch (error) {
    console.error("reorderFields error:", error);
    return res.status(500).json({ error: "Gagal mengubah urutan fields" });
  }
};

/**
 * PUT /checkout-fields/:id
 * Update a single checkout field. Only fields owned by the current user can be updated.
 * Body: partial { label?, fieldKey?, question?, inputType?, isRequired?, order?, isActive? }
 */
export const updateField = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const { label, fieldKey, question, inputType, isRequired, order, isActive } =
      req.body;

    if (inputType && !["text", "phone", "textarea"].includes(inputType)) {
      return res
        .status(400)
        .json({ error: "inputType harus salah satu dari: text, phone, textarea" });
    }

    const updated = await updateCheckoutField(id, userId, {
      label,
      fieldKey,
      question,
      inputType,
      isRequired,
      order,
      isActive,
    });
    return res.json(updated);
  } catch (error) {
    if (error.message === "Field tidak ditemukan") {
      return res.status(404).json({ error: error.message });
    }
    console.error("updateField error:", error);
    return res.status(500).json({ error: "Gagal memperbarui checkout field" });
  }
};

/**
 * DELETE /checkout-fields/:id
 * Delete a checkout field. Only fields owned by the current user can be deleted.
 */
export const deleteField = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    await deleteCheckoutField(id, userId);
    return res.json({ message: "Checkout field berhasil dihapus" });
  } catch (error) {
    if (error.message === "Field tidak ditemukan") {
      return res.status(404).json({ error: error.message });
    }
    console.error("deleteField error:", error);
    return res.status(500).json({ error: "Gagal menghapus checkout field" });
  }
};
