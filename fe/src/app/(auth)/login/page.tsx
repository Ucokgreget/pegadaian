import { cookies } from "next/headers";
import LoginForm from "@/app/(auth)/login/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const hasRememberToken = cookieStore.has("rememberToken");

  return <LoginForm hasRememberToken={hasRememberToken} />;
}
