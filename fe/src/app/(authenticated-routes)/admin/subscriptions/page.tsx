"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter, 
  Search, 
  Download,
  Loader2,
  X
} from "lucide-react";
import { 
    getSubscriptions, 
    updateSubscription, 
    deleteSubscription, 
    Subscription 
} from "@/actions/subscription";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit">("view");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await getSubscriptions(statusFilter);
      setSubscriptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (subscription: Subscription, newStatus: "PENDING" | "ACTIVE" | "EXPIRED") => {
    if (confirm(`Are you sure you want to mark this as ${newStatus}?`)) {
        setIsProcessing(true);
        try {
            await updateSubscription(subscription.id, { status: newStatus });
            alert(`Subscription updated to ${newStatus}`);
            loadSubscriptions();
            if (isModalOpen) closeModal();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await deleteSubscription(id);
        setSubscriptions(prev => prev.filter(s => s.id !== id));
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const openModal = (subscription: Subscription, type: "view" | "edit") => {
    setSelectedSubscription(subscription);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSubscription(null);
    setIsModalOpen(false);
  };

   // Filter subscriptions based on search term (client-side)
   const filteredSubscriptions = subscriptions.filter(
    (sub) => 
      sub.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.package.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <CheckCircle className="h-3 w-3" /> Active
            </span>
        );
    } else if (status === "EXPIRED") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                <XCircle className="h-3 w-3" /> Expired
            </span>
        );
    } else {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
                <Clock className="h-3 w-3" /> Pending
            </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading subscriptions...</p>
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
                Subscription Management
            </h1>
            <p className="mt-2 text-slate-400">Manage all user subscriptions and payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
             {/* Search Filter */}
             <div className="md:col-span-4 lg:col-span-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search by user name, email, or package..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pl-10 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                    />
                </div>
             </div>

             <div className="md:col-span-2 lg:col-span-1">
                 <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)} 
                        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pl-10 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                 </div>
             </div>
        </div>

        {/* Stats Cards Row */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
             {[
                { label: 'Total', count: subscriptions.length, color: 'text-slate-50' },
                { label: 'Pending', count: subscriptions.filter(s => s.status === 'PENDING').length, color: 'text-yellow-500' },
                { label: 'Active', count: subscriptions.filter(s => s.status === 'ACTIVE').length, color: 'text-emerald-500' },
                { label: 'Expired', count: subscriptions.filter(s => s.status === 'EXPIRED').length, color: 'text-red-500' },
             ].map((stat) => (
                 <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                     <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                     <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                 </div>
             ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Package</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Duration</th>
                             <th className="px-6 py-4 font-medium uppercase tracking-wider">Created</th>
                            <th className="px-6 py-4 text-right font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredSubscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-200">{sub.user.name || "No Name"}</div>
                                    <div className="text-slate-500">{sub.user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-slate-300">
                                        <Package className="mr-2 h-4 w-4 text-emerald-500/50" />
                                        {sub.package.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={sub.status} />
                                </td>
                                <td className="px-6 py-4 font-mono text-emerald-400">
                                    Rp {sub.package.price.toLocaleString("id-ID")}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-slate-400">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {sub.package.durationDays} days
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                     {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => openModal(sub, "view")}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                         <button 
                                            onClick={() => openModal(sub, "edit")}
                                            className="rounded-lg p-2 text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                                            title="Edit Status"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sub.id)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                                            title="Delete Subscription"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {filteredSubscriptions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                    No subscriptions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedSubscription && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                 <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                         <h2 className="text-xl font-semibold text-slate-50">
                             {modalType === "view" ? "Subscription Details" : "Edit Subscription Status"}
                        </h2>
                        <button 
                            onClick={closeModal}
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">User Info</label>
                                <p className="font-semibold text-slate-200">{selectedSubscription.user.name || "No Name"}</p>
                                <p className="text-sm text-slate-400">{selectedSubscription.user.email}</p>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">Package Info</label>
                                <p className="font-semibold text-slate-200">{selectedSubscription.package.name}</p>
                                <div className="mt-1 flex items-center justify-between text-sm">
                                    <span className="text-emerald-400">Rp {selectedSubscription.package.price.toLocaleString("id-ID")}</span>
                                    <span className="text-slate-400">{selectedSubscription.package.durationDays} days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 sm:grid-cols-2">
                             <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">Current Status</label>
                                <div className="flex">
                                     <StatusBadge status={selectedSubscription.status} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">Created At</label>
                                <p className="text-slate-200">{new Date(selectedSubscription.createdAt).toLocaleString("id-ID")}</p>
                            </div>
                        </div>

                         <div className="grid gap-6 sm:grid-cols-2">
                             <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">Start Date</label>
                                <p className="text-slate-200">{selectedSubscription.startDate ? new Date(selectedSubscription.startDate).toLocaleDateString("id-ID") : '-'}</p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-400">End Date</label>
                                <p className="text-slate-200">{selectedSubscription.endDate ? new Date(selectedSubscription.endDate).toLocaleDateString("id-ID") : '-'}</p>
                            </div>
                        </div>
                        
                        {(selectedSubscription.paymentProofName || selectedSubscription.adminNotes) && (
                            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                                {selectedSubscription.paymentProofName && (
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">Payment Proof</label>
                                        <p className="text-sm text-slate-300">{selectedSubscription.paymentProofName}</p>
                                    </div>
                                )}
                                {selectedSubscription.adminNotes && (
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">Admin Notes</label>
                                        <p className="text-sm italic text-slate-300">{selectedSubscription.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {modalType === "edit" && (
                            <div className="border-t border-slate-800 pt-6">
                                <p className="mb-4 text-sm text-slate-400">Quick Actions:</p>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => handleStatusChange(selectedSubscription, "ACTIVE")} 
                                        disabled={selectedSubscription.status === "ACTIVE" || isProcessing}
                                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Activate
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusChange(selectedSubscription, "EXPIRED")} 
                                        disabled={selectedSubscription.status === "EXPIRED" || isProcessing}
                                        className="flex-1 bg-red-600 text-white hover:bg-red-500"
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                        Expire
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {modalType === 'view' && (
                             <div className="mt-6 flex justify-end">
                                <Button variant="outline" onClick={closeModal} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Close
                                </Button>
                             </div>
                        )}
                    </div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};
