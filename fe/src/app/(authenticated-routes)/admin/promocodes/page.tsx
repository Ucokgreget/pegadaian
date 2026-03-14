"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoActive,
  PromoCode,
  CreatePromoInput,
} from "@/actions/promoCode";
import ConfirmModal from "@/components/ui/modal/confirmmodal";
import { useConfirm } from "@/hooks/useconfirm";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";
import s from "./PromoCodes.module.css";

const emptyForm: CreatePromoInput = {
  code: "",
  type: "percent",
  value: 0,
  maxDiscount: null,
  quota: null,
  startAt: "",
  endAt: "",
  isActive: true,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatus(
  promo: PromoCode,
): "active" | "expired" | "inactive" | "upcoming" {
  if (!promo.isActive) return "inactive";
  const now = new Date();
  const start = new Date(promo.startAt);
  const end = new Date(promo.endAt);
  end.setHours(23, 59, 59, 999);
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  if (promo.quota !== null && promo.used >= promo.quota) return "expired";
  return "active";
}

const STATUS_LABEL = {
  active: "Aktif",
  expired: "Kadaluarsa",
  inactive: "Nonaktif",
  upcoming: "Belum Mulai",
};

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<CreatePromoInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm, setLoading: setConfirmLoading, modalProps } = useConfirm();

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const data = await getPromoCodes();
      setPromos(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? target.checked
          : name === "value" || name === "maxDiscount" || name === "quota"
            ? value === ""
              ? null
              : parseInt(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.code ||
      !formData.startAt ||
      !formData.endAt ||
      !formData.value
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (new Date(formData.startAt) > new Date(formData.endAt)) {
      toast.error("Tanggal mulai tidak boleh setelah tanggal selesai");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingPromo) {
        const updated = await updatePromoCode(editingPromo.id, formData);
        setPromos((prev) =>
          prev.map((p) => (p.id === editingPromo.id ? updated : p)),
        );
        toast.success("Promo berhasil diupdate!");
      } else {
        const created = await createPromoCode(formData);
        setPromos((prev) => [created, ...prev]);
        toast.success("Promo berhasil dibuat!");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxDiscount: promo.maxDiscount,
      quota: promo.quota,
      startAt: promo.startAt.split("T")[0],
      endAt: promo.endAt.split("T")[0],
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, code: string) => {
    const ok = await confirm({
      title: "Hapus Promo?",
      message: `Kode promo "${code}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setConfirmLoading(true);
    try {
      await deletePromoCode(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Promo berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await togglePromoActive(id);
      setPromos((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(
        updated.isActive ? "Promo diaktifkan" : "Promo dinonaktifkan",
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    setFormData(emptyForm);
  };

  if (isLoading) {
    return (
      <div className={s.loadingWrap}>
        <Loader2 className={s.spinner} />
        <p>Memuat promo...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainerComponent />
      <div className={s.page}>
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>
                <Tag className={s.titleIcon} /> Promo Code
              </h1>
              <p className={s.subtitle}>
                Kelola kode diskon untuk pengguna platform
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className={s.addBtn}>
              <Plus className={s.addBtnIcon} /> Buat Promo
            </button>
          </div>

          {/* Stats */}
          <div className={s.stats}>
            {[
              { label: "Total Promo", value: promos.length, icon: <Tag /> },
              {
                label: "Aktif",
                value: promos.filter((p) => getStatus(p) === "active").length,
                icon: <Zap />,
              },
              {
                label: "Total Digunakan",
                value: promos.reduce((a, p) => a + p.used, 0),
                icon: <Users />,
              },
            ].map((stat) => (
              <div key={stat.label} className={s.statCard}>
                <div className={s.statIcon}>{stat.icon}</div>
                <div>
                  <p className={s.statValue}>{stat.value}</p>
                  <p className={s.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          {promos.length === 0 ? (
            <div className={s.empty}>
              <Tag className={s.emptyIcon} />
              <h3>Belum ada promo</h3>
              <p>Buat kode promo pertama untuk mulai memberikan diskon</p>
              <button onClick={() => setIsModalOpen(true)} className={s.addBtn}>
                <Plus className={s.addBtnIcon} /> Buat Promo
              </button>
            </div>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Tipe</th>
                    <th>Nilai</th>
                    <th>Kuota</th>
                    <th>Periode</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const status = getStatus(promo);
                    return (
                      <tr key={promo.id} className={s.row}>
                        <td>
                          <span className={s.codeChip}>{promo.code}</span>
                        </td>
                        <td>
                          <span
                            className={`${s.typeBadge} ${s[`type_${promo.type}`]}`}
                          >
                            {promo.type === "percent" ? (
                              <>
                                <Percent className={s.typeIcon} /> Persen
                              </>
                            ) : (
                              <>
                                <DollarSign className={s.typeIcon} /> Fixed
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={s.valueText}>
                            {promo.type === "percent"
                              ? `${promo.value}%${promo.maxDiscount ? ` (maks Rp ${promo.maxDiscount.toLocaleString("id-ID")})` : ""}`
                              : `Rp ${promo.value.toLocaleString("id-ID")}`}
                          </span>
                        </td>
                        <td>
                          <div className={s.quotaWrap}>
                            <span className={s.quotaUsed}>{promo.used}</span>
                            <span className={s.quotaSep}>/</span>
                            <span className={s.quotaTotal}>
                              {promo.quota ?? "∞"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={s.periodWrap}>
                            <Calendar className={s.periodIcon} />
                            <span>
                              {formatDate(promo.startAt)} —{" "}
                              {formatDate(promo.endAt)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${s.statusBadge} ${s[`status_${status}`]}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                        <td>
                          <div className={s.actions}>
                            <button
                              onClick={() => handleToggle(promo.id)}
                              className={s.actionBtn}
                              title="Toggle aktif"
                            >
                              {promo.isActive ? (
                                <ToggleRight className={s.toggleOn} />
                              ) : (
                                <ToggleLeft className={s.toggleOff} />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(promo)}
                              className={s.actionBtn}
                              title="Edit"
                            >
                              <Edit2 className={s.editIcon} />
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id, promo.code)}
                              className={`${s.actionBtn} ${s.deleteBtnAction}`}
                              title="Hapus"
                            >
                              <Trash2 className={s.deleteIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={s.overlay}>
          <div className={s.modal}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingPromo ? "Edit Promo" : "Buat Promo Baru"}
              </h2>
              <button onClick={handleCloseModal} className={s.closeBtn}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              {/* Kode */}
              <div className={s.field}>
                <label className={s.label}>Kode Promo *</label>
                <input
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. HEMAT50"
                  className={s.input}
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              {/* Tipe & Nilai */}
              <div className={s.formRow}>
                <div className={s.field}>
                  <label className={s.label}>Tipe *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={s.input}
                  >
                    <option value="percent">Persen (%)</option>
                    <option value="fixed">Fixed (Rp)</option>
                  </select>
                </div>
                <div className={s.field}>
                  <label className={s.label}>
                    Nilai * {formData.type === "percent" ? "(1-100)" : "(Rp)"}
                  </label>
                  <input
                    name="value"
                    type="number"
                    value={formData.value || ""}
                    onChange={handleChange}
                    min={1}
                    max={formData.type === "percent" ? 100 : undefined}
                    placeholder={
                      formData.type === "percent" ? "e.g. 20" : "e.g. 50000"
                    }
                    className={s.input}
                  />
                </div>
              </div>

              {/* Max Discount — hanya muncul kalau percent */}
              {formData.type === "percent" && (
                <div className={s.field}>
                  <label className={s.label}>
                    Maks. Diskon (Rp){" "}
                    <span className={s.optional}>opsional</span>
                  </label>
                  <input
                    name="maxDiscount"
                    type="number"
                    value={formData.maxDiscount ?? ""}
                    onChange={handleChange}
                    min={0}
                    placeholder="e.g. 100000 (kosongkan jika tidak ada batas)"
                    className={s.input}
                  />
                </div>
              )}

              {/* Kuota */}
              <div className={s.field}>
                <label className={s.label}>
                  Kuota{" "}
                  <span className={s.optional}>
                    opsional — kosongkan untuk unlimited
                  </span>
                </label>
                <input
                  name="quota"
                  type="number"
                  value={formData.quota ?? ""}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 100"
                  className={s.input}
                />
              </div>

              {/* Periode */}
              <div className={s.formRow}>
                <div className={s.field}>
                  <label className={s.label}>Tanggal Mulai *</label>
                  <input
                    name="startAt"
                    type="date"
                    value={formData.startAt}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Tanggal Selesai *</label>
                  <input
                    name="endAt"
                    type="date"
                    value={formData.endAt}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>
              </div>

              {/* isActive */}
              <label className={s.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className={s.checkbox}
                />
                <span>Aktifkan promo ini</span>
              </label>

              {/* Actions */}
              <div className={s.formActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={s.cancelBtn}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={s.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={s.spinSm} /> Menyimpan...
                    </>
                  ) : editingPromo ? (
                    "Update Promo"
                  ) : (
                    "Buat Promo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal {...modalProps} />
    </>
  );
}
