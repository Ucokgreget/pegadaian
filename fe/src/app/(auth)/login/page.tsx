import { autoLogin } from "@/actions/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/app/(auth)/login/LoginForm";

export default async function LoginPage() {
  const response = await autoLogin();

  if (response.status && response.user) {
    redirect(response.user.role === "ADMIN" ? "/admin" : "/user");
  }

  return <LoginForm />;
}
