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
import s from "./Invoice.module.css";

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
      <div className={s.loadingWrap}>
        <Loader2 className={s.spinner} />
        <p>Memuat invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={s.errorWrap}>
        <p>Invoice tidak ditemukan.</p>
        <button onClick={() => router.push("/user")} className={s.backBtn}>
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
      <div className={s.page}>
        <div className={s.container}>
          {/* Back */}
          <button onClick={() => router.back()} className={s.backLink}>
            <ArrowLeft className={s.backIcon} /> Kembali
          </button>

          {/* Status banner */}
          <div
            className={`${s.statusBanner} ${s[`banner_${statusConfig.className}`]}`}
          >
            <StatusIcon className={s.statusIcon} />
            <div>
              <p className={s.statusLabel}>{statusConfig.label}</p>
              {invoice.status === "UNPAID" && (
                <p className={s.statusHint}>
                  {isPolling && <span className={s.pollingDot} />}
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
                <p className={s.statusHint}>
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
                className={s.payNowBtn}
              >
                Bayar Sekarang <ExternalLink className={s.externalIcon} />
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
                <div className={s.invoiceDates}>
                  <div className={s.dateRow}>
                    <span className={s.dateLabel}>Tanggal</span>
                    <span>
                      {new Date(invoice.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {invoice.dueDate && (
                    <div className={s.dateRow}>
                      <span className={s.dateLabel}>Jatuh Tempo</span>
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

              <div className={s.invoiceDivider} />

              {/* Billing to */}
              <div className={s.billingTo}>
                <p className={s.billingLabel}>Tagihan Kepada</p>
                <p className={s.billingName}>{invoice.user.name || "—"}</p>
                <p className={s.billingEmail}>{invoice.user.email}</p>
              </div>

              <div className={s.invoiceDivider} />

              {/* Items */}
              <table className={s.itemsTable}>
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
                        <p className={s.itemName}>{item.description}</p>
                        <p className={s.itemDuration}>
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

              <div className={s.invoiceDivider} />

              {/* Totals */}
              <div className={s.totals}>
                <div className={s.totalRow}>
                  <span>Subtotal</span>
                  <span>Rp {invoice.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className={s.totalRow}>
                  <span>Pajak</span>
                  <span>Rp {invoice.tax.toLocaleString("id-ID")}</span>
                </div>
                <div className={`${s.totalRow} ${s.grandTotal}`}>
                  <span>Total</span>
                  <span>Rp {invoice.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Side info */}
            <div className={s.sideCol}>
              {/* Order info */}
              <div className={s.sideCard}>
                <h3 className={s.sideCardTitle}>Info Pesanan</h3>
                <div className={s.infoRows}>
                  <div className={s.infoRow}>
                    <span className={s.infoLabel}>Kode Order</span>
                    <div className={s.infoValueRow}>
                      <span className={s.infoValue}>
                        {invoice.order.orderCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(invoice.order.orderCode)}
                        className={s.copyBtn}
                      >
                        <Copy className={s.copyIcon} />
                      </button>
                    </div>
                  </div>
                  <div className={s.infoRow}>
                    <span className={s.infoLabel}>Status Order</span>
                    <span
                      className={`${s.orderStatus} ${s[`orderStatus_${invoice.order.status.toLowerCase()}`]}`}
                    >
                      {invoice.order.status}
                    </span>
                  </div>
                  {invoice.meta?.paymentMethod && (
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Metode Bayar</span>
                      <span className={s.infoValue}>
                        {invoice.meta.paymentMethod}
                      </span>
                    </div>
                  )}
                  {invoice.meta?.tripayReference && (
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Ref. Tripay</span>
                      <div className={s.infoValueRow}>
                        <span className={s.infoValue}>
                          {invoice.meta.tripayReference}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(invoice.meta!.tripayReference)
                          }
                          className={s.copyBtn}
                        >
                          <Copy className={s.copyIcon} />
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
                  className={s.bigPayBtn}
                >
                  Selesaikan Pembayaran
                  <ExternalLink className={s.externalIcon} />
                </a>
              )}

              {invoice.status === "PAID" && (
                <button
                  onClick={() => router.push("/user")}
                  className={s.dashboardBtn}
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
