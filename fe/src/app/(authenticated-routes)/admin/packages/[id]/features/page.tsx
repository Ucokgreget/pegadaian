"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Star,
  Loader2,
  Check,
  X,
  Pencil,
} from "lucide-react";
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  PackageFeature,
} from "@/actions/packageFeature";
import ConfirmModal from "@/components/ui/modal/confirmmodal";
import { useConfirm } from "@/hooks/useconfirm";

export default function PackageFeaturesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const packageId = parseInt(id);

  const [features, setFeatures] = useState<PackageFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [newHighlighted, setNewHighlighted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editHighlighted, setEditHighlighted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const { confirm, setLoading, modalProps } = useConfirm();
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const data = await getFeatures(packageId);
      setFeatures(data);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newText.trim()) return;
    setIsAdding(true);
    try {
      const created = await createFeature(packageId, {
        featureText: newText.trim(),
        isHighlighted: newHighlighted,
        sortOrder: features.length,
      });
      setFeatures((prev) => [...prev, created]);
      setNewText("");
      setNewHighlighted(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAdding(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const startEdit = (f: PackageFeature) => {
    setEditingId(f.id);
    setEditText(f.featureText);
    setEditHighlighted(f.isHighlighted);
  };

  const saveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      const updated = await updateFeature(packageId, id, {
        featureText: editText.trim(),
        isHighlighted: editHighlighted,
      });
      setFeatures((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setEditingId(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => setEditingId(null);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: "Hapus Fitur?",
      message: "Fitur yang dihapus tidak bisa dikembalikan.",
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;

    setLoading(true);
    try {
      await deleteFeature(packageId, id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDragStart = (index: number, id: number) => {
    dragItem.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index: number, id: number) => {
    dragOverItem.current = index;
    setDragOverId(id);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...features];
    const dragged = reordered.splice(dragItem.current, 1)[0];
    reordered.splice(dragOverItem.current, 0, dragged);

    // Update sortOrder
    const withOrder = reordered.map((f, i) => ({ ...f, sortOrder: i }));
    setFeatures(withOrder);
    setDraggingId(null);
    setDragOverId(null);
    dragItem.current = null;
    dragOverItem.current = null;

    // Persist ke backend
    try {
      await reorderFeatures(
        packageId,
        withOrder.map((f) => ({ id: f.id, sortOrder: f.sortOrder })),
      );
    } catch (e: any) {
      alert("Gagal simpan urutan: " + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p>Memuat fitur...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[720px] mx-auto py-10 px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-md border border-border bg-card text-foreground cursor-pointer transition-colors duration-150 shrink-0 hover:bg-muted hover:border-ring">
              <ArrowLeft className="w-[1.1rem] h-[1.1rem]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground m-0 tracking-[-0.02em]">Package Features</h1>
              <p className="text-sm text-muted-foreground mt-1 mb-0">
                Atur fitur yang tampil di halaman pricing
              </p>
            </div>
          </div>

          {/* Add new feature */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex gap-3 items-center">
              <div className="flex-1 flex items-center gap-2 bg-background border border-input rounded-md px-3 transition-all duration-150 focus-within:border-ring focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Tulis fitur baru... (Enter untuk tambah)"
                  className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-foreground placeholder:text-muted-foreground placeholder:opacity-60"
                />
                <label className="cursor-pointer flex items-center shrink-0" title="Highlighted">
                  <input
                    type="checkbox"
                    checked={newHighlighted}
                    onChange={(e) => setNewHighlighted(e.target.checked)}
                    className="hidden"
                  />
                  <Star
                    className={`w-[1.1rem] h-[1.1rem] transition-all duration-150 ${newHighlighted ? "text-chart-4 fill-chart-4" : "text-muted-foreground"}`}
                  />
                </label>
              </div>
              <button
                onClick={handleAdd}
                disabled={isAdding || !newText.trim()}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border-none rounded-md px-4 py-2.5 text-sm font-semibold cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:not(:disabled):opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <Loader2 className="w-[0.9rem] h-[0.9rem] animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Tambah
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 mb-0">
              <Star className="w-3 h-3 text-chart-4" /> = fitur yang di-highlight (tampil
              bold/berbeda)
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-2">
            {features.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                <p>Belum ada fitur. Tambahkan fitur pertama di atas.</p>
              </div>
            )}

            {features.map((f, index) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleDragStart(index, f.id)}
                onDragEnter={() => handleDragEnter(index, f.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 bg-card border rounded-lg px-4 py-3.5 transition-all duration-150 cursor-default ${
                  draggingId === f.id
                    ? "opacity-40 scale-[0.98] shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_10%,transparent)] border-border"
                    : dragOverId === f.id && draggingId !== f.id
                    ? "border-primary shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_25%,transparent)] bg-primary/[0.04]"
                    : "border-border hover:border-ring/40"
                }`}
              >
                {/* Drag handle */}
                <div className="flex items-center cursor-grab text-muted-foreground shrink-0 active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Content */}
                {editingId === f.id ? (
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(f.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 bg-background border border-ring rounded-sm py-1.5 px-2.5 text-sm text-foreground outline-none shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_15%,transparent)]"
                    />
                    <label className="cursor-pointer flex items-center shrink-0">
                      <input
                        type="checkbox"
                        checked={editHighlighted}
                        onChange={(e) => setEditHighlighted(e.target.checked)}
                        className="hidden"
                      />
                      <Star
                        className={`w-[1.1rem] h-[1.1rem] transition-all duration-150 ${editHighlighted ? "text-chart-4 fill-chart-4" : "text-muted-foreground"}`}
                      />
                    </label>
                    <button
                      onClick={() => saveEdit(f.id)}
                      disabled={isSaving}
                      className="flex items-center justify-center w-[1.9rem] h-[1.9rem] rounded-sm border-none bg-primary/12 cursor-pointer transition-colors duration-150 hover:bg-primary/20"
                    >
                      {isSaving ? (
                        <Loader2 className="w-[0.9rem] h-[0.9rem] animate-spin" />
                      ) : (
                        <Check className="w-[0.9rem] h-[0.9rem] text-primary" />
                      )}
                    </button>
                    <button onClick={cancelEdit} className="flex items-center justify-center w-[1.9rem] h-[1.9rem] rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-muted">
                      <X className="w-[0.9rem] h-[0.9rem] text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {f.isHighlighted && <Star className="w-[0.9rem] h-[0.9rem] text-chart-4 shrink-0" />}
                      <span
                        className={`text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis ${f.isHighlighted ? "font-semibold text-foreground" : ""}`}
                      >
                        {f.featureText}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(f)}
                        className="flex items-center justify-center w-[1.9rem] h-[1.9rem] rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-muted"
                      >
                        <Pencil className="w-[0.8rem] h-[0.8rem] text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="flex items-center justify-center w-[1.9rem] h-[1.9rem] rounded-sm border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-destructive/12"
                      >
                        <Trash2 className="w-[0.8rem] h-[0.8rem] text-destructive" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {features.length > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
              <GripVertical className="w-3 h-3" /> Drag untuk mengubah urutan
            </p>
          )}
        </div>
      </div>
      <ConfirmModal {...modalProps} />
    </>
  );
}
