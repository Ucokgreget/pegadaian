"use client";

import { register } from "@/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreed?: string;
  general?: string;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong" | null;

function UserIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="7" r="3" strokeLinecap="round" />
      <path
        d="M3.5 17c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function ShieldIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 2l6 2.5v5c0 3.5-2.5 6.5-6 7.5C4.5 16 2 13 2 9.5v-5L10 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
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
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M3 3l14 14M8.46 8.54A3 3 0 0013 13M4.5 5.5C3.1 6.6 2.2 8.2 2 10c.73 3.11 4 6 8 6a9.1 9.1 0 003.5-.7M7 4.5A9.2 9.2 0 0110 4c4 0 7.27 2.89 8 6-.3 1.3-1 2.5-2 3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getStrength(pw: string): {
  level: StrengthLevel;
  score: number;
  label: string;
} {
  if (!pw) return { level: null, score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: "weak", score, label: "Lemah" };
  if (score === 2) return { level: "fair", score, label: "Cukup" };
  if (score === 3) return { level: "good", score, label: "Bagus" };
  return { level: "strong", score, label: "Kuat" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(formData.password);
  const passwordMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const inputBase =
    "w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-emerald-500 focus:bg-background focus:ring-4 focus:ring-emerald-500/15";

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap harus diisi.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format email tidak valid. Contoh: nama@email.com";
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok. Periksa kembali.";
    }

    if (!formData.agreed) {
      newErrors.agreed =
        "Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage("");
    setErrors({});

    try {
      const res = await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });

      if (res.status) {
        setSuccessMessage("Registrasi berhasil! Mengarahkan ke halaman login...");

        if (res.accessToken) {
          localStorage.setItem("token", res.accessToken);
          router.push("/user");
        } else {
          router.push("/login");
        }

        router.refresh();
        return;
      }

      setErrors({
        general: res.message || "Terjadi kesalahan saat registrasi.",
      });
    } catch {
      setErrors({ general: "Gagal terhubung ke server. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColor = {
    weak: "bg-red-500",
    fair: "bg-amber-500",
    good: "bg-emerald-500",
    strong: "bg-teal-500",
  };

  const strengthLabelColor = {
    weak: "text-red-500",
    fair: "text-amber-500",
    good: "text-emerald-500",
    strong: "text-teal-500",
  };

  return (
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
              src="https://cdn.aceimg.com/92020e260.png"
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
              Bergabung Sekarang
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Buat akun dan mulai otomatisasi bisnis WhatsApp-mu.
            </p>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2">
            {["Trial 7 Hari", "New Users", "Setup 3 Menit"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600"
              >
                {badge}
              </span>
            ))}
          </div>

          {successMessage && (
            <div className="mt-4 mb-5 flex items-start gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-600">
              <span className="text-base leading-none">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mt-4 mb-5 flex items-start gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-xs text-red-500">
              <span className="text-base leading-none">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[13px] font-semibold tracking-wide text-foreground">
                Nama Lengkap
              </label>
              <div className="group relative">
                <UserIcon />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.fullName ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
              </div>
              {errors.fullName ? (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                  <span>⚠</span> {errors.fullName}
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Gunakan nama sesuai rekening bank untuk kemudahan penarikan dana.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold tracking-wide text-foreground">
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
              {errors.email ? (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                  <span>⚠</span> {errors.email}
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Email aktif untuk verifikasi dan notifikasi.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold tracking-wide text-foreground">
                Password
              </label>
              <div className="group relative">
                <LockIcon />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputBase} pr-11 ${errors.password ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-emerald-500"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>

              {formData.password && (
                <>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-0.75 flex-1 rounded-full ${strength.score >= i && strength.level ? strengthColor[strength.level] : "bg-border"}`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${strength.level ? strengthLabelColor[strength.level] : "text-muted-foreground"}`}
                  >
                    {strength.label}
                  </span>
                </>
              )}

              {errors.password ? (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                  <span>⚠</span> {errors.password}
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Minimal 8 karakter, disarankan kombinasi huruf dan angka.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[13px] font-semibold tracking-wide text-foreground">
                Konfirmasi Password
              </label>
              <div className="group relative">
                <ShieldIcon />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputBase} pr-11 ${errors.confirmPassword ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : passwordMatch ? "border-emerald-500/60" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-emerald-500"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>

              {errors.confirmPassword ? (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                  <span>⚠</span> {errors.confirmPassword}
                </p>
              ) : passwordMatch ? (
                <p className="text-[11px] font-semibold text-emerald-600">Password cocok</p>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Ketik ulang password untuk memastikan kecocokan.
                </p>
              )}
            </div>

            <div className="pt-0.5">
              <label className="flex cursor-pointer items-start gap-2.5">
                <span className="relative mt-px inline-flex h-4.5 w-4.5 shrink-0">
                  <input
                    type="checkbox"
                    name="agreed"
                    id="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border border-border bg-background/60 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-500/20">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className={`transition ${formData.agreed ? "opacity-100" : "opacity-0"}`}
                    >
                      <path
                        d="M1.5 5l2.5 2.5 5-5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>

                <span className="text-[13px] leading-relaxed text-muted-foreground">
                  Saya setuju dengan{" "}
                  <a href="#syarat" className="font-semibold text-emerald-500 hover:text-emerald-600">
                    Syarat dan Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a href="#privasi" className="font-semibold text-emerald-500 hover:text-emerald-600">
                    Kebijakan Privasi
                  </a>{" "}
                  Sijaka.id.
                </span>
              </label>

              {errors.agreed && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                  <span>⚠</span> {errors.agreed}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-2 w-full overflow-hidden rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)]" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Daftar Sekarang - Gratis
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
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-emerald-500 transition hover:text-emerald-600">
              Login di sini →
            </Link>
          </p>
        </div>
      </div>

      <nav className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <a href="#privasi" className="transition hover:text-emerald-500">
          Kebijakan Privasi
        </a>
        <span className="text-[8px] text-muted-foreground/50">●</span>
        <a href="#syarat" className="transition hover:text-emerald-500">
          Syarat dan Ketentuan
        </a>
        <span className="text-[8px] text-muted-foreground/50">●</span>
        <a href="#support" className="transition hover:text-emerald-500">
          Support
        </a>
      </nav>
    </div>
  );
}
