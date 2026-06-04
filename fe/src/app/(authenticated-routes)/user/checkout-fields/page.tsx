"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Phone,
  Type,
  AlignLeft,
  ClipboardList,
  Save,
  AlertTriangle,
  X,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  getCheckoutFields,
  createCheckoutField,
  updateCheckoutField,
  deleteCheckoutField,
  reorderCheckoutFields,
} from "@/actions/checkoutField";
import type {
  CheckoutField,
  InputType,
  CreateCheckoutFieldInput,
} from "@/types/CheckoutField";

// ─── Input type display config ────────────────────────────────────────────────

const INPUT_TYPE_CONFIG: Record<
  InputType,
  { label: string; icon: React.ReactNode; badge: string }
> = {
  text: {
    label: "Teks",
    icon: <Type className="w-3.5 h-3.5" />,
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  phone: {
    label: "No. HP",
    icon: <Phone className="w-3.5 h-3.5" />,
    badge:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  },
  textarea: {
    label: "Teks Panjang",
    icon: <AlignLeft className="w-3.5 h-3.5" />,
    badge:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

// ─── Form default ─────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateCheckoutFieldInput = {
  label: "",
  fieldKey: "",
  question: "",
  inputType: "text",
  isRequired: true,
  isActive: true,
};

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CheckoutFieldsPage() {
  const queryClient = useQueryClient();
  const token = "";

  // local state
  const [localFields, setLocalFields] = useState<CheckoutField[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CheckoutField | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<CreateCheckoutFieldInput>({ ...EMPTY_FORM });

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: remoteFields = [], isLoading } = useQuery<CheckoutField[]>({
    queryKey: ["checkout-fields"],
    queryFn: () => getCheckoutFields(token),
  });

  // Sync server data into local list only when we're not mid-reorder
  useEffect(() => {
    if (!orderChanged) setLocalFields(remoteFields);
  }, [remoteFields, orderChanged]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateCheckoutFieldInput) =>
      createCheckoutField(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] });
      closeModal();
      toast.success("Field berhasil ditambahkan!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCheckoutFieldInput> }) =>
      updateCheckoutField(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] });
      closeModal();
      toast.success("Field berhasil diperbarui!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCheckoutField(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] });
      setDeleteId(null);
      toast.success("Field berhasil dihapus!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: number; order: number }[]) =>
      reorderCheckoutFields(token, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] });
      setOrderChanged(false);
      toast.success("Urutan berhasil disimpan!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateCheckoutField(token, id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      // Optimistic update
      setLocalFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isActive } : f))
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] }),
    onError: (e: Error) => {
      toast.error(e.message);
      // Revert
      queryClient.invalidateQueries({ queryKey: ["checkout-fields"] });
    },
  });

  // ── Reorder ───────────────────────────────────────────────────────────────
  const moveField = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= localFields.length) return;
    const next = [...localFields];
    [next[index], next[target]] = [next[target], next[index]];
    setLocalFields(next);
    setOrderChanged(true);
  };

  const saveOrder = () => {
    reorderMutation.mutate(
      localFields.map((f, i) => ({ id: f.id, order: i }))
    );
  };

  const resetOrder = () => {
    setLocalFields(remoteFields);
    setOrderChanged(false);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingField(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (field: CheckoutField) => {
    setEditingField(field);
    setForm({
      label: field.label,
      fieldKey: field.fieldKey,
      question: field.question,
      inputType: field.inputType,
      isRequired: field.isRequired,
      isActive: field.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingField) {
      updateMutation.mutate({ id: editingField.id, data: form });
    } else {
      createMutation.mutate({ ...form, order: localFields.length });
    }
  };

  // Auto-generate camelCase fieldKey from label when creating
  const handleLabelChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      label: val,
      fieldKey: editingField
        ? prev.fieldKey
        : val
            .trim()
            .toLowerCase()
            .replace(/\s+(.)/g, (_, c) => c.toUpperCase()) // camelCase
            .replace(/[^a-zA-Z0-9]/g, ""),
    }));
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeFields = localFields.filter((f) => f.isActive);
  const requiredCount = activeFields.filter((f) => f.isRequired).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat form checkout...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      <div className="container mx-auto max-w-4xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Form Checkout
            </h1>
            <p className="text-muted-foreground">
              Atur pertanyaan yang ditanyakan bot kepada pelanggan saat checkout
              via WhatsApp
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Sembunyikan" : "Preview"}
            </Button>
            <Button
              size="lg"
              className="rounded-xl shadow-lg transition-all duration-300"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Field
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Field",
              value: localFields.length,
              colorVal: "text-primary",
              colorBg: "bg-primary/10",
            },
            {
              label: "Aktif",
              value: activeFields.length,
              colorVal: "text-green-500",
              colorBg: "bg-green-500/10",
            },
            {
              label: "Wajib Isi",
              value: requiredCount,
              colorVal: "text-orange-500",
              colorBg: "bg-orange-500/10",
            },
          ].map(({ label, value, colorVal, colorBg }) => (
            <div
              key={label}
              className="bg-card rounded-xl p-4 border border-border shadow-sm text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-bold ${colorVal}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Unsaved order banner ── */}
        {orderChanged && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Urutan belum disimpan ke server
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={resetOrder}>
                Reset
              </Button>
              <Button
                size="sm"
                disabled={reorderMutation.isPending}
                onClick={saveOrder}
                className="bg-amber-500 hover:bg-amber-600 text-white border-0"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {reorderMutation.isPending ? "Menyimpan..." : "Simpan Urutan"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Field list ── */}
        <div className="space-y-2">
          {localFields.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 border border-dashed border-border text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-foreground font-medium mb-1">
                Belum ada field checkout
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Tambah pertanyaan yang akan ditanyakan bot saat pelanggan
                checkout
              </p>
              <Button onClick={openAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Field Pertama
              </Button>
            </div>
          ) : (
            localFields.map((field, index) => {
              const cfg =
                INPUT_TYPE_CONFIG[field.inputType] ?? INPUT_TYPE_CONFIG.text;
              return (
                <div
                  key={field.id}
                  className={`bg-card rounded-xl border transition-all duration-200 hover:border-primary/30 ${
                    field.isActive
                      ? "border-border"
                      : "border-border/40 opacity-55"
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* ── Order arrows + number ── */}
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0 w-6">
                      <button
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        title="Naikan"
                        className="w-6 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-muted-foreground leading-none">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => moveField(index, "down")}
                        disabled={index === localFields.length - 1}
                        title="Turunkan"
                        className="w-6 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ── Field info ── */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {field.label}
                        </span>
                        <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground border border-border/60">
                          {field.fieldKey}
                        </code>
                        {/* input type badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${cfg.badge}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        {/* required badge */}
                        {field.isRequired ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium border border-red-500/20">
                            Wajib
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border/60">
                            Opsional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {field.question}
                      </p>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Active toggle */}
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: field.id,
                            isActive: !field.isActive,
                          })
                        }
                        title={field.isActive ? "Nonaktifkan" : "Aktifkan"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          field.isActive
                            ? "text-green-500 bg-green-500/10 hover:bg-green-500/20"
                            : "text-muted-foreground bg-muted hover:bg-accent"
                        }`}
                      >
                        {field.isActive ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(field)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(field.id)}
                        title="Hapus"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── WhatsApp Preview ── */}
        {showPreview && activeFields.length > 0 && (
          <div className="mt-8 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <p className="text-sm font-semibold text-foreground">
                Preview — Urutan Pertanyaan di WhatsApp
              </p>
              <span className="ml-auto text-xs text-muted-foreground">
                {activeFields.length} pertanyaan aktif
              </span>
            </div>
            <div className="p-5 space-y-3">
              {activeFields.map((f, i) => (
                <div key={f.id} className="flex gap-3 items-start">
                  {/* Step bubble */}
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  {/* Chat bubble */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl rounded-tl-none px-4 py-2.5 max-w-xs">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {f.question}
                      {!f.isRequired && (
                        <span className="text-muted-foreground">
                          {"\n"}
                          <em>(opsional, ketik SKIP untuk melewati)</em>
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {(() => {
                        const cfg =
                          INPUT_TYPE_CONFIG[f.inputType] ??
                          INPUT_TYPE_CONFIG.text;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium border ${cfg.badge}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        );
                      })()}
                      {f.isRequired && (
                        <span className="text-[10px] text-red-500 font-medium">
                          wajib
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* After all fields → confirm order */}
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-tl-none px-4 py-2.5">
                  <p className="text-sm text-foreground italic">
                    Konfirmasi pesanan ditampilkan…
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFields.length === 0 && localFields.length > 0 && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
            ⚠️ Semua field dinonaktifkan. Bot akan langsung ke konfirmasi pesanan
            tanpa menanyakan data pengiriman.
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Perubahan berlaku untuk checkout berikutnya — sesi yang sedang
          berjalan tidak terpengaruh.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingField ? "Edit Field" : "Tambah Field Baru"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editingField
                    ? "Ubah konfigurasi field checkout"
                    : "Buat pertanyaan baru untuk form checkout"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Label{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    (nama kolom di konfirmasi pesanan)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="cth. Nama Lengkap"
                  required
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-colors"
                />
              </div>

              {/* Field key */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Field Key{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    (identifier unik, huruf kecil & camelCase)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.fieldKey}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      fieldKey: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    }))
                  }
                  placeholder="cth. customerName"
                  required
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground font-mono text-sm placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gunakan{" "}
                  <code className="bg-muted px-1 rounded">customerName</code>,{" "}
                  <code className="bg-muted px-1 rounded">customerPhone</code>,{" "}
                  <code className="bg-muted px-1 rounded">address</code>,{" "}
                  <code className="bg-muted px-1 rounded">city</code> untuk
                  integrasi standar
                </p>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Pertanyaan ke Pelanggan{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </label>
                <textarea
                  value={form.question}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, question: e.target.value }))
                  }
                  placeholder="cth. Silakan masukkan *nama lengkap* penerima:"
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gunakan <code className="bg-muted px-1 rounded">*teks*</code>{" "}
                  untuk huruf tebal di WhatsApp
                </p>
              </div>

              {/* Input type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipe Input
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["text", "phone", "textarea"] as InputType[]).map((t) => {
                    const cfg = INPUT_TYPE_CONFIG[t];
                    const isSelected = form.inputType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, inputType: t }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent"
                        }`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {form.inputType === "phone" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Validasi otomatis: hanya menerima 10–13 digit angka
                  </p>
                )}
              </div>

              {/* isRequired + isActive toggles */}
              <div className="grid grid-cols-2 gap-3">
                {/* isRequired */}
                <div
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all select-none ${
                    form.isRequired
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border bg-background"
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, isRequired: !p.isRequired }))
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Wajib Diisi
                    </span>
                    <Toggle
                      checked={form.isRequired ?? true}
                      onChange={(v) => setForm((p) => ({ ...p, isRequired: v }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Pelanggan harus mengisi kolom ini
                  </p>
                </div>

                {/* isActive */}
                <div
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all select-none ${
                    form.isActive
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border bg-background"
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, isActive: !p.isActive }))
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Aktif
                    </span>
                    <Toggle
                      checked={form.isActive ?? true}
                      onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Tampilkan saat checkout
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Menyimpan..."
                    : editingField
                    ? "Simpan Perubahan"
                    : "Tambah Field"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Hapus Field?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Field ini akan dihapus permanen dan tidak akan lagi ditanyakan
              kepada pelanggan.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteId)}
              >
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
}
