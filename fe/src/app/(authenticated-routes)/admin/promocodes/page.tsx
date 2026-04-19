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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p>Memuat promo...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainerComponent />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1100px] mx-auto py-10 px-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground m-0 tracking-[-0.02em]">
                <Tag className="w-[1.4rem] h-[1.4rem] text-primary" /> Promo Code
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 mb-0">
                Kelola kode diskon untuk pengguna platform
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:opacity-90">
              <Plus className="w-4 h-4" /> Buat Promo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-7 max-sm:grid-cols-1">
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
              <div key={stat.label} className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 [&>svg]:w-[1.1rem] [&>svg]:h-[1.1rem]">{stat.icon}</div>
                <div>
                  <p className="text-[1.4rem] font-bold text-foreground m-0 leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          {promos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 bg-card border border-dashed border-border rounded-xl text-center text-muted-foreground">
              <Tag className="w-10 h-10 opacity-40" />
              <h3>Belum ada promo</h3>
              <p>Buat kode promo pertama untuk mulai memberikan diskon</p>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:opacity-90">
                <Plus className="w-4 h-4" /> Buat Promo
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden max-sm:overflow-x-auto">
              <table className="w-full border-collapse text-sm text-left">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Kode</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Tipe</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Nilai</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Kuota</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Periode</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em] whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const status = getStatus(promo);
                    return (
                      <tr key={promo.id} className="border-b border-border transition-colors duration-100 last:border-none hover:bg-muted/40">
                        <td className="py-3.5 px-4 align-middle">
                          <span className="inline-flex items-center bg-primary/10 text-primary border border-primary/25 rounded-md px-2.5 py-1 text-[0.8rem] font-bold font-mono tracking-[0.05em]">{promo.code}</span>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${promo.type === "percent" ? "bg-chart-2/12 text-chart-2" : "bg-chart-4/12 text-chart-4"}`}
                          >
                            {promo.type === "percent" ? (
                              <>
                                <Percent className="w-3 h-3" /> Persen
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-3 h-3" /> Fixed
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <span className="text-sm text-foreground font-medium">
                            {promo.type === "percent"
                              ? `${promo.value}%${promo.maxDiscount ? ` (maks Rp ${promo.maxDiscount.toLocaleString("id-ID")})` : ""}`
                              : `Rp ${promo.value.toLocaleString("id-ID")}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-baseline gap-1">
                            <span className="font-semibold text-foreground">{promo.used}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-muted-foreground text-[0.8rem]">
                              {promo.quota ?? "∞"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[0.8rem]">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {formatDate(promo.startAt)} —{" "}
                              {formatDate(promo.endAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${status === "active" ? "bg-chart-2/12 text-chart-2" : status === "expired" ? "bg-muted-foreground/12 text-muted-foreground" : status === "inactive" ? "bg-destructive/12 text-destructive" : "bg-chart-4/12 text-chart-4"}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggle(promo.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-muted"
                              title="Toggle aktif"
                            >
                              {promo.isActive ? (
                                <ToggleRight className="w-5 h-5 text-chart-2" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(promo)}
                              className="flex items-center justify-center w-8 h-8 rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-muted"
                              title="Edit"
                            >
                              <Edit2 className="w-[0.85rem] h-[0.85rem] text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id, promo.code)}
                              className={`flex items-center justify-center w-8 h-8 rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-destructive/12`}
                              title="Hapus"
                            >
                              <Trash2 className="w-[0.85rem] h-[0.85rem] text-destructive" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[520px] bg-card border border-border rounded-2xl p-7 shadow-[0_20px_60px_color-mix(in_oklch,var(--foreground)_12%,transparent)] animate-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[1.1rem] font-bold m-0">
                {editingPromo ? "Edit Promo" : "Buat Promo Baru"}
              </h2>
              <button onClick={handleCloseModal} className="flex items-center justify-center w-8 h-8 rounded-sm border-none bg-transparent cursor-pointer text-muted-foreground transition-colors duration-150 hover:bg-muted">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Kode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-foreground">Kode Promo *</label>
                <input
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. HEMAT50"
                  className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              {/* Tipe & Nilai */}
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-foreground">Tipe *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  >
                    <option value="percent">Persen (%)</option>
                    <option value="fixed">Fixed (Rp)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-foreground">
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
                    className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  />
                </div>
              </div>

              {/* Max Discount — hanya muncul kalau percent */}
              {formData.type === "percent" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-foreground">
                    Maks. Diskon (Rp){" "}
                    <span className="font-normal text-muted-foreground">opsional</span>
                  </label>
                  <input
                    name="maxDiscount"
                    type="number"
                    value={formData.maxDiscount ?? ""}
                    onChange={handleChange}
                    min={0}
                    placeholder="e.g. 100000 (kosongkan jika tidak ada batas)"
                    className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  />
                </div>
              )}

              {/* Kuota */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-foreground">
                  Kuota{" "}
                  <span className="font-normal text-muted-foreground">
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
                  className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                />
              </div>

              {/* Periode */}
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-foreground">Tanggal Mulai *</label>
                  <input
                    name="startAt"
                    type="date"
                    value={formData.startAt}
                    onChange={handleChange}
                    className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-foreground">Tanggal Selesai *</label>
                  <input
                    name="endAt"
                    type="date"
                    value={formData.endAt}
                    onChange={handleChange}
                    className="bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground outline-none w-full transition-colors duration-150 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                  />
                </div>
              </div>

              {/* isActive */}
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span>Aktifkan promo ini</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-lg border border-border bg-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-colors duration-150 hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg border-none bg-primary text-primary-foreground text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-opacity duration-150 hover:not(:disabled):opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
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
