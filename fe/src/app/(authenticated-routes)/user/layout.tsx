import { redirect } from "next/navigation";
import React from "react";
import { UserNavbar } from "@/components/dashboard/UserNavbar";
import { getCurrentUser } from "@/actions/auth";
import Sidebar from "@/components/Sidebar";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <UserNavbar user={user} />
        <main className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
