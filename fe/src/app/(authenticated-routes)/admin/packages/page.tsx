"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Users,
  Calendar,
  Loader2,
  X
} from "lucide-react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  Package as PackageType,
  CreatePackageInput
} from "@/actions/package";

export default function PackagesPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationDays: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await getPackages(token);
      setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.durationDays) {
      alert("All fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const packageData: CreatePackageInput = {
        name: formData.name,
        price: parseInt(formData.price),
        durationDays: parseInt(formData.durationDays),
      };

      if (editingPackage) {
        await updatePackage(token, editingPackage.id, packageData);
        alert("Package updated successfully!");
      } else {
        await createPackage(token, packageData);
        alert("Package created successfully!");
      }

      handleCloseModal();
      loadPackages();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      durationDays: pkg.durationDays.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackage(token, id);
        setPackages(prev => prev.filter(p => p.id !== id));
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData({ name: "", price: "", durationDays: "" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center text-3xl font-bold text-slate-50">
              <Package className="mr-3 h-8 w-8 text-emerald-500" />
              Package Management
            </h1>
            <p className="mt-2 text-slate-400">Manage subscription packages for your platform</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            <Plus className="mr-2 h-4 w-4" />
            Add New Package
          </Button>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-500/10"
                    title="Edit Package"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                    title="Delete Package"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="mb-2 text-xl font-semibold text-slate-50 group-hover:text-emerald-400 transition-colors">{pkg.name}</h3>
              <div className="mb-4 text-2xl font-bold text-emerald-400">Rp {pkg.price.toLocaleString("id-ID")}</div>

              <div className="space-y-3 border-t border-slate-800 pt-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                  {pkg.durationDays} days duration
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-slate-500" />
                  {pkg.subscriptions?.length || 0} subscriptions
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">No packages yet</h3>
            <p className="mt-1 text-slate-500">Create your first package to get started</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-50">{editingPackage ? "Edit Package" : "Add New Package"}</h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Package Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Paket Dasar"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Price (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. 99000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Duration (Days)</label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. 30"
                    min="1"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingPackage ? "Update" : "Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
