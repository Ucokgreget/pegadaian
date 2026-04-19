"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  ArrowRight,
  Receipt,
  TrendingUp,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { getUserInvoices, Invoice } from "@/actions/checkout";

const STATUS_CONFIG = {
  UNPAID: { label: "Menunggu", icon: Clock, cls: "unpaid" },
  PAID: { label: "Lunas", icon: CheckCircle2, cls: "paid" },
  CANCELLED: { label: "Batal", icon: XCircle, cls: "cancelled" },
  REFUNDED: { label: "Refund", icon: RefreshCcw, cls: "refunded" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    const load = async () => {
      const data = await getUserInvoices();
      setInvoices(data);
      setIsLoading(false);
    };
    load();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    unpaid: invoices.filter((i) => i.status === "UNPAID").length,
    totalSpent: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0),
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.order.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceItems.some((item) =>
        item.package.name.toLowerCase().includes(search.toLowerCase()),
      );
    const matchStatus = filterStatus === "ALL" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p>Memuat riwayat invoice...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-[900px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="flex items-center gap-2.5 text-[1.6rem] font-bold text-foreground m-0 tracking-[-0.03em]">
              <Receipt className="w-[1.4rem] h-[1.4rem] text-primary" />
              Riwayat Invoice
            </h1>
            <p className="text-[0.875rem] text-muted-foreground mt-1 mb-0">
              Kelola dan lacak semua transaksi Anda
            </p>
          </div>
          <button
            onClick={() => router.push("/user/checkout")}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border-none rounded-lg px-[1.2rem] py-2.5 text-[0.875rem] font-semibold cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:opacity-90"
          >
            + Berlangganan
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-7 max-sm:grid-cols-2">
          <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl py-4 px-5 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-400 fill-mode-both hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)]">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[#3b82f6]/12 text-[#3b82f6]`}>
              <FileText className="w-[1.1rem] h-[1.1rem]" />
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold text-foreground m-0 tracking-[-0.03em] leading-none">{stats.total}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-1 mb-0">Total Invoice</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl py-4 px-5 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-400 fill-mode-both hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)]">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[#22c55e]/12 text-[#22c55e]`}>
              <CheckCircle2 className="w-[1.1rem] h-[1.1rem]" />
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold text-foreground m-0 tracking-[-0.03em] leading-none">{stats.paid}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-1 mb-0">Lunas</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl py-4 px-5 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-400 fill-mode-both hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)]">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-[#f59e0b]/12 text-[#f59e0b]`}>
              <Clock className="w-[1.1rem] h-[1.1rem]" />
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold text-foreground m-0 tracking-[-0.03em] leading-none">{stats.unpaid}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-1 mb-0">Belum Dibayar</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-card border border-border rounded-xl py-4 px-5 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-400 fill-mode-both hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)]">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-primary/12 text-primary`}>
              <TrendingUp className="w-[1.1rem] h-[1.1rem]" />
            </div>
            <div>
              <p className="text-[1.3rem] font-extrabold text-foreground m-0 tracking-[-0.03em] leading-none">{formatRp(stats.totalSpent)}</p>
              <p className="text-[0.72rem] text-muted-foreground mt-1 mb-0">Total Pengeluaran</p>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 transition-colors duration-150 focus-within:border-ring">
            <Search className="w-[0.9rem] h-[0.9rem] text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor invoice, kode order, atau paket..."
              className="flex-1 bg-transparent border-none outline-none py-2.5 text-[0.875rem] text-foreground placeholder:text-muted-foreground placeholder:opacity-60"
            />
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3.5">
            <Filter className="w-[0.85rem] h-[0.85rem] text-muted-foreground shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none outline-none py-2.5 text-[0.875rem] text-foreground cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">Menunggu Pembayaran</option>
              <option value="PAID">Lunas</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="REFUNDED">Refund</option>
            </select>
          </div>
        </div>

        {/* Invoice list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 bg-card border border-dashed border-border rounded-xl text-center">
            <Receipt className="w-12 h-12 text-muted-foreground opacity-30" />
            <h3 className="text-[1.1rem] font-semibold text-foreground m-0">
              {invoices.length === 0 ? "Belum ada invoice" : "Tidak ada hasil"}
            </h3>
            <p className="text-[0.875rem] text-muted-foreground m-0">
              {invoices.length === 0
                ? "Mulai berlangganan untuk melihat riwayat invoice Anda"
                : "Coba ubah filter atau kata kunci pencarian"}
            </p>
            {invoices.length === 0 && (
              <button
                onClick={() => router.push("/user/checkout")}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border-none rounded-lg px-[1.2rem] py-2.5 text-[0.875rem] font-semibold cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:opacity-90"
              >
                Berlangganan Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((inv, i) => {
              const statusCfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusCfg.icon;
              const packageName = inv.invoiceItems[0]?.package?.name || "—";

              // map status classes explicitly
              const dotClass = 
                statusCfg.cls === "paid" ? "bg-[#22c55e]" :
                statusCfg.cls === "unpaid" ? "bg-[#f59e0b] animate-pulse" :
                statusCfg.cls === "cancelled" ? "bg-muted-foreground" :
                "bg-[#8b5cf6]";

              const badgeClass =
                statusCfg.cls === "paid" ? "bg-[#22c55e]/12 text-[#22c55e]" :
                statusCfg.cls === "unpaid" ? "bg-[#f59e0b]/12 text-[#f59e0b]" :
                statusCfg.cls === "cancelled" ? "bg-muted-foreground/12 text-muted-foreground" :
                "bg-[#8b5cf6]/12 text-[#8b5cf6]";

              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl py-4 px-5 cursor-pointer transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-400 fill-mode-both no-underline hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)] group"
                  onClick={() =>
                    router.push(
                      `/user/invoice/${encodeURIComponent(inv.invoiceNumber)}`,
                    )
                  }
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}
                  />

                  {/* Invoice info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-[0.875rem] font-semibold text-foreground font-mono">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 py-[0.2rem] px-2.5 rounded-full text-[0.7rem] font-semibold whitespace-nowrap ${badgeClass}`}
                      >
                        <StatusIcon className="w-[0.7rem] h-[0.7rem]" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[0.8rem] text-foreground font-medium">{packageName}</span>
                      <span className="text-muted-foreground text-[0.75rem]">·</span>
                      <span className="text-[0.75rem] text-muted-foreground font-mono">{inv.order.orderCode}</span>
                      <span className="text-muted-foreground text-[0.75rem]">·</span>
                      <span className="text-[0.75rem] text-muted-foreground">
                        {formatDate(inv.issuedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`block text-[0.95rem] font-bold text-foreground ${inv.status === "PAID" ? "text-[#22c55e]" : ""}`}
                    >
                      {formatRp(inv.total)}
                    </span>
                    {inv.status === "UNPAID" && inv.dueDate && (
                      <span className="block text-[0.72rem] text-[#f59e0b] mt-1">
                        Jatuh tempo {formatDate(inv.dueDate)}
                      </span>
                    )}
                    {inv.status === "PAID" && inv.paidAt && (
                      <span className="block text-[0.72rem] text-muted-foreground mt-1">
                        Dibayar {formatDate(inv.paidAt)}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 transition-all duration-200 group-hover:translate-x-[3px] group-hover:text-primary" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
