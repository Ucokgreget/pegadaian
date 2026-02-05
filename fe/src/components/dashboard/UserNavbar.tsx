"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { User } from "@/types/Auth";

interface UserNavbarProps {
  user?: User | null;
}

export function UserNavbar({ user }: UserNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/user" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
              <span className="text-sm font-bold text-slate-950">Z</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
                Zaptify
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-slate-400 sm:block">
            Halo, {user?.name || "User"}
          </div>
          <Link
            href="/logout"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
