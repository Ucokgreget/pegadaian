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
import s from "./PackageFeatures.module.css";
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
      <div className={s.loadingWrap}>
        <Loader2 className={s.spinner} />
        <p>Memuat fitur...</p>
      </div>
    );
  }

  return (
    <>
      <div className={s.page}>
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <button onClick={() => router.back()} className={s.backBtn}>
              <ArrowLeft className={s.backIcon} />
            </button>
            <div>
              <h1 className={s.title}>Package Features</h1>
              <p className={s.subtitle}>
                Atur fitur yang tampil di halaman pricing
              </p>
            </div>
          </div>

          {/* Add new feature */}
          <div className={s.addCard}>
            <div className={s.addCardInner}>
              <div className={s.addInputWrap}>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Tulis fitur baru... (Enter untuk tambah)"
                  className={s.addInput}
                />
                <label className={s.highlightToggle} title="Highlighted">
                  <input
                    type="checkbox"
                    checked={newHighlighted}
                    onChange={(e) => setNewHighlighted(e.target.checked)}
                    className={s.hiddenCheckbox}
                  />
                  <Star
                    className={`${s.starIcon} ${newHighlighted ? s.starActive : ""}`}
                  />
                </label>
              </div>
              <button
                onClick={handleAdd}
                disabled={isAdding || !newText.trim()}
                className={s.addBtn}
              >
                {isAdding ? (
                  <Loader2 className={s.spinSm} />
                ) : (
                  <Plus className={s.plusIcon} />
                )}
                Tambah
              </button>
            </div>
            <p className={s.addHint}>
              <Star className={s.hintStar} /> = fitur yang di-highlight (tampil
              bold/berbeda)
            </p>
          </div>

          {/* Feature list */}
          <div className={s.list}>
            {features.length === 0 && (
              <div className={s.empty}>
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
                className={`
                ${s.item}
                ${draggingId === f.id ? s.itemDragging : ""}
                ${dragOverId === f.id && draggingId !== f.id ? s.itemDragOver : ""}
              `}
              >
                {/* Drag handle */}
                <div className={s.dragHandle}>
                  <GripVertical className={s.gripIcon} />
                </div>

                {/* Content */}
                {editingId === f.id ? (
                  <div className={s.editRow}>
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(f.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className={s.editInput}
                    />
                    <label className={s.highlightToggle}>
                      <input
                        type="checkbox"
                        checked={editHighlighted}
                        onChange={(e) => setEditHighlighted(e.target.checked)}
                        className={s.hiddenCheckbox}
                      />
                      <Star
                        className={`${s.starIcon} ${editHighlighted ? s.starActive : ""}`}
                      />
                    </label>
                    <button
                      onClick={() => saveEdit(f.id)}
                      disabled={isSaving}
                      className={s.saveBtn}
                    >
                      {isSaving ? (
                        <Loader2 className={s.spinSm} />
                      ) : (
                        <Check className={s.checkIcon} />
                      )}
                    </button>
                    <button onClick={cancelEdit} className={s.cancelBtn}>
                      <X className={s.xIcon} />
                    </button>
                  </div>
                ) : (
                  <div className={s.featureRow}>
                    <div className={s.featureLeft}>
                      {f.isHighlighted && <Star className={s.starBadge} />}
                      <span
                        className={`${s.featureText} ${f.isHighlighted ? s.featureTextBold : ""}`}
                      >
                        {f.featureText}
                      </span>
                    </div>
                    <div className={s.featureActions}>
                      <button
                        onClick={() => startEdit(f)}
                        className={s.editBtn}
                      >
                        <Pencil className={s.editIcon} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className={s.deleteBtn}
                      >
                        <Trash2 className={s.deleteIcon} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {features.length > 0 && (
            <p className={s.dragHint}>
              <GripVertical className={s.hintGrip} /> Drag untuk mengubah urutan
            </p>
          )}
        </div>
      </div>
      <ConfirmModal {...modalProps} />
    </>
  );
}
