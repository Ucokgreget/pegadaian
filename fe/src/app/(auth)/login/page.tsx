"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";
import s from "../Auth.module.css";
import Image from "next/image";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function MailIcon() {
  return (
    <svg
      className={s.inputIcon}
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
      className={s.inputIcon}
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
      className={s.eyeIcon}
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
      className={s.eyeIcon}
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

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Cek rememberToken di cookie saat mount → auto login
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const res = await fetch("/api/auto-login", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          const redirectPath = data.role === "ADMIN" ? "/admin" : "/user";
          window.location.href = redirectPath;
          return;
        }
      } catch {
        // tidak ada rememberToken atau expired, lanjut ke form login
      } finally {
        setIsAutoLogging(false);
      }
    };
    tryAutoLogin();
  }, []);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email harus diisi.";
    else if (!validateEmail(formData.email))
      newErrors.email = "Format email tidak valid.";
    if (!formData.password) newErrors.password = "Password harus diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        rememberMe,
      });

      if (response.status && response.token && response.user) {
        toast.success("Login berhasil!");

        await fetch("/api/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: response.token,
            refreshToken: response.refreshToken,
            rememberToken: response.rememberToken ?? null,
          }),
        });

        const redirectPath =
          response.user.role === "ADMIN" ? "/admin" : "/user";
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      } else {
        setErrors({
          general: response.message || "Email atau password salah.",
        });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: "Terjadi kesalahan sistem. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan loading saat auto login sedang dicek
  if (isAutoLogging) {
    return (
      <div
        className={s.page}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className={s.spinner} />
      </div>
    );
  }

  return (
    <>
      <ToastContainerComponent />
      <div className={s.page}>
        <div className={s.cardOuter}>
          <div className={s.cardGlow} />
          <div className={s.card}>
            <Link href="/" className={s.backBtn}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={s.backIcon}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className={s.brand}>
              <Image
                src="https://cdn.aceimg.com/92020e260.png"
                alt="Sijaka.id"
                width={1080}
                height={1080}
                className={s.logoImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const next = (e.target as HTMLImageElement)
                    .nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = "flex";
                }}
              />
            </div>

            <div className={s.headingBlock}>
              <h1 className={s.heading}>Selamat Datang</h1>
              <p className={s.subheading}>
                Masuk ke akun Sijaka.id Anda untuk melanjutkan.
              </p>
            </div>

            {errors.general && (
              <div className={s.alertError}>
                <span className={s.alertIcon}>⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={s.form}
              style={{ marginTop: "1.5rem" }}
              noValidate
            >
              <div className={s.fieldGroup} style={{ animationDelay: "0.25s" }}>
                <label htmlFor="email" className={s.label}>
                  Email
                </label>
                <div className={s.inputWrap}>
                  <MailIcon />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${s.input} ${errors.email ? s.inputError : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className={s.fieldError}>
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              <div className={s.fieldGroup} style={{ animationDelay: "0.32s" }}>
                <div className={s.fieldHeader}>
                  <label htmlFor="password" className={s.label}>
                    Password
                  </label>
                  <a href="#" className={s.forgotLink}>
                    Lupa password?
                  </a>
                </div>
                <div className={s.inputWrap}>
                  <LockIcon />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${s.input} ${errors.password ? s.inputError : ""}`}
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    className={s.eyeBtn}
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
                  <p className={s.fieldError}>
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div
                className={s.rememberRow}
                style={{ animationDelay: "0.36s" }}
              >
                <label className={s.rememberLabel}>
                  <div
                    className={`${s.customCheckbox} ${rememberMe ? s.checked : ""}`}
                    onClick={() => setRememberMe((v) => !v)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && setRememberMe((v) => !v)}
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
                  <span className={s.rememberText}>
                    Ingat saya selama 30 hari
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={s.submitBtn}
                style={{ animationDelay: "0.4s" }}
              >
                <span className={s.btnInner}>
                  {isLoading ? (
                    <>
                      <span className={s.spinner} />
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
            </form>

            <p className={s.footerText}>
              Belum punya akun?{" "}
              <Link href="/register" className={s.footerLink}>
                Daftar gratis sekarang →
              </Link>
            </p>
          </div>
        </div>

        <nav className={s.bottomNav}>
          <a href="#" className={s.bottomNavLink}>
            Kebijakan Privasi
          </a>
          <span className={s.bottomNavDot}>●</span>
          <a href="#" className={s.bottomNavLink}>
            Syarat &amp; Ketentuan
          </a>
          <span className={s.bottomNavDot}>●</span>
          <a href="#" className={s.bottomNavLink}>
            Bantuan
          </a>
        </nav>
      </div>
    </>
  );
}
