"use client";

import { loginAction, autoLogin } from "@/actions/auth";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  KeyboardEvent,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-toastify";

interface FormDataState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const initialState = {
  status: false,
  message: "",
  accessToken: null,
  refreshToken: null,
  rememberToken: null,
  user: undefined,
};

function MailIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M2.5 6.5l7.5 5 7.5-5M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="4"
        y="9"
        width="12"
        height="9"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9V6a3 3 0 016 0v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 4C6 4 2.73 6.89 2 10c.73 3.11 4 6 8 6s7.27-2.89 8-6c-.73-3.11-4-6-8-6z"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M3 3l14 14M8.46 8.54A3 3 0 0013 13M4.5 5.5C3.1 6.6 2.2 8.2 2 10c.73 3.11 4 6 8 6a9.1 9.1 0 003.5-.7M7 4.5A9.2 9.2 0 0110 4c4 0 7.27 2.89 8 6-.3 1.3-1 2.5-2 3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative mt-2 w-full overflow-hidden rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)]" />
      <span className="relative flex items-center justify-center gap-2">
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Memproses...
          </>
        ) : (
          <>
            Masuk ke Dashboard
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </>
        )}
      </span>
    </button>
  );
}

interface LoginFormProps {
  hasRememberToken?: boolean;
}

export default function LoginForm({ hasRememberToken = false }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialState);
  const [, startTransition] = useTransition();

  const [isCheckingAutoLogin, setIsCheckingAutoLogin] = useState(hasRememberToken);

  const [formData, setFormData] = useState<FormDataState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (hasRememberToken) {
      const runAutoLogin = async () => {
        try {
          const res = await autoLogin();
          if (!res.status) {
            setIsCheckingAutoLogin(false);
          }
        } catch (e) {
          setIsCheckingAutoLogin(false);
        }
      };
      runAutoLogin();
    }
  }, [hasRememberToken]);

  const inputBase =
    "w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-emerald-500 focus:bg-background focus:ring-4 focus:ring-emerald-500/15";

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleRememberKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setRememberMe((v) => !v);
    }
  };

  const handleSubmitAction = async (submitData: FormData) => {
    const email = String(submitData.get("email") || "").trim();
    const password = String(submitData.get("password") || "");

    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email harus diisi.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!password) {
      newErrors.password = "Password harus diisi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = new FormData();
    submitData.forEach((value, key) => {
      payload.set(key, value);
    });
    payload.set("rememberMe", rememberMe ? "on" : "off");

    startTransition(() => {
      formAction(payload);
    });
  };

  useEffect(() => {
    if (!state.status) {
      if (state.message) {
        setErrors((prev) => ({ ...prev, general: state.message }));
      }
      return;
    }

    if (state.status && state.accessToken && state.user) {
      toast.success("Login berhasil!");
      const redirectPath = state.user.role === "ADMIN" ? "/admin" : "/user";
      router.push(redirectPath);
      router.refresh();
      return;
    }

    setErrors({ general: state.message || "Email atau password salah." });
  }, [router, state]);

  if (isCheckingAutoLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent border-l-transparent" />
          </div>
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-slate-100 sm:text-base">
              Menyiapkan dashboard Sijaka.id...
            </p>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Menghubungkan automasi WhatsApp dan memuat data toko Anda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainerComponent />
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 font-sans">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_60%_at_10%_0%,rgba(34,197,94,0.09),transparent_60%),radial-gradient(60%_50%_at_90%_100%,rgba(16,185,129,0.07),transparent_60%),radial-gradient(40%_40%_at_50%_50%,rgba(6,182,212,0.04),transparent_70%)]" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black_20%,transparent_80%)]" />

        <div className="relative z-10 w-full max-w-104">
          <div className="absolute -inset-1 -z-10 rounded-[28px] bg-linear-to-br from-emerald-500/25 via-emerald-500/10 to-transparent blur-xl" />

          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-card px-7 py-8 shadow-[0_0_0_1px_rgba(16,185,129,0.1),0_24px_64px_rgba(0,0,0,0.14),0_8px_24px_rgba(0,0,0,0.1)] sm:px-9 sm:py-10">
            <div className="absolute left-[10%] right-[10%] top-0 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />

            <Link
              href="/"
              className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-emerald-500 transition hover:bg-emerald-500/10"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className="flex items-center justify-center">
              <Image
                src="/logo-web.png"
                alt="Sijaka.id"
                width={1080}
                height={1080}
                className="h-auto w-full max-w-50 rounded-md object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const next = (e.target as HTMLImageElement)
                    .nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = "flex";
                }}
              />
            </div>

            <div className="mt-7 text-center">
              <h1 className="text-[clamp(1.45rem,3vw,1.75rem)] font-extrabold tracking-tight text-foreground">
                Selamat Datang
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Masuk ke akun Sijaka.id Anda untuk melanjutkan.
              </p>
            </div>

            {errors.general && (
              <div className="mt-4 mb-5 flex items-start gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                <span className="text-base leading-none">⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            <form
              action={handleSubmitAction}
              className="mt-6 flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-[13px] font-semibold tracking-wide text-foreground"
                >
                  Email
                </label>
                <div className="group relative">
                  <MailIcon />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500">
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-semibold tracking-wide text-foreground"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-emerald-500 transition hover:text-emerald-600"
                  >
                    Lupa password?
                  </a>
                </div>
                <div className="group relative">
                  <LockIcon />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputBase} pr-11 ${errors.password ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-emerald-500"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500">
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <div
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition ${rememberMe ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-transparent"}`}
                    onClick={() => setRememberMe((v) => !v)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onKeyDown={handleRememberKeyDown}
                  >
                    {rememberMe && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Ingat saya selama 30 hari
                  </span>
                </label>
              </div>

              <SubmitButton />
            </form>

            {/* ── Divider ── */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium text-muted-foreground">
                atau
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* ── Google OAuth Button ── */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Google "G" SVG logo */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Lanjutkan dengan Google
            </a>

            <p className="mt-4 text-center text-[13px] text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-emerald-500 transition hover:text-emerald-600"
              >
                Daftar gratis sekarang →
              </Link>
            </p>
          </div>
        </div>

        <nav className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <a href="#" className="transition hover:text-emerald-500">
            Kebijakan Privasi
          </a>
          <span className="text-[8px] text-muted-foreground/50">●</span>
          <a href="#" className="transition hover:text-emerald-500">
            Syarat &amp; Ketentuan
          </a>
          <span className="text-[8px] text-muted-foreground/50">●</span>
          <a href="#" className="transition hover:text-emerald-500">
            Bantuan
          </a>
        </nav>
      </div>
    </>
  );
}
