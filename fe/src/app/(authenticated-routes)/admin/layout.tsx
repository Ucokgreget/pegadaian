import { redirect } from "next/navigation";
import { AdminNavbar } from "@/components/dashboard/AdminNavbar";
import { getCurrentUser } from "@/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNavbar user={user} />
      <main>{children}</main>
    </div>
  );
}
