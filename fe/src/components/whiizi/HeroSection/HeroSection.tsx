import { PhonePreview } from "../PhonePreview/PhonePreview";
import styles from "./HeroSection.module.css";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className={styles.section}>
      {/* Left: Copy */}
      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Automasi WhatsApp untuk e-commerce digital
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          <span className={styles.headingGradient}>
            Pusing Ngurus Orderan Manual?
          </span>
          <span className={styles.headingDark}>
            Ubah Bisnis dengan
            <br />
            Automasi WhatsApp.
          </span>
        </h1>

        {/* Description */}
        <p className={styles.description}>
          Automasi seluruh alur bisnis e-commerce dengan bot WhatsApp pintar.
          Tingkatkan penjualan hingga{" "}
          <strong style={{ color: "#22c55e", fontWeight: 700 }}>300%</strong>{" "}
          dengan strategi automasi yang terbukti berhasil.
        </p>

        {/* CTA */}
        <div className={styles.ctaGroup}>
          <Link href="/register">
            <button className={styles.btnPrimary}>
              Mulai Gratis Sekarang
              <svg
                className={styles.btnPrimaryIcon}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>

          <button type="button" className={styles.btnSecondary}>
            <svg
              className={styles.playIcon}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6.5 5.5l4 2.5-4 2.5V5.5z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
            Lihat Demo Chat
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statDot} />
            <span className={styles.statText}>
              <span className={styles.statValue}>10.000+</span> Toko Digital
              Aktif
            </span>
          </div>

          <span className={styles.statDivider} />

          <div className={styles.stat}>
            <span className={styles.statDot} />
            <span className={styles.statText}>
              <span className={styles.statValue}>99,9%</span> Uptime
            </span>
          </div>

          <span className={styles.statDivider} />

          <div className={styles.stat}>
            <span className={styles.statDot} />
            <span className={styles.statText}>
              Support <span className={styles.statValue}>24/7</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Phone */}
      <PhonePreview />
    </section>
  );
}
