import { logout } from "@/actions/auth";
import { redirect } from "next/navigation";

export async function GET() {
  await logout();
  redirect("/login");
}
