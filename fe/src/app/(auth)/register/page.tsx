"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/actions/auth";

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
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

    if (!validateForm()) {
      return;
    }

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
        setSuccessMessage(
          "Registrasi berhasil! Mengarahkan ke dashboard dalam 3 detik..."
        );
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreed: false,
        });

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/user");
        }, 3000);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: res.message || "Terjadi kesalahan saat registrasi",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "Gagal terhubung ke server",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 sm:py-12">
      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-xl" />
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                <span className="text-sm font-bold text-primary-foreground">W</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  Zaptify
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  WhatsApp Automation
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Bergabung dengan Zaptify
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Buat akun dan mulai otomatisasi bisnis WhatsApp-mu sekarang.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
              {successMessage}
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-foreground"
              >
                Nama Lengkap
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${errors.fullName
                  ? "border-destructive/50 bg-destructive/5 text-foreground focus:border-destructive focus:ring-destructive/30"
                  : "border-input bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/30"
                  }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-destructive">{errors.fullName}</p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Gunakan nama sesuai rekening bank untuk kemudahan penarikan
                dana.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${errors.email
                  ? "border-destructive/50 bg-destructive/5 text-foreground focus:border-destructive focus:ring-destructive/30"
                  : "border-input bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/30"
                  }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Email aktif untuk verifikasi dan notifikasi.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleChange}
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${errors.password
                  ? "border-destructive/50 bg-destructive/5 text-foreground focus:border-destructive focus:ring-destructive/30"
                  : "border-input bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/30"
                  }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Minimal 8 karakter, disarankan kombinasi huruf & angka.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${errors.confirmPassword
                  ? "border-destructive/50 bg-destructive/5 text-foreground focus:border-destructive focus:ring-destructive/30"
                  : "border-input bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/30"
                  }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Ketik ulang password untuk memastikan kecocokan.
              </p>
            </div>

            {/* Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-input bg-background/50 accent-primary ring-1 ring-input transition focus:ring-2 focus:ring-primary/30"
                />
                <span className="flex-1 text-xs text-muted-foreground sm:text-sm">
                  Saya setuju dengan{" "}
                  <a
                    href="#syarat"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Syarat & Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a
                    href="#privasi"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Kebijakan Privasi
                  </a>{" "}
                  Zaptify.
                </span>
              </label>
              {errors.agreed && (
                <p className="mt-2 text-xs text-destructive">{errors.agreed}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed sm:py-3"
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-5 text-center text-xs text-muted-foreground sm:text-sm">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Badges & Links */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          🎁 Trial 7 Hari
        </span>
        <span className="inline-flex rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          New Users
        </span>
        <span className="inline-flex rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          Setup Mudah 3 Menit
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
        <a href="#privasi" className="hover:text-primary">
          Kebijakan Privasi
        </a>
        <span className="hidden text-muted-foreground/50 sm:inline">•</span>
        <a href="#syarat" className="hover:text-primary">
          Syarat & Ketentuan
        </a>
        <span className="hidden text-muted-foreground/50 sm:inline">•</span>
        <a href="#support" className="hover:text-primary">
          Support
        </a>
      </div>
    </div>
  );
}
