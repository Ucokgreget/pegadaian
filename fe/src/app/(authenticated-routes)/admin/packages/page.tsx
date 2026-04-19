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
import {
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
  Package as PackageType,
  CreatePackageInput,
} from "@/actions/package";
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
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground m-0">Memuat packages...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1280px] mx-auto py-10 px-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
            <div>
              <h1 className="flex items-center gap-3 text-[1.75rem] font-bold text-foreground tracking-[-0.02em] m-0">
                <Package className="w-8 h-8 text-primary" />
                Package Management
              </h1>
              <p className="mt-1.5 ml-11 text-sm text-muted-foreground">
                Kelola paket langganan platform kamu
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="!inline-flex !items-center !gap-2 !bg-primary !text-primary-foreground !font-semibold !text-sm !rounded-lg !px-5 !py-2.5 !border-none !transition-all !duration-200 hover:!opacity-90 hover:!-translate-y-[1px]">
              <Plus className="w-4 h-4" />
              Tambah Package
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 text-card-foreground transition-all duration-200 overflow-hidden hover:border-ring hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--primary)_10%,transparent)] hover:-translate-y-0.5 group ${!pkg.isActive ? "opacity-55 grayscale-[0.3]" : ""}`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 bg-chart-4 text-background text-[0.7rem] font-bold tracking-[0.05em] uppercase px-2.5 py-1 rounded-full">
                    <Star className="w-[0.7rem] h-[0.7rem]" /> Popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 bg-primary/12 border border-primary/20 rounded-md flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        router.push(`/admin/packages/${pkg.id}/features`)
                      }
                      className="flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-muted"
                      title="Kelola Fitur"
                    >
                      <List className="w-[0.9rem] h-[0.9rem] text-chart-2" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(pkg.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-muted"
                      title="Toggle aktif"
                    >
                      {pkg.isActive ? (
                        <ToggleRight className="w-[1.4rem] h-[1.4rem] text-primary" />
                      ) : (
                        <ToggleLeft className="w-[1.4rem] h-[1.4rem] text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-muted"
                      title="Edit"
                    >
                      <Edit2 className="w-[0.9rem] h-[0.9rem] text-chart-2" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-muted hover:!bg-destructive/12`}
                      title="Hapus"
                    >
                      <Trash2 className="w-[0.9rem] h-[0.9rem] text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[1.1rem] font-semibold text-card-foreground m-0 tracking-[-0.01em] transition-colors duration-200 group-hover:text-primary">{pkg.name}</h3>
                  <div className="flex items-center gap-1.5 text-[0.72rem] text-muted-foreground font-mono">
                    <Tag className="w-[0.7rem] h-[0.7rem] shrink-0" />
                    <span>{pkg.key}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    {pkg.isCustomPrice ? (
                      <span className="text-base font-semibold text-chart-4">Custom Price</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-primary tracking-[-0.02em]">
                          Rp {pkg.price.toLocaleString("id-ID")}
                        </span>
                        {pkg.priceLabel && (
                          <span className="text-[0.8rem] text-muted-foreground">{pkg.priceLabel}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
                    <Calendar className="w-[0.85rem] h-[0.85rem] text-muted-foreground shrink-0" />
                    <span>
                      {pkg.durationDays} hari · {pkg.billingPeriod}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
                    <Users className="w-[0.85rem] h-[0.85rem] text-muted-foreground shrink-0" />
                    <span>{pkg._count?.subscriptions || 0} subscriber</span>
                  </div>
                  <div
                    className={`self-start mt-1 text-[0.7rem] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full ${pkg.isActive ? "bg-primary/12 text-primary border border-primary/25" : "bg-muted-foreground/12 text-muted-foreground border border-muted-foreground/20"}`}
                  >
                  </div>
                </div>
              </div>
            ))}
          </div>

          {packages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-8 border border-dashed border-border rounded-3xl bg-muted/40 mt-10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4 [&>svg]:w-7 [&>svg]:h-7">
                <Package />
              </div>
              <h3 className="text-[1.1rem] font-semibold text-foreground m-0 mb-1.5">Belum ada package</h3>
              <p className="text-sm text-muted-foreground m-0 mb-6">
                Buat package pertama kamu untuk memulai
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="!inline-flex !items-center !gap-2 !bg-primary !text-primary-foreground !font-semibold !text-sm !rounded-lg !px-5 !py-2.5 !border-none !transition-all !duration-200 hover:!opacity-90 hover:!-translate-y-[1px]">
                <Plus className="w-4 h-4" /> Tambah Package
              </Button>
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-[6px] animate-in fade-in duration-150">
              <div className="w-full max-w-[560px] bg-card border border-border rounded-2xl p-7 shadow-[0_24px_64px_color-mix(in_oklch,var(--foreground)_15%,transparent)] animate-in slide-in-from-bottom-5 duration-200 max-h-[90vh] overflow-y-auto text-card-foreground">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[1.15rem] font-semibold text-card-foreground m-0">
                    {editingPackage ? "Edit Package" : "Tambah Package"}
                  </h2>
                  <button onClick={handleCloseModal} className="flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none text-muted-foreground cursor-pointer transition-colors duration-150 hover:bg-muted hover:text-foreground [&>svg]:w-[1.1rem] [&>svg]:h-[1.1rem]">
                    <X />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Nama Package *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                        placeholder="e.g. Paket Dasar"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Harga (Rp) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                        placeholder="e.g. 99000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Label Harga</label>
                      <input
                        type="text"
                        name="priceLabel"
                        value={formData.priceLabel}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                        placeholder="e.g. /bulan"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Billing Period</label>
                      <select
                        name="billingPeriod"
                        value={formData.billingPeriod}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                      >
                        {BILLING_PERIODS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Durasi (Hari) *</label>
                      <input
                        type="number"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                        placeholder="e.g. 30"
                        min="1"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8rem] font-medium text-muted-foreground tracking-[0.01em]">Sort Order</label>
                      <input
                        type="number"
                        name="sortOrder"
                        value={formData.sortOrder}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-input rounded-md px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 appearance-none placeholder:text-muted-foreground placeholder:opacity-60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_20%,transparent)] cursor-pointer"
                        placeholder="e.g. 0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-5 px-4 py-3.5 bg-background border border-input rounded-md">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={formData.isPopular}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <span>Popular</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="isCustomPrice"
                        checked={formData.isCustomPrice}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <span>Custom Price</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <span>Aktif</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="!flex-1 !border !border-border !text-muted-foreground !bg-transparent !rounded-lg !text-sm hover:!bg-muted hover:!text-foreground"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="!flex-1 !bg-primary !text-primary-foreground !font-semibold !rounded-lg !text-sm !border-none !flex !items-center !justify-center !gap-1.5 hover:not(:disabled):!opacity-90 disabled:!opacity-60 disabled:!cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
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
