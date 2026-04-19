"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { getInvoice, Invoice } from "@/actions/checkout";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";

const STATUS_CONFIG = {
  UNPAID: { label: "Menunggu Pembayaran", icon: Clock, className: "unpaid" },
  PAID: { label: "Lunas", icon: CheckCircle2, className: "paid" },
  CANCELLED: { label: "Dibatalkan", icon: XCircle, className: "cancelled" },
  REFUNDED: { label: "Dikembalikan", icon: XCircle, className: "refunded" },
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const loadInvoice = async () => {
    const data = await getInvoice(decodeURIComponent(invoiceNumber));
    setInvoice(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  // Auto-refresh setiap 10 detik kalau masih UNPAID
  useEffect(() => {
    if (!invoice || invoice.status !== "UNPAID") return;
    setIsPolling(true);
    const interval = setInterval(async () => {
      const data = await getInvoice(decodeURIComponent(invoiceNumber));
      setInvoice(data);
      if (data?.status === "PAID") {
        clearInterval(interval);
        setIsPolling(false);
        toast.success("Pembayaran berhasil! Subscription Anda aktif.");
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [invoice?.status]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin!");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p>Memuat invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p>Invoice tidak ditemukan.</p>
        <button onClick={() => router.push("/user")} className="py-2.5 px-5 rounded-lg bg-muted text-foreground border border-border cursor-pointer text-[0.875rem]">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status];
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <ToastContainerComponent />
      <div className="min-h-screen bg-background pt-8 pb-16">
        <div className="max-w-[960px] mx-auto px-6">
          {/* Back */}
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-[0.875rem] text-muted-foreground bg-none border-none cursor-pointer mb-6 p-0 transition-colors duration-150 hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          {/* Status banner */}
          <div
            className={`flex items-center gap-4 py-5 px-6 rounded-xl mb-8 flex-wrap ${
              statusConfig.className === "unpaid" ? "bg-[#f59e0b]/10 border border-[#f59e0b]/25" :
              statusConfig.className === "paid" ? "bg-[#22c55e]/10 border border-[#22c55e]/25" :
              "bg-destructive/10 border border-destructive/25"
            }`}
          >
            <StatusIcon className={`w-7 h-7 shrink-0 ${
              statusConfig.className === "unpaid" ? "text-[#f59e0b]" :
              statusConfig.className === "paid" ? "text-[#22c55e]" :
              "text-destructive"
            }`} />
            <div>
              <p className="text-base font-bold text-foreground m-0">{statusConfig.label}</p>
              {invoice.status === "UNPAID" && (
                <p className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground mt-1 mb-0">
                  {isPolling && <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />}
                  {isPolling
                    ? "Menunggu konfirmasi pembayaran..."
                    : "Selesaikan pembayaran sebelum"}
                  {invoice.dueDate && !isPolling && (
                    <strong>
                      {" "}
                      {new Date(invoice.dueDate).toLocaleString("id-ID")}
                    </strong>
                  )}
                </p>
              )}
              {invoice.status === "PAID" && invoice.paidAt && (
                <p className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground mt-1 mb-0">
                  Dibayar pada{" "}
                  {new Date(invoice.paidAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            {invoice.status === "UNPAID" && invoice.meta?.paymentUrl && (
              <a
                href={invoice.meta.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground py-2.5 px-5 rounded-lg text-[0.875rem] font-semibold no-underline transition-opacity duration-150 whitespace-nowrap hover:opacity-90"
              >
                Bayar Sekarang <ExternalLink className="w-[0.85rem] h-[0.85rem]" />
              </a>
            )}
          </div>

          <div className={s.layout}>
            {/* Invoice detail */}
            <div className={s.invoiceCard}>
              {/* Header */}
              <div className={s.invoiceHeader}>
                <div>
                  <h1 className={s.invoiceTitle}>Invoice</h1>
                  <div className={s.invoiceNumberRow}>
                    <span className={s.invoiceNumber}>
                      {invoice.invoiceNumber}
                    </span>
                    <button
                      onClick={() => copyToClipboard(invoice.invoiceNumber)}
                      className={s.copyBtn}
                      title="Salin nomor invoice"
                    >
                      <Copy className={s.copyIcon} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-4 justify-end items-center mb-1">
                    <span className="text-[0.75rem] text-muted-foreground">Tanggal</span>
                    <span>
                      {new Date(invoice.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex gap-4 justify-end items-center mb-1">
                      <span className="text-[0.75rem] text-muted-foreground">Jatuh Tempo</span>
                      <span>
                        {new Date(invoice.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[1px] bg-border my-6" />

              {/* Billing to */}
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground m-0 mb-1.5">Tagihan Kepada</p>
                <p className="text-[0.95rem] font-semibold text-foreground m-0">{invoice.user.name || "—"}</p>
                <p className="text-[0.875rem] text-muted-foreground mt-1 mb-0">{invoice.user.email}</p>
              </div>

              <div className="h-[1px] bg-border my-6" />

              {/* Items */}
              <table className="w-full border-collapse text-[0.875rem] [&_th]:text-left [&_th]:text-[0.7rem] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-muted-foreground [&_th]:pb-3 [&_th]:border-b [&_th]:border-border [&_th:not(:first-child)]:text-right [&_td]:py-3.5 [&_td]:border-b [&_td]:border-border/50 [&_td]:align-top [&_td:not(:first-child)]:text-right">
                <thead>
                  <tr>
                    <th>Deskripsi</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoiceItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <p className="font-medium text-foreground m-0">{item.description}</p>
                        <p className="text-[0.75rem] text-muted-foreground mt-1 mb-0">
                          {item.durationDays} hari
                        </p>
                      </td>
                      <td>{item.qty}</td>
                      <td>Rp {item.price.toLocaleString("id-ID")}</td>
                      <td>Rp {item.total.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="h-[1px] bg-border my-6" />

              {/* Totals */}
              <div className="flex flex-col gap-2 max-w-[280px] ml-auto">
                <div className="flex justify-between text-[0.875rem] text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rp {invoice.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[0.875rem] text-muted-foreground">
                  <span>Pajak</span>
                  <span>Rp {invoice.tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[0.875rem] text-muted-foreground text-base font-bold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>Rp {invoice.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Side info */}
            <div>
              {/* Order info */}
              <div className="bg-card border border-border rounded-xl p-5 mb-4">
                <h3 className="text-[0.875rem] font-bold text-foreground m-0 mb-4">Info Pesanan</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Kode Order</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.8rem] text-foreground font-mono break-all">
                        {invoice.order.orderCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(invoice.order.orderCode)}
                        className="flex items-center justify-center w-6 h-6 rounded-sm border-none bg-transparent cursor-pointer text-muted-foreground transition-colors duration-150 hover:bg-muted"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status Order</span>
                    <span
                      className={`text-[0.75rem] font-semibold py-1 px-2.5 rounded-full w-fit ${
                        invoice.order.status.toLowerCase() === 'pending' ? 'bg-[#f59e0b]/12 text-[#f59e0b]' :
                        invoice.order.status.toLowerCase() === 'paid' ? 'bg-[#22c55e]/12 text-[#22c55e]' :
                        'bg-destructive/12 text-destructive'
                      }`}
                    >
                      {invoice.order.status}
                    </span>
                  </div>
                  {invoice.meta?.paymentMethod && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Metode Bayar</span>
                      <span className="text-[0.8rem] text-foreground font-mono break-all">
                        {invoice.meta.paymentMethod}
                      </span>
                    </div>
                  )}
                  {invoice.meta?.tripayReference && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Ref. Tripay</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.8rem] text-foreground font-mono break-all">
                          {invoice.meta.tripayReference}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(invoice.meta!.tripayReference)
                          }
                          className="flex items-center justify-center w-6 h-6 rounded-sm border-none bg-transparent cursor-pointer text-muted-foreground transition-colors duration-150 hover:bg-muted"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pay button if unpaid */}
              {invoice.status === "UNPAID" && invoice.meta?.paymentUrl && (
                <a
                  href={invoice.meta.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-primary text-primary-foreground text-[0.9rem] font-semibold no-underline transition-opacity duration-150 text-center hover:opacity-90"
                >
                  Selesaikan Pembayaran
                  <ExternalLink className="w-[0.85rem] h-[0.85rem]" />
                </a>
              )}

              {invoice.status === "PAID" && (
                <button
                  onClick={() => router.push("/user")}
                  className="w-full py-3.5 rounded-lg bg-foreground text-background text-[0.9rem] font-semibold border-none cursor-pointer transition-opacity duration-150 hover:opacity-90"
                >
                  Lihat Dashboard →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
