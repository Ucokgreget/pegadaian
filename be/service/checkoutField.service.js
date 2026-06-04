// service/checkoutField.service.js
import { prisma } from "../lib/prisma.js";

/**
 * Fetch all active CheckoutFields for a user, ordered by `order` asc.
 * Used by the bot at checkout start time.
 */
export async function getActiveCheckoutFields(userId) {
  return prisma.checkoutField.findMany({
    where: { userId, isActive: true },
    orderBy: { order: "asc" },
  });
}

/**
 * Fetch ALL fields for a user (active + inactive), for the dashboard.
 */
export async function getAllCheckoutFields(userId) {
  return prisma.checkoutField.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });
}

/**
 * Create a new CheckoutField for a user.
 */
export async function createCheckoutField(userId, data) {
  return prisma.checkoutField.create({
    data: {
      userId,
      label: data.label,
      fieldKey: data.fieldKey,
      question: data.question,
      inputType: data.inputType ?? "text",
      isRequired: data.isRequired ?? true,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Update an existing CheckoutField.
 * Ownership-checked: throws if id does not belong to userId.
 */
export async function updateCheckoutField(id, userId, data) {
  const field = await prisma.checkoutField.findFirst({
    where: { id, userId },
  });
  if (!field) throw new Error("Field tidak ditemukan");

  return prisma.checkoutField.update({
    where: { id },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.fieldKey !== undefined && { fieldKey: data.fieldKey }),
      ...(data.question !== undefined && { question: data.question }),
      ...(data.inputType !== undefined && { inputType: data.inputType }),
      ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete a CheckoutField.
 * Ownership-checked: throws if id does not belong to userId.
 */
export async function deleteCheckoutField(id, userId) {
  const field = await prisma.checkoutField.findFirst({
    where: { id, userId },
  });
  if (!field) throw new Error("Field tidak ditemukan");

  return prisma.checkoutField.delete({ where: { id } });
}

/**
 * Bulk-update the `order` for multiple fields in one transaction.
 * items: Array<{ id: number, order: number }>
 * Ownership is enforced per item: only fields owned by userId are updated.
 */
export async function reorderCheckoutFields(userId, items) {
  const updates = items.map(({ id, order }) =>
    prisma.checkoutField.updateMany({
      where: { id, userId },
      data: { order },
    })
  );
  return prisma.$transaction(updates);
}

/**
 * Seed default checkout fields for a single user if they don't already have any.
 */
export async function seedDefaultFieldsForUser(userId) {
  const existing = await prisma.checkoutField.count({ where: { userId } });
  if (existing > 0) return [];

  const defaults = [
    {
      label: "Nama Lengkap",
      fieldKey: "customerName",
      question: "Silakan masukkan *nama lengkap* penerima:",
      inputType: "text",
      isRequired: true,
      order: 0,
    },
    {
      label: "Nomor HP",
      fieldKey: "customerPhone",
      question: "Masukkan *nomor HP* penerima:",
      inputType: "phone",
      isRequired: true,
      order: 1,
    },
    {
      label: "Alamat",
      fieldKey: "address",
      question: "Masukkan *alamat lengkap* pengiriman:",
      inputType: "textarea",
      isRequired: true,
      order: 2,
    },
    {
      label: "Kota",
      fieldKey: "city",
      question: "Masukkan *kota* tujuan pengiriman:",
      inputType: "text",
      isRequired: true,
      order: 3,
    },
    {
      label: "Kode Pos",
      fieldKey: "postalCode",
      question:
        "Masukkan *kode pos* (atau ketik *SKIP* jika tidak tahu):",
      inputType: "text",
      isRequired: false,
      order: 4,
    },
    {
      label: "Catatan",
      fieldKey: "notes",
      question:
        "Ada *catatan* untuk pesanan? (atau ketik *SKIP* jika tidak ada):",
      inputType: "textarea",
      isRequired: false,
      order: 5,
    },
  ];

  const created = await prisma.checkoutField.createMany({
    data: defaults.map((f) => ({ userId, ...f })),
  });
  return created;
}
