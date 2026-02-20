"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { User } from "@/types/Auth";

interface UserNavbarProps {
  user?: User | null;
}

export function UserNavbar({ user }: UserNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/user" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <span className="text-sm font-bold text-primary-foreground">Z</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Zaptify
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-muted-foreground sm:block">
            Halo, {user?.name || "User"}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:border-border hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
