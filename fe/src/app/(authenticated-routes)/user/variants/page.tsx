"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  ShoppingBag,
  Eye,
  Upload,
  Layers,
} from "lucide-react";
import {
  ProductVariant,
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "@/actions/productVariant";
import { getProducts, Product } from "@/actions/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductVariantsPage = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    productId: "",
  });

  const {
    data: variants = [],
    isLoading,
    error,
  } = useQuery<ProductVariant[]>({
    queryKey: ["product-variants"],
    queryFn: async () => await getProductVariants(),
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => await getProducts(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createProductVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      handleCloseModal();
      alert("Variant created successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateProductVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      handleCloseModal();
      alert("Variant updated successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      alert("Variant deleted successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Event handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Skip file input
    if ((e.target as HTMLInputElement).type === "file") return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.productId) {
      alert("Name, price, and parent product are required");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock || "0");
    data.append("productId", formData.productId);

    if (selectedFile) {
      data.append("image", selectedFile);
    } else if (formData.imageUrl) {
      data.append("imageUrl", formData.imageUrl);
    }

    if (editingVariant) {
      updateMutation.mutate({ id: editingVariant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      description: variant.description || "",
      price: variant.price.toString(),
      stock: variant.stock.toString(),
      imageUrl: variant.imageUrl || "",
      productId: variant.productId.toString(),
    });
    setSelectedFile(null);
    const imageUrl = variant.imageUrl
      ? variant.imageUrl.startsWith("http")
        ? variant.imageUrl
        : `${API_URL}/${variant.imageUrl}`
      : null;
    setPreviewUrl(imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVariant(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      productId: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const filteredVariants = variants.filter(
    (variant) =>
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading variants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {(error as Error).message}</div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Varian</h1>
            <p className="text-muted-foreground">
              Kelola varian produk (ukuran, warna, jenis, dll)
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="rounded-xl shadow-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Varian
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari varian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Varian</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {variants.length}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Layers className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stok</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {variants.reduce((sum, v) => sum + v.stock, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border border-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rata-rata Harga
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  Rp{" "}
                  {variants.length > 0
                    ? Math.round(
                      variants.reduce((sum, v) => sum + v.price, 0) /
                      variants.length
                    ).toLocaleString("id-ID")
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariants.map((variant) => {
            const parentProduct = products.find((p) => p.id === variant.productId);
            return (
              <div
                key={variant.id}
                className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:border-primary/50 transition-all duration-300 group"
              >
                {/* Variant Image */}
                <div className="h-48 bg-muted relative overflow-hidden">
                  {variant.imageUrl ? (
                    <img
                      src={
                        variant.imageUrl.startsWith("http")
                          ? variant.imageUrl
                          : `${API_URL}/${variant.imageUrl}`
                      }
                      alt={variant.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                      <Layers className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  {/* Parent Product Badge */}
                  {parentProduct && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10">
                      {parentProduct.name}
                    </div>
                  )}
                </div>

                {/* Variant Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {variant.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                    {variant.description || "Tidak ada deskripsi"}
                  </p>

                  <div className="flex justify-between items-center mb-6 p-3 bg-muted rounded-xl border border-border">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">
                        Harga
                      </span>
                      <span className="text-lg font-bold text-primary">
                        Rp {variant.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">
                        Stok
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {variant.stock}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(variant)}
                      className="flex-1 bg-transparent border-input hover:bg-accent hover:text-accent-foreground"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(variant.id)}
                      className="w-10 px-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVariants.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border dashed border-2">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {searchTerm ? "Varian tidak ditemukan" : "Belum ada varian"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              {searchTerm
                ? "Coba kata kunci lain atau periksa ejaan Anda"
                : "Mulai tambahkan varian pertama Anda"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="rounded-xl px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Varian
              </Button>
            )}
          </div>
        )}

        {/* Modal for Add/Edit Variant */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">
                  {editingVariant ? "Edit Varian" : "Tambah Varian Baru"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Lengkapi informasi varian di bawah ini
                </p>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Produk Induk <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    >
                      <option value="">Pilih Produk Induk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nama Varian <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Contoh: Merah, XL, 250gr"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                      placeholder="Jelaskan detail varian..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Harga (Rp) <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Stok
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gambar Varian
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Klik untuk upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG or WEBP (Max. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <div className="w-32 h-32 bg-background border border-border rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                            <span className="text-[10px] text-muted-foreground block">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-border mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1 h-11"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Menyimpan..."
                        : editingVariant
                          ? "Simpan Perubahan"
                          : "Buat Varian"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariantsPage;
