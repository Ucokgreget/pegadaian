"use client";

import React from "react";
import { UserNavbar } from "@/components/customer/layouts/header/Header";
import Sidebar from "@/components/customer/layouts/sidebar/Sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/customer/layouts/sidebar/SidebarContext";
import { useAuth } from "@/hooks/useAuth";

function LayoutInner({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div
        className="flex flex-col min-h-screen flex-1 overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: "var(--sidebar-content-ml, 0px)",
        }}
      >
        <UserNavbar user={user} />
        <main className="p-4 md:p-6 lg:p-8 flex-1">{children}</main>
      </div>
      <style>{`
        @media (min-width: 768px) {
          :root {
            --sidebar-content-ml: ${collapsed ? "68px" : "256px"};
          }
        }
        @media (max-width: 767px) {
          :root {
            --sidebar-content-ml: 0px;
          }
        }
      `}</style>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) return null;
  return (
    <SidebarProvider>
      <LayoutInner user={user}>{children}</LayoutInner>
    </SidebarProvider>
  );
}
