"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field on change
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi.";
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
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.status && response.user) {
        setSuccessMessage("Login berhasil! Mengarahkan ke dashboard...");

        // Determine redirect path based on role
        const redirectPath = response.user.role === "ADMIN" ? "/admin" : "/user";

        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setErrors({
          general: response.message || "Email atau password salah.",
        });
      }
    } catch (error) {
      console.error(error)
      setErrors({
        general: "Terjadi kesalahan sistem. Silakan coba lagi.",
      });
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
                Selamat Datang Kembali
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Masuk ke akun Zaptify Anda untuk melanjutkan.
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
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:text-primary/80">
                  Lupa password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password Anda"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed sm:py-3"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-5 text-center text-xs text-muted-foreground sm:text-sm">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Links - slightly simplified from register page */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
        <a href="#" className="hover:text-primary">
          Kebijakan Privasi
        </a>
        <span className="hidden text-muted-foreground/50 sm:inline">•</span>
        <a href="#" className="hover:text-primary">
          Syarat & Ketentuan
        </a>
        <span className="hidden text-muted-foreground/50 sm:inline">•</span>
        <a href="#" className="hover:text-primary">
          Bantuan
        </a>
      </div>
    </div>
  );
}
