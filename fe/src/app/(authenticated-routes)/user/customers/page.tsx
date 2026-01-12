"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  FileText, 
  User as UserIcon, 
  Eye, 
  Loader2,
  X,
  UserPlus
} from "lucide-react";
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  Customer, 
  CreateCustomerInput 
} from "@/actions/customer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view">("add");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CreateCustomerInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Customers
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === "add") {
        await createCustomer(formData);
        alert("Customer successfully added!");
      } else if (modalType === "edit" && editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        alert("Customer successfully updated!");
      }
      handleCloseModal();
      loadCustomers();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you user you want to delete this customer? This action cannot be undone.")) {
      try {
        await deleteCustomer(id);
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const openModal = (type: "add" | "edit" | "view", customer: Customer | null = null) => {
    setModalType(type);
    setEditingCustomer(customer);
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
  };

  // Filter logic
  const filteredCustomers = customers.filter(
    (customer) => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center text-3xl font-bold text-slate-50">
              <Users className="mr-3 h-8 w-8 text-emerald-500" />
              Database Customers
            </h1>
            <p className="mt-2 text-slate-400">
              Kelola data pelanggan dan prospek bisnis Anda.
            </p>
          </div>
          <Button 
            onClick={() => openModal("add")} 
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Customer
          </Button>
        </div>

        {/* Search & Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Cari customer berdasarkan nama, email, atau nomor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 pl-12 pr-4 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
            </div>
            
            <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
                <div>
                    <p className="text-sm font-medium text-slate-400">Total Customers</p>
                    <p className="text-2xl font-bold text-emerald-400">{customers.length}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500/50" />
            </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg">
              {/* Header */}
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-slate-50 group-hover:text-emerald-400 transition-colors">{customer.name}</h3>
                  <p className="truncate text-sm text-slate-400">{customer.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mb-6 space-y-2.5">
                <div className="flex items-center space-x-2.5 text-sm text-slate-400">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="truncate">{customer.phone || "-"}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="truncate">{customer.address || "-"}</span>
                </div>
                {customer.notes && (
                  <div className="flex items-start space-x-2.5 text-sm text-slate-400">
                    <FileText className="mt-0.5 h-4 w-4 flex-none text-slate-500" />
                    <span className="line-clamp-2 italic text-slate-500">{customer.notes}</span>
                  </div>
                )}
              </div>

              {/* Footer / Actions */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-600">
                    Join: {new Date(customer.createdAt).toLocaleDateString("id-ID")}
                </span>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => openModal("view", customer)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => openModal("edit", customer)}
                        className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-500/10"
                        title="Edit Customer"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(customer.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                        title="Delete Customer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">
                {searchTerm ? "Customer tidak ditemukan" : "Belum ada customer"}
            </h3>
            <p className="mt-1 text-slate-500">
                {searchTerm ? "Coba kata kunci pencarian lain" : "Mulai bangun database pelanggan Anda."}
            </p>
            {!searchTerm && (
              <Button onClick={() => openModal("add")} className="mt-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Customer Pertama
              </Button>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-50">
                    {modalType === "view" ? "Detail Customer" : modalType === "edit" ? "Edit Data Customer" : "Tambah Customer Baru"}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {modalType === "view" && editingCustomer ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <UserIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-50">{editingCustomer.name}</h3>
                            <p className="text-slate-400">{editingCustomer.email}</p>
                        </div>
                    </div>
                    
                    <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                             <span className="text-sm text-slate-500">Nomor Telepon</span>
                             <span className="text-sm font-medium text-slate-200">{editingCustomer.phone || "-"}</span>
                        </div>
                         <div className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                             <span className="text-sm text-slate-500">Alamat</span>
                             <span className="text-sm font-medium text-slate-200">{editingCustomer.address || "-"}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                             <span className="text-sm text-slate-500">Catatan</span>
                             <span className="text-sm font-medium text-slate-200 italic">{editingCustomer.notes || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                             <span className="text-sm text-slate-500">Bergabung</span>
                             <span className="text-sm font-medium text-slate-200">{new Date(editingCustomer.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                    </div>

                    <Button onClick={handleCloseModal} className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
                      Tutup
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Nama Lengkap *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="customer@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Nomor Telepon</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="08123xxx"
                            />
                        </div>
                        
                         <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Alamat</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Kota/Kabupaten"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Catatan</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Catatan tambahan..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCloseModal} 
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Batal
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {modalType === 'add' ? 'Menyimpan...' : 'Updating...'}
                            </>
                        ) : (
                            modalType === 'add' ? 'Simpan Customer' : 'Update Customer'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
