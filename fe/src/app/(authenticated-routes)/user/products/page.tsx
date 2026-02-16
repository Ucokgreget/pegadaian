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
} from "lucide-react";
import {
  Product,
  getProducts,
  createProduct,
  updateProduct,

  deleteProduct,
} from "@/actions/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ProductsPage = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => await getProducts(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCloseModal();
      alert("Product created successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCloseModal();
      alert("Product updated successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Product deleted successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Event handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!formData.name || !formData.price) {
      alert("Name and price are required");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock || "0");
    if (selectedFile) {
      data.append("image", selectedFile);
    } else if (formData.imageUrl) {
      // Keep existing image URL if not replaced
      data.append("imageUrl", formData.imageUrl);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
    });
    setSelectedFile(null);
    // Add API_URL prefix if imageUrl is relative path from public uploads
    const imageUrl = product.imageUrl ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${API_URL}/${product.imageUrl}`) : null;
    setPreviewUrl(imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            Error: {(error as Error).message}
          </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Kelola Produk
            </h1>
            <p className="text-slate-400">
              Tambah, edit, dan kelola produk toko Anda
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Produk
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {products.length}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Package className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Stok</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Rata-rata Harga
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  Rp{" "}
                  {products.length > 0
                    ? Math.round(
                      products.reduce(
                        (sum, product) => sum + product.price,
                        0
                      ) / products.length
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group"
            >
              {/* Product Image */}
              {/* Product Image */}
              <div className="h-48 bg-slate-950 relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.startsWith("http") ? product.imageUrl : `${API_URL}/${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-slate-800 text-slate-600">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                  {product.description || "Tidak ada deskripsi"}
                </p>

                <div className="flex justify-between items-center mb-6 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Harga
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      Stok
                    </span>
                    <span className="text-sm font-medium text-white">
                      {product.stock}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/50"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="w-10 bg-slate-800 hover:bg-red-500/10 text-red-500 border border-slate-700 hover:border-red-500/50 px-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 dashed border-2">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? "Produk tidak ditemukan" : "Belum ada produk"}
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">
              {searchTerm
                ? "Coba kata kunci lain atau periksa ejaan Anda"
                : "Mulai tambahkan produk pertama Anda untuk mulai berjualan"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 rounded-xl text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Produk
              </Button>
            )}
          </div>
        )}

        {/* Modal for Add/Edit Product */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Lengkapi informasi produk di bawah ini
                </p>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Contoh: Kemeja Flanel"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                      placeholder="Jelaskan detail produk Anda..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Harga (Rp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Stok
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Gambar Produk
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="mb-2 text-sm text-slate-400">
                              <span className="font-semibold">Klik untuk upload</span>
                            </p>
                            <p className="text-xs text-slate-500">
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
                      <div className="w-32 h-32 bg-slate-950 border border-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Package className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-600 block">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-slate-800 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 h-11"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-11"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Menyimpan..."
                        : editingProduct
                          ? "Simpan Perubahan"
                          : "Buat Produk"}
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

export default ProductsPage;
