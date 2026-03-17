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
import s from "./InvoiceList.module.css";

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
      <div className={s.loadingWrap}>
        <Loader2 className={s.spinner} />
        <p>Memuat riwayat invoice...</p>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* Header */}
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.pageTitle}>
              <Receipt className={s.pageTitleIcon} />
              Riwayat Invoice
            </h1>
            <p className={s.pageSubtitle}>
              Kelola dan lacak semua transaksi Anda
            </p>
          </div>
          <button
            onClick={() => router.push("/user/checkout")}
            className={s.newOrderBtn}
          >
            + Berlangganan
          </button>
        </div>

        {/* Stats cards */}
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={`${s.statIconWrap} ${s.statIconBlue}`}>
              <FileText className={s.statIcon} />
            </div>
            <div>
              <p className={s.statValue}>{stats.total}</p>
              <p className={s.statLabel}>Total Invoice</p>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={`${s.statIconWrap} ${s.statIconGreen}`}>
              <CheckCircle2 className={s.statIcon} />
            </div>
            <div>
              <p className={s.statValue}>{stats.paid}</p>
              <p className={s.statLabel}>Lunas</p>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={`${s.statIconWrap} ${s.statIconYellow}`}>
              <Clock className={s.statIcon} />
            </div>
            <div>
              <p className={s.statValue}>{stats.unpaid}</p>
              <p className={s.statLabel}>Belum Dibayar</p>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={`${s.statIconWrap} ${s.statIconPrimary}`}>
              <TrendingUp className={s.statIcon} />
            </div>
            <div>
              <p className={s.statValue}>{formatRp(stats.totalSpent)}</p>
              <p className={s.statLabel}>Total Pengeluaran</p>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className={s.toolbar}>
          <div className={s.searchWrap}>
            <Search className={s.searchIcon} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor invoice, kode order, atau paket..."
              className={s.searchInput}
            />
          </div>
          <div className={s.filterWrap}>
            <Filter className={s.filterIcon} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={s.filterSelect}
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
          <div className={s.empty}>
            <Receipt className={s.emptyIcon} />
            <h3 className={s.emptyTitle}>
              {invoices.length === 0 ? "Belum ada invoice" : "Tidak ada hasil"}
            </h3>
            <p className={s.emptyDesc}>
              {invoices.length === 0
                ? "Mulai berlangganan untuk melihat riwayat invoice Anda"
                : "Coba ubah filter atau kata kunci pencarian"}
            </p>
            {invoices.length === 0 && (
              <button
                onClick={() => router.push("/user/checkout")}
                className={s.newOrderBtn}
              >
                Berlangganan Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className={s.invoiceList}>
            {filtered.map((inv, i) => {
              const statusCfg = STATUS_CONFIG[inv.status];
              const StatusIcon = statusCfg.icon;
              const packageName = inv.invoiceItems[0]?.package?.name || "—";

              return (
                <div
                  key={inv.id}
                  className={s.invoiceRow}
                  onClick={() =>
                    router.push(
                      `/user/invoice/${encodeURIComponent(inv.invoiceNumber)}`,
                    )
                  }
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Status indicator */}
                  <div
                    className={`${s.statusDot} ${s[`dot_${statusCfg.cls}`]}`}
                  />

                  {/* Invoice info */}
                  <div className={s.invoiceInfo}>
                    <div className={s.invoiceTop}>
                      <span className={s.invoiceNumber}>
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`${s.statusBadge} ${s[`badge_${statusCfg.cls}`]}`}
                      >
                        <StatusIcon className={s.badgeIcon} />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className={s.invoiceMeta}>
                      <span className={s.packageName}>{packageName}</span>
                      <span className={s.metaDot}>·</span>
                      <span className={s.orderCode}>{inv.order.orderCode}</span>
                      <span className={s.metaDot}>·</span>
                      <span className={s.invoiceDate}>
                        {formatDate(inv.issuedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={s.invoiceAmount}>
                    <span
                      className={`${s.amountValue} ${inv.status === "PAID" ? s.amountPaid : ""}`}
                    >
                      {formatRp(inv.total)}
                    </span>
                    {inv.status === "UNPAID" && inv.dueDate && (
                      <span className={s.dueDate}>
                        Jatuh tempo {formatDate(inv.dueDate)}
                      </span>
                    )}
                    {inv.status === "PAID" && inv.paidAt && (
                      <span className={s.paidDate}>
                        Dibayar {formatDate(inv.paidAt)}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className={s.arrowIcon} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
