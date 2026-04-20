"use client";

import React from "react";
import { UserNavbar } from "@/components/admin/layouts/header/Header";
import Sidebar from "@/components/admin/layouts/sidebar/Sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/admin/layouts/sidebar/SidebarContext";
import { User } from "@/types/Auth";

function LayoutInner({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
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

export default function ClientLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <SidebarProvider>
      <LayoutInner user={user}>{children}</LayoutInner>
    </SidebarProvider>
  );
}
