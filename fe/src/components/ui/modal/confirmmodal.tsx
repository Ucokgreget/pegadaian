"use client";

import { useEffect, useRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import s from "./ConfirmModal.module.css";

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
      className={s.overlay}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={s.modal} role="dialog" aria-modal="true">
        {/* Icon */}
        <div className={`${s.iconWrap} ${s[`icon_${variant}`]}`}>
          <AlertTriangle className={s.icon} />
        </div>

        {/* Text */}
        <div className={s.content}>
          <h3 className={s.title}>{title}</h3>
          <p className={s.message}>{message}</p>
        </div>

        {/* Actions */}
        <div className={s.actions}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={s.cancelBtn}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`${s.confirmBtn} ${s[`confirm_${variant}`]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className={s.spinner} /> Menghapus...
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
