"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";

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

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
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
      // Simulate redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }, 1500);
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
                  Zaptify
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                  WhatsApp Automation
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                Bergabung dengan Zaptify
              </h1>
              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Buat akun dan mulai otomatisasi bisnis WhatsApp-mu sekarang.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-200"
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
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-500/50 bg-red-500/5 text-slate-50 focus:border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Gunakan nama sesuai rekening bank untuk kemudahan penarikan
                dana.
              </p>
            </div>

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
              <p className="mt-1.5 text-xs text-slate-500">
                Email aktif untuk verifikasi dan notifikasi.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200"
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
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500/50 bg-red-500/5 text-slate-50 focus:border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Minimal 8 karakter, disarankan kombinasi huruf & angka.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-200"
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
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-500/50 bg-red-500/5 text-slate-50 focus:border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 bg-slate-900/50 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
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
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900/50 accent-emerald-500 ring-1 ring-slate-700 transition focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="flex-1 text-xs text-slate-300 sm:text-sm">
                  Saya setuju dengan{" "}
                  <a
                    href="#syarat"
                    className="font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Syarat & Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a
                    href="#privasi"
                    className="font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Kebijakan Privasi
                  </a>{" "}
                  Zaptify.
                </span>
              </label>
              {errors.agreed && (
                <p className="mt-2 text-xs text-red-400">{errors.agreed}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-emerald-500 py-2.5 font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed sm:py-3"
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-5 text-center text-xs text-slate-400 sm:text-sm">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Badges & Links */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-300">
          🎁 Trial 7 Hari
        </span>
        <span className="inline-flex rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-300">
          New Users
        </span>
        <span className="inline-flex rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs font-medium text-slate-300">
          Setup Mudah 3 Menit
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:gap-6 sm:text-sm">
        <a href="#privasi" className="hover:text-emerald-300">
          Kebijakan Privasi
        </a>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <a href="#syarat" className="hover:text-emerald-300">
          Syarat & Ketentuan
        </a>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <a href="#support" className="hover:text-emerald-300">
          Support
        </a>
      </div>
    </div>
  );
}
