import { UserNavbar } from "@/components/dashboard/UserNavbar";
import { getCurrentUser } from "@/actions/auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950">
      <UserNavbar user={user} />
      <main>{children}</main>
    </div>
  );
}
