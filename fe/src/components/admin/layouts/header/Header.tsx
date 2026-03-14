"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Settings, LogOut, HomeIcon, House } from "lucide-react";
import { User } from "@/types/Auth";
import s from "./Header.module.css";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserNavbarProps {
  user?: User | null;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

// ─── Mock notifications — ganti dengan data asli dari API ─────────────────────

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

// ─── Helper: get initials from name ──────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Notification Dropdown ────────────────────────────────────────────────────

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
        {/* Header */}
        <div className={s.notifHeader}>
          <span className={s.notifTitle}>
            Notifikasi
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "0.4rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <button className={s.notifMarkAll} onClick={onMarkAll}>
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* List */}
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

        {/* Footer */}
        <div className={s.notifFooter}>
          <button className={s.notifFooterBtn} onClick={onClose}>
            Lihat semua notifikasi →
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({
  user,
  onClose,
}: {
  user?: User | null;
  onClose: () => void;
}) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Logout berhasil!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } else {
        alert("Logout gagal! Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error saat logout:", error);
      alert("Terjadi kesalahan saat logout. Silakan coba lagi.");
    }
  };

  return (
    <>
      <div className={s.clickOutside} onClick={onClose} />
      <div className={s.dropdown}>
        {/* Profile info */}
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

        {/* Menu items */}
        <div className={s.menuSection}>
          <Link href="/user/profile" className={s.menuItem} onClick={onClose}>
            <Settings className={s.menuItemIcon} />
            Pengaturan Profil
          </Link>

          <Link
            href="/user/subscription/history"
            className={s.menuItem}
            onClick={onClose}
          >
            <svg
              className={s.menuItemIcon}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="1" y="3" width="14" height="10" rx="2" />
              <path d="M1 6h14" strokeLinecap="round" />
            </svg>
            Langganan Saya
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function UserNavbar({ user }: UserNavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    setNotifOpen(false);
  };

  return (
    <>
      <ToastContainerComponent />
      <header className={s.header}>
        {/* Left: greeting */}
        <div className={s.greeting}>
          <span className={s.greetingLabel}>Selamat datang kembali</span>
          <span className={s.greetingName}>{user?.name || "User"} 👋</span>
        </div>

        {/* Right: actions */}
        <div className={s.actions}>
          {/* ── Notification button ── */}
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

          {/* ── Profile button ── */}
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
    </>
  );
}
