"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  CheckCircle2,
  Upload,
  Clipboard,
  X,
  RefreshCw,
  ShieldCheck,
  Clock,
  XCircle,
  Eye,
  Store,
  MapPin,
  Info,
  ChevronDown,
  CreditCard,
  ImageIcon,
  BadgeCheck,
  CircleDashed,
  ScanLine,
  ImageUp,
  Type,
} from "lucide-react";
import {
  getQrisSettings,
  saveQrisSettings,
  getPayments,
  verifyPayment,
  type PaymentRecord,
  type QrisSettingsResponse,
} from "@/actions/payment";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Menunggu",
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  PAID: {
    label: "Lunas",
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  FAILED: {
    label: "Ditolak",
    cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    cls: "bg-muted text-muted-foreground border-border",
    icon: <CircleDashed className="w-3 h-3" />,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.EXPIRED;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

/** Modal to show proof image full-size */
function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const src = url.startsWith("http") ? url : `${API_URL}/${url}`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18 }}
        className="relative bg-card rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-semibold text-foreground">
            Bukti Pembayaran
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Bukti pembayaran"
          className="w-full object-contain max-h-[70vh]"
        />
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PaymentMethodPage() {
  const queryClient = useQueryClient();

  // ── Payments state ─────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("all");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: qrisSettings, isLoading: loadingQris } =
    useQuery<QrisSettingsResponse>({
      queryKey: ["qris-settings"],
      queryFn: () => getQrisSettings(),
    });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ["payments", statusFilter],
    queryFn: () =>
      getPayments({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50,
      }),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "PAID" | "FAILED" }) =>
      verifyPayment(id, status),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setVerifyingId(null);
      toast.success(
        vars.status === "PAID"
          ? "✅ Pembayaran berhasil diverifikasi!"
          : "❌ Pembayaran ditolak.",
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setVerifyingId(null);
    },
  });

  const payments: PaymentRecord[] = paymentsData?.data ?? [];

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingQris) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      <ToastContainerComponent />

      <div className="container mx-auto max-w-5xl space-y-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
              Metode Pembayaran
            </h1>
            <p className="text-muted-foreground text-sm">
              Atur QRIS statis toko Anda — bot otomatis generate QRIS dinamis
              per transaksi
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                qrisSettings?.configured
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {qrisSettings?.configured ? "QRIS Aktif" : "Belum dikonfigurasi"}
            </span>
          </div>
        </motion.div>

        {/* ── QRIS Setup card — child component owns its own state to avoid effect-setState ── */}
        <QrisSetupCard settings={qrisSettings ?? null} />

        {/* ── How it works ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            {
              step: "1",
              icon: <QrCode className="w-5 h-5" />,
              title: "Simpan QRIS Statis",
              desc: "Upload satu kali QRIS statis toko Anda dari bank/e-wallet",
              color: "text-primary bg-primary/10",
            },
            {
              step: "2",
              icon: <RefreshCw className="w-5 h-5" />,
              title: "Auto Convert",
              desc: "Bot otomatis generate QRIS dinamis dengan nominal order per transaksi",
              color: "text-blue-500 bg-blue-500/10",
            },
            {
              step: "3",
              icon: <ShieldCheck className="w-5 h-5" />,
              title: "Verifikasi Manual",
              desc: "Setelah customer upload bukti bayar, Anda verifikasi dari halaman ini",
              color: "text-violet-500 bg-violet-500/10",
            },
          ].map(({ step, icon, title, desc, color }) => (
            <div
              key={step}
              className="bg-card rounded-2xl border border-border p-5 flex gap-4 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                  Langkah {step}
                </p>
                <p className="font-semibold text-foreground text-sm mb-1">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Incoming Payments ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Pembayaran Masuk
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {paymentsData?.meta?.total ?? 0} total transaksi QRIS
                </p>
              </div>
            </div>

            {/* Status filter */}
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full appearance-none rounded-xl border border-border bg-background pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="PAID">Lunas</option>
                <option value="FAILED">Ditolak</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          {loadingPayments ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-foreground mb-1">
                Belum ada pembayaran
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Pembayaran QRIS akan muncul di sini setelah customer upload
                bukti transfer
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                      Order
                    </th>
                    <th className="px-5 py-3.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                      Customer
                    </th>
                    <th className="px-5 py-3.5 text-right font-medium text-muted-foreground whitespace-nowrap">
                      Nominal
                    </th>
                    <th className="px-5 py-3.5 text-center font-medium text-muted-foreground whitespace-nowrap">
                      Bukti
                    </th>
                    <th className="px-5 py-3.5 text-center font-medium text-muted-foreground whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-5 py-3.5 text-right font-medium text-muted-foreground whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <PaymentRow
                      key={p.id}
                      payment={p}
                      isVerifying={verifyingId === p.id}
                      onVerify={(status) => {
                        setVerifyingId(p.id);
                        verifyMutation.mutate({ id: p.id, status });
                      }}
                      onViewProof={() => setProofUrl(p.proofUrl)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Proof image modal ── */}
      <AnimatePresence>
        {proofUrl && (
          <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PaymentRow ───────────────────────────────────────────────────────────────

function PaymentRow({
  payment: p,
  isVerifying,
  onVerify,
  onViewProof,
}: {
  payment: PaymentRecord;
  isVerifying: boolean;
  onVerify: (s: "PAID" | "FAILED") => void;
  onViewProof: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"PAID" | "FAILED" | null>(
    null,
  );

  const requestVerify = (action: "PAID" | "FAILED") => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const confirm = () => {
    if (pendingAction) onVerify(pendingAction);
    setConfirmOpen(false);
  };

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors group">
        {/* Order code */}
        <td className="px-5 py-3.5">
          <span className="font-mono text-xs font-semibold text-foreground">
            {p.waOrder?.orderCode ?? `#${p.id}`}
          </span>
        </td>

        {/* Customer */}
        <td className="px-5 py-3.5">
          {p.waOrder ? (
            <div>
              <p className="text-foreground font-medium text-xs leading-snug">
                {p.waOrder.customerName}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {p.waOrder.customerPhone}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>

        {/* Amount */}
        <td className="px-5 py-3.5 text-right font-semibold text-foreground">
          {formatRupiah(p.amount)}
        </td>

        {/* Proof */}
        <td className="px-5 py-3.5 text-center">
          {p.proofUrl ? (
            <button
              onClick={onViewProof}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Lihat
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="w-3.5 h-3.5" />
              Belum ada
            </span>
          )}
        </td>

        {/* Status */}
        <td className="px-5 py-3.5 text-center">
          <StatusBadge status={p.status} />
        </td>

        {/* Date */}
        <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(p.createdAt)}
        </td>

        {/* Actions */}
        <td className="px-5 py-3.5 text-right">
          {p.status === "PENDING" ? (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => requestVerify("PAID")}
                disabled={isVerifying}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-50 transition-colors border border-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verifikasi
              </button>
              <button
                onClick={() => requestVerify("FAILED")}
                disabled={isVerifying}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-500/20 disabled:opacity-50 transition-colors border border-rose-500/20"
              >
                <XCircle className="w-3.5 h-3.5" />
                Tolak
              </button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {p.paidAt ? formatDate(p.paidAt) : "—"}
            </span>
          )}
        </td>
      </tr>

      {/* Inline confirmation row */}
      <AnimatePresence>
        {confirmOpen && (
          <tr>
            <td colSpan={7} className="p-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-5 py-3 flex items-center justify-between gap-4 text-sm ${
                  pendingAction === "PAID"
                    ? "bg-emerald-500/5 border-y border-emerald-500/15"
                    : "bg-rose-500/5 border-y border-rose-500/15"
                }`}
              >
                <span className="font-medium text-foreground">
                  {pendingAction === "PAID"
                    ? `Tandai pembayaran ${formatRupiah(p.amount)} sebagai LUNAS?`
                    : `Tolak pembayaran ${formatRupiah(p.amount)}?`}
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={confirm}
                    disabled={isVerifying}
                    className={`rounded-lg text-xs h-7 ${
                      pendingAction === "PAID"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-rose-500 hover:bg-rose-600"
                    } text-white`}
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Ya, Konfirmasi"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    className="rounded-lg text-xs h-7"
                  >
                    Batal
                  </Button>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── InfoChip ─────────────────────────────────────────────────────────────────

function InfoChip({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground">{children}</span>
    </div>
  );
}

// ─── QrisSetupCard ────────────────────────────────────────────────────────────
// State di-init dari prop (lazy useState) → tidak perlu useEffect untuk sync.
// Fitur: tab Paste String | Scan dari Gambar (jsQR decode via canvas).

type InputMode = "text" | "image";

function QrisSetupCard({
  settings,
}: {
  settings: QrisSettingsResponse | null;
}) {
  const queryClient = useQueryClient();

  // ── form state ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<InputMode>("text");
  const [qrisInput, setQrisInput] = useState(() => settings?.qrisStatic ?? "");
  const [previewQr, setPreviewQr] = useState(() =>
    settings?.qrisStatic && settings.qrisStatic.length > 20
      ? settings.qrisStatic
      : "",
  );

  // ── image scanning state ──────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scannedPreviewSrc, setScannedPreviewSrc] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce live QR preview (300 ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewQr(qrisInput.trim().length > 20 ? qrisInput.trim() : "");
    }, 300);
    return () => clearTimeout(t);
  }, [qrisInput]);

  // ── mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (qris: string) => saveQrisSettings(qris),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qris-settings"] });
      toast.success(
        `✅ QRIS berhasil disimpan! Merchant: ${data.merchantName}, ${data.merchantCity}`,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── image → QRIS string decoder ───────────────────────────────────────────
  const scanImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP, dll)");
      return;
    }

    // Show image preview immediately
    const objectUrl = URL.createObjectURL(file);
    setScannedPreviewSrc(objectUrl);
    setScanning(true);

    try {
      // Dynamic import so jsQR only loads when needed
      const jsQR = (await import("jsqr")).default;

      const decoded = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx)
            return reject(new Error("Canvas tidak tersedia di browser ini"));
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) resolve(code.data);
          else
            reject(
              new Error(
                "QR tidak terdeteksi. Pastikan gambar jelas, tidak buram, dan tidak terpotong.",
              ),
            );
        };
        img.onerror = () => reject(new Error("Gagal memuat gambar"));
        img.src = objectUrl;
      });

      if (!decoded.startsWith("000201")) {
        throw new Error(
          "QR terdeteksi tetapi bukan QRIS yang valid (harus diawali 000201)",
        );
      }

      setQrisInput(decoded);
      setMode("text"); // switch ke tab teks agar user bisa verifikasi hasilnya
      toast.success("✅ QRIS berhasil di-scan dari gambar!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setScanning(false);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  // ── drag & drop handlers ──────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) scanImageFile(file);
    },
    [scanImageFile],
  );

  // ── other handlers ────────────────────────────────────────────────────────
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrisInput(text.trim());
      toast.info("QRIS berhasil di-paste dari clipboard");
    } catch {
      toast.error("Gagal membaca clipboard. Paste manual di textarea.");
    }
  }, []);

  const handleSave = () => {
    const v = qrisInput.trim();
    if (!v) return toast.error("QRIS string tidak boleh kosong");
    if (!v.startsWith("000201"))
      return toast.error('QRIS harus diawali "000201"');
    saveMutation.mutate(v);
  };

  const clearInput = () => {
    setQrisInput("");
    setPreviewQr("");
    setScannedPreviewSrc(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* ── Card header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">QRIS Statis Toko</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste string atau upload gambar QRIS dari bank / e-wallet Anda
          </p>
        </div>
        {settings?.configured && (
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <BadgeCheck className="w-3.5 h-3.5" />
            Tersimpan
          </span>
        )}
      </div>

      <div className="p-6 grid gap-6 md:grid-cols-[1fr_220px]">
        {/* ── Left: form ── */}
        <div className="space-y-4 min-w-0">
          {/* Merchant info chips */}
          {settings?.configured && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-2"
            >
              <InfoChip
                icon={<Store className="w-3.5 h-3.5" />}
                label="Merchant"
              >
                {settings.merchantName}
              </InfoChip>
              <InfoChip icon={<MapPin className="w-3.5 h-3.5" />} label="Kota">
                {settings.merchantCity}
              </InfoChip>
              <InfoChip icon={<Info className="w-3.5 h-3.5" />} label="Tipe">
                {settings.method === "static" ? "Statis" : "Dinamis"}
              </InfoChip>
            </motion.div>
          )}

          {/* ── Tab switcher ── */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            {(
              [
                {
                  key: "text",
                  label: "Paste String",
                  icon: <Type className="w-3.5 h-3.5" />,
                },
                {
                  key: "image",
                  label: "Scan Gambar",
                  icon: <ScanLine className="w-3.5 h-3.5" />,
                },
              ] as { key: InputMode; label: string; icon: React.ReactNode }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  mode === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Content area (animated switch) ── */}
          <AnimatePresence mode="wait">
            {mode === "text" ? (
              <motion.div
                key="text-mode"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Textarea */}
                <div>
                  <div className="relative">
                    <textarea
                      value={qrisInput}
                      onChange={(e) => setQrisInput(e.target.value)}
                      placeholder="Paste string QRIS di sini... (dimulai dengan 000201...)"
                      rows={6}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                      spellCheck={false}
                    />
                    {qrisInput && (
                      <button
                        onClick={clearInput}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {qrisInput.trim().length > 0
                      ? `${qrisInput.trim().length} karakter — siap disimpan`
                      : "Salin QRIS string dari aplikasi bank (bukan file gambarnya)"}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending || !qrisInput.trim()}
                    className="rounded-xl shadow-sm"
                  >
                    {saveMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {saveMutation.isPending ? "Menyimpan..." : "Simpan QRIS"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePaste}
                    className="rounded-xl"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste Clipboard
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="image-mode"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {/* Drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !scanning && fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-50 ${
                    dragOver
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
                  } ${scanning ? "pointer-events-none" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) scanImageFile(f);
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {scanning ? (
                      <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="relative">
                          <ScanLine className="w-10 h-10 text-primary animate-pulse" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                        </div>
                        <p className="text-sm font-medium text-primary">
                          Membaca QR code...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mohon tunggu sebentar
                        </p>
                      </motion.div>
                    ) : scannedPreviewSrc && mode === "image" ? (
                      <motion.div
                        key="preview-img"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2 p-3 w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={scannedPreviewSrc}
                          alt="Gambar QR yang diupload"
                          className="max-h-36 max-w-full object-contain rounded-lg border border-border shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Klik untuk ganti gambar
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3 px-6 text-center"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                            dragOver
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <ImageUp className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {dragOver
                              ? "Lepas untuk scan!"
                              : "Upload gambar QRIS"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Drag & drop atau klik untuk pilih file
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 mt-1">
                            JPG, PNG, WebP — maks 10 MB
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tip */}
                <div className="flex gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload screenshot / foto QR statis dari aplikasi bank.
                    String QRIS akan diekstrak otomatis dan bisa Anda verifikasi
                    di tab{" "}
                    <button
                      onClick={() => setMode("text")}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Paste String
                    </button>
                    .
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: QR preview ── */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <p className="text-xs font-medium text-muted-foreground self-start">
            Preview QR
          </p>
          <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {previewQr ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-white rounded-xl"
                >
                  <QRCode
                    value={previewQr}
                    size={148}
                    level="M"
                    style={{ display: "block" }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 text-center px-4"
                >
                  <QrCode className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Preview QR muncul setelah string terisi
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {previewQr && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-2"
            >
              <p className="text-[11px] text-muted-foreground text-center leading-snug">
                QRIS statis — bot convert jadi dinamis per transaksi
              </p>
              {/* Save shortcut when not already saved */}
              {!settings?.configured && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full rounded-xl text-xs h-8"
                >
                  {saveMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Simpan QRIS
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Info banner (always visible at bottom) ── */}
      <div className="mx-6 mb-6 flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Dua cara input QRIS:</p>
          <ul className="space-y-0.5">
            <li>
              <span className="font-medium text-foreground">Paste String</span>{" "}
              — salin teks QRIS dari aplikasi bank (developer/merchant mode)
            </li>
            <li>
              <span className="font-medium text-foreground">Scan Gambar</span> —
              upload screenshot / foto QR dari HP, string akan diekstrak
              otomatis
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
