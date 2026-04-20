import React from "react";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import ClientLayout from "./ClientLayout";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <ClientLayout user={user}>{children}</ClientLayout>;
}
