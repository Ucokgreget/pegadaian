"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Settings, LogOut, House, ChevronRight } from "lucide-react";
import { User } from "@/types/Auth";
import s from "./Header.module.css";

interface UserNavbarProps {
  user?: User | null;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    text: "Pesanan baru masuk dari pelanggan Budi.",
    time: "2 menit lalu",
    read: false,
  },
  {
    id: "2",
    text: "Pembayaran berhasil dikonfirmasi otomatis.",
    time: "15 menit lalu",
    read: false,
  },
  {
    id: "3",
    text: "Bot WhatsApp kamu berhasil mengirim 48 pesan.",
    time: "1 jam lalu",
    read: true,
  },
  {
    id: "4",
    text: "Langganan kamu akan berakhir dalam 3 hari.",
    time: "Kemarin",
    read: true,
  },
];

// Map segment → label yang tampil di breadcrumb
const SEGMENT_LABELS: Record<string, string> = {
  user: "Dashboard",
  admin: "Admin",
  invoice: "Invoice",
  checkout: "Checkout",
  profile: "Profil",
  subscription: "Langganan",
  history: "Riwayat",
  packages: "Paket",
  promo: "Promo",
  features: "Fitur",
  settings: "Pengaturan",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];

  segments.forEach((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // Kalau segment adalah angka (dynamic id) — skip atau tampil sebagai "Detail"
    const isId = /^\d+$/.test(seg);
    const label = isId
      ? "Detail"
      : SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href, isLast: i === segments.length - 1 });
  });

  return crumbs;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function NotifDropdown({
  notifications,
  onMarkAll,
  onClose,
}: {
  notifications: Notification[];
  onMarkAll: () => void;
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <>
      <div className={s.clickOutside} onClick={onClose} />
      <div className={`${s.dropdown} ${s.dropdownNotif}`}>
        <div className={s.notifHeader}>
          <span className={s.notifTitle}>
            Notifikasi
            {unreadCount > 0 && (
              <span className={s.notifCount}>{unreadCount}</span>
            )}
          </span>
          {unreadCount > 0 && (
            <button className={s.notifMarkAll} onClick={onMarkAll}>
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className={s.notifList}>
          {notifications.length === 0 ? (
            <div className={s.notifEmpty}>
              <div className={s.notifEmptyIcon}>🔔</div>
              <div>Tidak ada notifikasi</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`${s.notifItem} ${!n.read ? s.unread : ""}`}
              >
                <div
                  className={`${s.notifDot} ${n.read ? s.notifDotRead : ""}`}
                />
                <div className={s.notifContent}>
                  <div className={s.notifText}>{n.text}</div>
                  <div className={s.notifTime}>{n.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={s.notifFooter}>
          <button className={s.notifFooterBtn} onClick={onClose}>
            Lihat semua notifikasi →
          </button>
        </div>
      </div>
    </>
  );
}

function ProfileDropdown({
  user,
  onClose,
}: {
  user?: User | null;
  onClose: () => void;
}) {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) window.location.href = "/login";
      else alert("Logout gagal! Silakan coba lagi.");
    } catch (err) {
      console.error("Error saat logout:", err);
    }
  };

  return (
    <>
      <div className={s.clickOutside} onClick={onClose} />
      <div className={s.dropdown}>
        <div className={s.profileHeader}>
          <div className={s.profileAvatar}>{getInitials(user?.name)}</div>
          <div className={s.profileInfo}>
            <div className={s.profileName}>{user?.name || "User"}</div>
            <div className={s.profileEmail}>{user?.email || "-"}</div>
            <div className={s.profileBadge}>
              {user?.role === "ADMIN" ? "Admin" : "Member"}
            </div>
          </div>
        </div>
        <div className={s.menuSection}>
          <Link href="/user/profile" className={s.menuItem} onClick={onClose}>
            <Settings className={s.menuItemIcon} />
            Pengaturan Profil
          </Link>
          <Link href="/" className={s.menuItem} onClick={onClose}>
            <House className={s.menuItemIcon} />
            Beranda
          </Link>
          <div className={s.menuDivider} />
          <button
            onClick={handleLogout}
            className={`${s.menuItem} ${s.menuItemDanger}`}
          >
            <LogOut className={s.menuItemIcon} />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

export function UserNavbar({ user }: UserNavbarProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const crumbs = buildBreadcrumbs(pathname);

  const handleMarkAll = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  };
  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    setNotifOpen(false);
  };

  return (
    <header className={s.header}>
      {/* Left: breadcrumb */}
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className={s.breadcrumbItem}>
            {i > 0 && <ChevronRight className={s.breadcrumbSep} />}
            {crumb.isLast ? (
              <span className={s.breadcrumbCurrent}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className={s.breadcrumbLink}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right: actions */}
      <div className={s.actions}>
        <div className={s.dropdownWrap}>
          <button
            className={s.iconBtn}
            onClick={toggleNotif}
            aria-label="Notifikasi"
          >
            <Bell />
            {unreadCount > 0 && <span className={s.badge} />}
          </button>
          {notifOpen && (
            <NotifDropdown
              notifications={notifications}
              onMarkAll={handleMarkAll}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        <div className={s.dropdownWrap}>
          <button
            className={`${s.avatarBtn} ${profileOpen ? s.open : ""}`}
            onClick={toggleProfile}
            aria-label="Menu profil"
          >
            <div className={s.avatarFallback}>{getInitials(user?.name)}</div>
          </button>
          {profileOpen && (
            <ProfileDropdown
              user={user}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
