"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter, 
  Search, 
  Download, 
  ShoppingBag, 
  Shield, 
  UserCheck, 
  DollarSign,
  Loader2,
  X 
} from "lucide-react";
import { getUsersWithAnalytics, deleteUser, updateUserRole } from "@/actions/user";
import { updateSubscription } from "@/actions/subscription"; // reuse subscription action

export default function UsersPage() {
  const [data, setData] = useState<any>({ users: [], analytics: {} });
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [modalType, setModalType] = useState<"view" | "edit">("view");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getUsersWithAnalytics();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  // Handlers
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setModalType("edit");
    setIsUserModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setModalType("view");
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user? All related data will be deleted.")) {
       try {
        await deleteUser(id);
        setData((prev: any) => ({
             ...prev,
             users: prev.users.filter((u: any) => u.id !== id)
        }));
        alert("User successfully deleted.");
       } catch (error: any) {
         alert(`Error: ${error.message}`);
       }
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.target as HTMLFormElement);
    try {
        await updateUserRole(
            selectedUser.id, 
            formData.get("role") as "USER" | "ADMIN",
            formData.get("name") as string
        );
        alert("User updated successfully!");
        setIsUserModalOpen(false);
        loadData();
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleManageSubscription = (subscription: any) => {
    // Need to close user modal first or stack them? Stacking is complex in this simple UI.
    // Let's close user modal temporary or just open sub modal on top if z-index allows.
    // simpler: close view modal, open sub modal.
    setIsUserModalOpen(false); 
    setSelectedSubscription(subscription);
    setIsSubModalOpen(true);
  };

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.target as HTMLFormElement);
    try {
        await updateSubscription(selectedSubscription.id, {
            status: formData.get("status") as any,
            adminNotes: formData.get("adminNotes") as string
        });
        alert("Subscription updated successfully!");
        setIsSubModalOpen(false);
        loadData();
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  // Components
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                <CheckCircle className="h-3 w-3" /> Active
            </span>
        );
    } else if (status === "EXPIRED") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                <XCircle className="h-3 w-3" /> Expired
            </span>
        );
    } else {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
                <Clock className="h-3 w-3" /> Pending
            </span>
        );
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        role === "ADMIN" 
        ? "border border-orange-500/20 bg-orange-500/10 text-orange-400" 
        : "border border-blue-500/20 bg-blue-500/10 text-blue-400"
      }`}>
        {role === "ADMIN" ? <Shield className="mr-1 h-3 w-3" /> : <UserCheck className="mr-1 h-3 w-3" />}
        {role}
      </span>
    );
  };

  // Filtering
  const filteredUsers = data.users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading user data...</p>
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
                User Management
            </h1>
            <p className="mt-2 text-slate-400">Monitor and manage all platform users and analytics.</p>
          </div>
          <div className="flex items-center space-x-3">
             <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Download className="mr-2 h-4 w-4" />
                Export Data
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {[
                 { label: 'Total Users', value: data.analytics.totalUsers || 0, icon: Users, color: 'text-blue-500', iconColor: 'text-blue-500' },
                 { label: 'Active Subs', value: data.analytics.activeSubscriptions || 0, icon: CheckCircle, color: 'text-emerald-500', iconColor: 'text-emerald-500' },
                 { label: 'Products', value: data.analytics.totalProducts || 0, icon: ShoppingBag, color: 'text-purple-500', iconColor: 'text-purple-500' },
                 { label: 'Revenue', value: `Rp ${(data.analytics.totalRevenue || 0).toLocaleString("id-ID")}`, icon: DollarSign, color: 'text-amber-500', iconColor: 'text-amber-500' },
             ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">{item.label}</p>
                            <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p>
                        </div>
                        <item.icon className={`h-8 w-8 ${item.iconColor} opacity-50`} />
                    </div>
                </div>
             ))}
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
             <div className="md:col-span-4 lg:col-span-2">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                     <input 
                        type="text" 
                        placeholder="Search by name or email..." 
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
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)} 
                        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pl-10 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        <option value="">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                 </div>
             </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Subscriptions</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Products</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Customers</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-right font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map((user: any) => (
                             <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-200">{user.name || "No Name"}</div>
                                    <div className="text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex flex-col space-y-1">
                                      {user.subscriptions && user.subscriptions.length > 0 ? (
                                        user.subscriptions.slice(0, 2).map((sub: any) => (
                                          <div key={sub.id} className="flex items-center space-x-2">
                                            <StatusBadge status={sub.status} />
                                            <span className="text-xs text-slate-400">
                                                {sub.package.name}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-xs text-slate-500">No subscriptions</span>
                                      )}
                                      {user.subscriptions && user.subscriptions.length > 2 && <span className="text-xs text-slate-500">+{user.subscriptions.length - 2} more</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{user._count?.products || 0}</td>
                                <td className="px-6 py-4 text-slate-300">{user._count?.customers || 0}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                         <button 
                                            onClick={() => handleViewUser(user)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="rounded-lg p-2 text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                                            title="Edit User"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* User Modal */}
        {isUserModalOpen && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                     <div className="mb-6 flex items-center justify-between">
                         <h2 className="text-xl font-semibold text-slate-50">
                             {modalType === "view" ? "User Details" : "Edit User"}
                        </h2>
                        <button 
                            onClick={() => setIsUserModalOpen(false)}
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {modalType === "view" ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Name</label>
                                    <p className="text-slate-200">{selectedUser.name || "No name"}</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Email</label>
                                    <p className="text-slate-200">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Role</label>
                                    <div><RoleBadge role={selectedUser.role} /></div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Joined</label>
                                    <p className="text-slate-200">{new Date(selectedUser.createdAt).toLocaleDateString("id-ID")}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="mb-3 text-lg font-medium text-slate-200">Subscriptions history</h3>
                                {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedUser.subscriptions.map((sub: any) => (
                                            <div key={sub.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-200">{sub.package.name}</h4>
                                                        <p className="text-sm text-emerald-400">Rp {sub.package.price.toLocaleString("id-ID")}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <StatusBadge status={sub.status} />
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={() => handleManageSubscription(sub)} 
                                                            className="h-7 border-slate-700 px-2 text-xs text-slate-300"
                                                        >
                                                            Manage
                                                        </Button>
                                                    </div>
                                                </div>
                                                {sub.startDate && (
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(sub.startDate).toLocaleDateString("id-ID")} - {sub.endDate ? new Date(sub.endDate).toLocaleDateString("id-ID") : "No end date"}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center text-slate-500">
                                        No subscription history
                                    </div>
                                )}
                            </div>
                            
                            <Button onClick={() => setIsUserModalOpen(false)} className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700">Close</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleUserSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    defaultValue={selectedUser.name || ""} 
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                                <input 
                                    type="email" 
                                    value={selectedUser.email} 
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-slate-500 cursor-not-allowed" 
                                    disabled 
                                />
                                <p className="mt-1 text-xs text-slate-500">Email cannot be changed directly.</p>
                            </div>
                             <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                                <div className="relative">
                                    <select 
                                        name="role" 
                                        defaultValue={selectedUser.role} 
                                        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsUserModalOpen(false)} 
                                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}
        
         {/* Subscription Modal (Nested or Separate) */}
         {isSubModalOpen && selectedSubscription && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                 <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                    <h2 className="mb-4 text-xl font-semibold text-slate-50">Manage Subscription</h2>
                    <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-400">Package</label>
                            <p className="text-lg font-medium text-slate-200">{selectedSubscription.package.name}</p>
                        </div>
                        
                         <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                            <select 
                                name="status" 
                                defaultValue={selectedSubscription.status} 
                                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                        </div>
                        
                         <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Admin Notes</label>
                            <textarea
                                name="adminNotes"
                                defaultValue={selectedSubscription.adminNotes || ""}
                                rows={3}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Add internal notes..."
                            />
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                             <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsSubModalOpen(false)} 
                                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isProcessing}
                                className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
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
