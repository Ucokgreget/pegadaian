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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-4 py-8 sm:py-12">
      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-emerald-500/30 via-emerald-500/5 to-slate-900 blur-xl" />
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.9)] sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
                <span className="text-sm font-bold text-slate-950">W</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
                  Whiizi
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                  WhatsApp Automation
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                Selamat Datang Kembali
              </h1>
              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Masuk ke akun Whiizi Anda untuk melanjutkan.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

           {/* General Error Message */}
           {errors.general && (
            <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-200"
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
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500/50 bg-red-500/5 text-slate-50 focus:border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-200"
                >
                  Password
                </label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300">
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
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500/50 bg-red-500/5 text-slate-50 focus:border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-emerald-500 py-2.5 font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed sm:py-3"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-5 text-center text-xs text-slate-400 sm:text-sm">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>

       {/* Footer Links - slightly simplified from register page */}
       <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:gap-6 sm:text-sm">
        <a href="#" className="hover:text-emerald-300">
          Kebijakan Privasi
        </a>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <a href="#" className="hover:text-emerald-300">
          Syarat & Ketentuan
        </a>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <a href="#" className="hover:text-emerald-300">
           Bantuan
        </a>
      </div>
    </div>
  );
}
