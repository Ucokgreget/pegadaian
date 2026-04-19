"use client";

import { useEffect, useRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi",
  message = "Apakah kamu yakin?",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isLoading = false,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Tutup dengan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-[400px] bg-card border border-border rounded-2xl p-7 flex flex-col items-center gap-4 shadow-[0_20px_60px_color-mix(in_oklch,var(--foreground)_12%,transparent)] animate-in slide-in-from-bottom-4 duration-200" role="dialog" aria-modal="true">
        {/* Icon */}
        <div className={`w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center shrink-0 ${variant === "danger" ? "text-destructive bg-destructive/12" : variant === "warning" ? "text-chart-4 bg-chart-4/15" : "text-primary bg-primary/12"}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-[1.05rem] font-semibold text-card-foreground m-0 mb-1.5">{title}</h3>
          <p className="text-sm text-muted-foreground m-0 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-lg border border-border bg-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-colors duration-150 hover:not(:disabled):bg-muted hover:not(:disabled):text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-opacity duration-150 hover:not(:disabled):opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${variant === "danger" ? "bg-destructive text-white" : variant === "warning" ? "bg-chart-4 text-background" : "bg-primary text-primary-foreground"}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
