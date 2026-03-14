"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Users,
  Calendar,
  Loader2,
  X,
  Star,
  ToggleLeft,
  ToggleRight,
  Tag,
  List,
} from "lucide-react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
  Package as PackageType,
  CreatePackageInput,
} from "@/actions/package";
import s from "./Packages.module.css";
import ConfirmModal from "@/components/ui/modal/confirmmodal";
import { useConfirm } from "@/hooks/useconfirm";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";

const BILLING_PERIODS = ["monthly", "yearly", "weekly", "lifetime"];

const emptyForm = {
  name: "",
  price: "",
  priceLabel: "",
  billingPeriod: "monthly",
  isPopular: false,
  isCustomPrice: false,
  isActive: true,
  sortOrder: "0",
  durationDays: "30",
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(
    null,
  );
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { confirm, setLoading, modalProps } = useConfirm();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === "" || !formData.durationDays) {
      toast.warning("Name, price, dan duration wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const packageData: CreatePackageInput = {
        name: formData.name,
        price: parseInt(formData.price),
        priceLabel: formData.priceLabel || undefined,
        billingPeriod: formData.billingPeriod,
        isPopular: formData.isPopular,
        isCustomPrice: formData.isCustomPrice,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder),
        durationDays: parseInt(formData.durationDays),
      };

      if (editingPackage) {
        await updatePackage(editingPackage.id, packageData);
        handleCloseModal();
        loadPackages();
        setTimeout(() => toast.success("Package berhasil diupdate!"), 100);
      } else {
        await createPackage(packageData);
        handleCloseModal();
        loadPackages();
        setTimeout(() => toast.success("Package berhasil ditambahkan!"), 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      priceLabel: pkg.priceLabel || "",
      billingPeriod: pkg.billingPeriod,
      isPopular: pkg.isPopular,
      isCustomPrice: pkg.isCustomPrice,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder.toString(),
      durationDays: pkg.durationDays.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: "Hapus Package?",
      message: "Package yang dihapus tidak bisa dikembalikan.",
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;

    setLoading(true);
    try {
      await deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Package berhasil dihapus!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus package");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await togglePackageActive(id);
      setPackages((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isActive: updated.isActive } : p,
        ),
      );
      toast.success(
        `Package berhasil ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}!`,
      );
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status package");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData(emptyForm);
  };

  if (isLoading) {
    return (
      <div className={s.loadingWrap}>
        <Loader2 className={s.loadingSpinner} />
        <p className={s.loadingText}>Memuat packages...</p>
      </div>
    );
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.container}>
          {/* Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>
                <Package className={s.pageTitleIcon} />
                Package Management
              </h1>
              <p className={s.pageSubtitle}>
                Kelola paket langganan platform kamu
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className={s.addBtn}>
              <Plus className={s.addBtnIcon} />
              Tambah Package
            </Button>
          </div>

          {/* Grid */}
          <div className={s.grid}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`${s.card} ${!pkg.isActive ? s.cardInactive : ""}`}
              >
                {pkg.isPopular && (
                  <div className={s.popularBadge}>
                    <Star className={s.popularIcon} /> Popular
                  </div>
                )}

                <div className={s.cardTop}>
                  <div className={s.cardIconWrap}>
                    <Package className={s.cardIcon} />
                  </div>
                  <div className={s.cardActions}>
                    <button
                      onClick={() =>
                        router.push(`/admin/packages/${pkg.id}/features`)
                      }
                      className={s.actionBtn}
                      title="Kelola Fitur"
                    >
                      <List className={s.editIcon} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(pkg.id)}
                      className={s.actionBtn}
                      title="Toggle aktif"
                    >
                      {pkg.isActive ? (
                        <ToggleRight className={s.toggleOn} />
                      ) : (
                        <ToggleLeft className={s.toggleOff} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className={s.actionBtn}
                      title="Edit"
                    >
                      <Edit2 className={s.editIcon} />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className={`${s.actionBtn} ${s.deleteBtn}`}
                      title="Hapus"
                    >
                      <Trash2 className={s.deleteIcon} />
                    </button>
                  </div>
                </div>

                <div className={s.cardBody}>
                  <h3 className={s.cardName}>{pkg.name}</h3>
                  <div className={s.cardKey}>
                    <Tag className={s.keyIcon} />
                    <span>{pkg.key}</span>
                  </div>
                  <div className={s.cardPrice}>
                    {pkg.isCustomPrice ? (
                      <span className={s.customPrice}>Custom Price</span>
                    ) : (
                      <>
                        <span className={s.priceAmount}>
                          Rp {pkg.price.toLocaleString("id-ID")}
                        </span>
                        {pkg.priceLabel && (
                          <span className={s.priceLabel}>{pkg.priceLabel}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className={s.cardFooter}>
                  <div className={s.cardMeta}>
                    <Calendar className={s.metaIcon} />
                    <span>
                      {pkg.durationDays} hari · {pkg.billingPeriod}
                    </span>
                  </div>
                  <div className={s.cardMeta}>
                    <Users className={s.metaIcon} />
                    <span>{pkg._count?.subscriptions || 0} subscriber</span>
                  </div>
                  <div
                    className={`${s.statusBadge} ${pkg.isActive ? s.statusActive : s.statusInactive}`}
                  >
                    {pkg.isActive ? "Aktif" : "Nonaktif"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {packages.length === 0 && (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>
                <Package />
              </div>
              <h3 className={s.emptyTitle}>Belum ada package</h3>
              <p className={s.emptySubtitle}>
                Buat package pertama kamu untuk memulai
              </p>
              <Button onClick={() => setIsModalOpen(true)} className={s.addBtn}>
                <Plus className={s.addBtnIcon} /> Tambah Package
              </Button>
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className={s.modalOverlay}>
              <div className={s.modal}>
                <div className={s.modalHeader}>
                  <h2 className={s.modalTitle}>
                    {editingPackage ? "Edit Package" : "Tambah Package"}
                  </h2>
                  <button onClick={handleCloseModal} className={s.modalClose}>
                    <X />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={s.form}>
                  <div className={s.formRow}>
                    <div className={s.field}>
                      <label className={s.label}>Nama Package *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={s.input}
                        placeholder="e.g. Paket Dasar"
                        required
                      />
                    </div>
                    <div className={s.field}>
                      <label className={s.label}>Harga (Rp) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={s.input}
                        placeholder="e.g. 99000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className={s.formRow}>
                    <div className={s.field}>
                      <label className={s.label}>Label Harga</label>
                      <input
                        type="text"
                        name="priceLabel"
                        value={formData.priceLabel}
                        onChange={handleInputChange}
                        className={s.input}
                        placeholder="e.g. /bulan"
                      />
                    </div>
                    <div className={s.field}>
                      <label className={s.label}>Billing Period</label>
                      <select
                        name="billingPeriod"
                        value={formData.billingPeriod}
                        onChange={handleInputChange}
                        className={s.input}
                      >
                        {BILLING_PERIODS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={s.formRow}>
                    <div className={s.field}>
                      <label className={s.label}>Durasi (Hari) *</label>
                      <input
                        type="number"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleInputChange}
                        className={s.input}
                        placeholder="e.g. 30"
                        min="1"
                        required
                      />
                    </div>
                    <div className={s.field}>
                      <label className={s.label}>Sort Order</label>
                      <input
                        type="number"
                        name="sortOrder"
                        value={formData.sortOrder}
                        onChange={handleInputChange}
                        className={s.input}
                        placeholder="e.g. 0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={s.checkboxGroup}>
                    <label className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={formData.isPopular}
                        onChange={handleInputChange}
                        className={s.checkbox}
                      />
                      <span>Popular</span>
                    </label>
                    <label className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isCustomPrice"
                        checked={formData.isCustomPrice}
                        onChange={handleInputChange}
                        className={s.checkbox}
                      />
                      <span>Custom Price</span>
                    </label>
                    <label className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className={s.checkbox}
                      />
                      <span>Aktif</span>
                    </label>
                  </div>

                  <div className={s.formActions}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className={s.cancelBtn}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={s.submitBtn}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className={s.spinnerSm} /> Menyimpan...
                        </>
                      ) : editingPackage ? (
                        "Update"
                      ) : (
                        "Buat Package"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal {...modalProps} />
      <ToastContainerComponent />
    </>
  );
}
