"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import s from "../Auth.module.css";
import Image from "next/image";

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
      className={s.inputIcon}
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

function ShieldIcon() {
  return (
    <svg
      className={s.inputIcon}
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

// ─── Password strength ────────────────────────────────────────────────────────

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
  return { level: "strong", score, label: "Kuat 🔒" };
}

const hint: React.CSSProperties = {
  marginTop: "0.3rem",
  fontSize: "0.7rem",
  color: "var(--muted-foreground) / 0.65",
  lineHeight: 1.5,
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(formData.password);
  const passwordMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

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

    if (!formData.fullName.trim())
      newErrors.fullName = "Nama lengkap harus diisi.";

    if (!formData.email.trim()) newErrors.email = "Email harus diisi.";
    else if (!validateEmail(formData.email))
      newErrors.email = "Format email tidak valid. Contoh: nama@email.com";

    if (!formData.password) newErrors.password = "Password harus diisi.";
    else if (formData.password.length < 8)
      newErrors.password = "Password minimal 8 karakter.";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Konfirmasi password harus diisi.";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password tidak cocok. Periksa kembali.";

    if (!formData.agreed)
      newErrors.agreed =
        "Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.";

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

      if (res.status && res.token) {
        setSuccessMessage("Registrasi berhasil! Mengarahkan ke dashboard...");
        localStorage.setItem("token", res.token);
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreed: false,
        });
        window.location.href = "/user";
      } else {
        setErrors({
          general: res.message || "Terjadi kesalahan saat registrasi.",
        });
      }
    } catch {
      setErrors({ general: "Gagal terhubung ke server. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.cardOuter}>
        <div className={s.cardGlow} />
        <div className={s.card}>
          {/* Tombol Panah Kiri untuk Kembali */}
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
          {/* Brand */}
          <div className={s.brand}>
            <Image
              src="https://cdn.aceimg.com/92020e260.png"
              alt="Sijaka.id"
              width={1080}
              height={1080}
              className={s.logoImg}
              onError={(e) => {
                // Hide broken image, show fallback via CSS sibling
                (e.target as HTMLImageElement).style.display = "none";
                const next = (e.target as HTMLImageElement)
                  .nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "flex";
              }}
            />
          </div>

          {/* Heading */}
          <div className={s.headingBlock}>
            <h1 className={s.heading}>Bergabung Sekarang</h1>
            <p className={s.subheading}>
              Buat akun dan mulai otomatisasi bisnis WhatsApp-mu.
            </p>
          </div>

          {/* Trial badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginTop: "0.875rem",
            }}
          >
            {["🎁 Trial 7 Hari", "✨ New Users", "⚡ Setup 3 Menit"].map(
              (b) => (
                <span
                  key={b}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "999px",
                    border: "1px solid rgba(34,197,94,0.2)",
                    background: "rgba(34,197,94,0.06)",
                    padding: "0.2rem 0.65rem",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#16a34a",
                  }}
                >
                  {b}
                </span>
              ),
            )}
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className={s.alertSuccess} style={{ marginTop: "1rem" }}>
              <span className={s.alertIcon}>✅</span>
              <span>{successMessage}</span>
            </div>
          )}
          {errors.general && (
            <div className={s.alertError} style={{ marginTop: "1rem" }}>
              <span className={s.alertIcon}>⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={s.form}
            style={{ marginTop: "1.25rem" }}
            noValidate
          >
            {/* Full Name */}
            <div className={s.fieldGroup} style={{ animationDelay: "0.2s" }}>
              <label htmlFor="fullName" className={s.label}>
                Nama Lengkap
              </label>
              <div className={s.inputWrap}>
                <UserIcon />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${s.input} ${errors.fullName ? s.inputError : ""}`}
                />
              </div>
              {errors.fullName ? (
                <p className={s.fieldError}>
                  <span>⚠</span> {errors.fullName}
                </p>
              ) : (
                <p style={hint}>
                  Gunakan nama sesuai rekening bank untuk kemudahan penarikan
                  dana.
                </p>
              )}
            </div>

            {/* Email */}
            <div className={s.fieldGroup} style={{ animationDelay: "0.27s" }}>
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
              {errors.email ? (
                <p className={s.fieldError}>
                  <span>⚠</span> {errors.email}
                </p>
              ) : (
                <p style={hint}>Email aktif untuk verifikasi dan notifikasi.</p>
              )}
            </div>

            {/* Password */}
            <div className={s.fieldGroup} style={{ animationDelay: "0.34s" }}>
              <label htmlFor="password" className={s.label}>
                Password
              </label>
              <div className={s.inputWrap}>
                <LockIcon />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${s.input} ${errors.password ? s.inputError : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  className={s.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>

              {/* Strength bar */}
              {formData.password && (
                <>
                  <div className={s.strengthBar}>
                    {([1, 2, 3, 4] as const).map((i) => (
                      <div
                        key={i}
                        className={s.strengthSegment}
                        data-active={
                          strength.score >= i
                            ? (strength.level ?? undefined)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                  <span
                    className={s.strengthLabel}
                    data-level={strength.level ?? undefined}
                  >
                    {strength.label}
                  </span>
                </>
              )}

              {errors.password ? (
                <p className={s.fieldError}>
                  <span>⚠</span> {errors.password}
                </p>
              ) : (
                <p style={hint}>
                  Minimal 8 karakter, disarankan kombinasi huruf &amp; angka.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className={s.fieldGroup} style={{ animationDelay: "0.41s" }}>
              <label htmlFor="confirmPassword" className={s.label}>
                Konfirmasi Password
              </label>
              <div className={s.inputWrap}>
                <ShieldIcon />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${s.input} ${errors.confirmPassword ? s.inputError : ""}`}
                  style={{
                    paddingRight: "2.75rem",
                    borderColor: passwordMatch
                      ? "rgba(34,197,94,0.6)"
                      : undefined,
                  }}
                />
                <button
                  type="button"
                  className={s.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className={s.fieldError}>
                  <span>⚠</span> {errors.confirmPassword}
                </p>
              ) : passwordMatch ? (
                <p style={{ ...hint, color: "#16a34a", fontWeight: 600 }}>
                  ✓ Password cocok
                </p>
              ) : (
                <p style={hint}>
                  Ketik ulang password untuk memastikan kecocokan.
                </p>
              )}
            </div>

            {/* Agree Checkbox */}
            <div style={{ animationDelay: "0.47s" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.65rem",
                  cursor: "pointer",
                }}
              >
                {/* Custom checkbox */}
                <div
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <input
                    type="checkbox"
                    name="agreed"
                    id="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      zIndex: 1,
                      margin: 0,
                    }}
                  />
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "5px",
                      border: `1.5px solid ${formData.agreed ? "#22c55e" : "var(--input)"}`,
                      background: formData.agreed
                        ? "#22c55e"
                        : "var(--background) / 0.5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      boxShadow: formData.agreed
                        ? "0 0 0 3px rgba(34,197,94,0.15)"
                        : "none",
                    }}
                  >
                    {formData.agreed && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5l2.5 2.5 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.55,
                  }}
                >
                  Saya setuju dengan{" "}
                  <a
                    href="#syarat"
                    style={{
                      fontWeight: 600,
                      color: "#22c55e",
                      textDecoration: "none",
                    }}
                  >
                    Syarat &amp; Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a
                    href="#privasi"
                    style={{
                      fontWeight: 600,
                      color: "#22c55e",
                      textDecoration: "none",
                    }}
                  >
                    Kebijakan Privasi
                  </a>{" "}
                  Sijaka.id.
                </span>
              </label>
              {errors.agreed && (
                <p className={s.fieldError} style={{ marginTop: "0.4rem" }}>
                  <span>⚠</span> {errors.agreed}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className={s.submitBtn}>
              <span className={s.btnInner}>
                {isLoading ? (
                  <>
                    <span className={s.spinner} />
                    Memproses...
                  </>
                ) : (
                  <>
                    Daftar Sekarang — Gratis
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

          {/* Footer link */}
          <p className={s.footerText}>
            Sudah punya akun?{" "}
            <Link href="/login" className={s.footerLink}>
              Login di sini →
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className={s.bottomNav}>
        <a href="#privasi" className={s.bottomNavLink}>
          Kebijakan Privasi
        </a>
        <span className={s.bottomNavDot}>●</span>
        <a href="#syarat" className={s.bottomNavLink}>
          Syarat &amp; Ketentuan
        </a>
        <span className={s.bottomNavDot}>●</span>
        <a href="#support" className={s.bottomNavLink}>
          Support
        </a>
      </nav>
    </div>
  );
}
