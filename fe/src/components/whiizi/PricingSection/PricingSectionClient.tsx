"use client";

import { Package } from "@/actions/package";
import { PackageFeature } from "@/actions/packageFeature";
import s from "./PricingSection.module.css";
import Link from "next/link";

type PackageWithFeatures = Package & { features: PackageFeature[] };

function formatMainPrice(pkg: Package): string {
  if (pkg.isCustomPrice) return "Custom";
  const n = pkg.price;
  if (n >= 1_000_000)
    return `Rp${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp${Math.round(n / 1_000)}k`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function formatSubPrice(pkg: Package): string {
  if (pkg.isCustomPrice) return pkg.priceLabel || "custom";
  return pkg.priceLabel || `/${pkg.billingPeriod}`;
}

export default function PricingSectionClient({
  packages,
}: {
  packages: PackageWithFeatures[];
}) {
  if (packages.length === 0) return null;

  const gridClass =
    packages.length === 1
      ? s.grid1
      : packages.length === 2
        ? s.grid2
        : packages.length === 3
          ? s.grid3
          : s.grid4;

  return (
    <section id="harga" className={s.section}>
      <div className={s.container}>
        {/* Header */}
        <div className={s.header}>
          <span className={s.eyebrow}>Harga</span>
          <h2 className={s.heading}>
            Paket fleksibel sesuai{" "}
            <span className={s.headingAccent}>tahap bisnis Anda.</span>
          </h2>
          <p className={s.subheading}>
            Mulai dari harga yang sangat terjangkau. Upgrade kapan saja saat
            transaksi Anda meningkat.
          </p>
        </div>

        {/* Cards wrapper — popular card naik ke atas */}
        <div className={`${s.grid} ${gridClass}`}>
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`${s.cardOuter} ${pkg.isPopular ? s.cardOuterPopular : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Popular badge — di ATAS card */}
              {pkg.isPopular && (
                <div className={s.popularBadge}>🔥 Paling Populer</div>
              )}

              <div
                className={`${s.card} ${pkg.isPopular ? s.cardPopular : ""}`}
              >
                {/* Icon */}
                <div
                  className={`${s.iconWrap} ${pkg.isPopular ? s.iconWrapPopular : ""}`}
                >
                  <svg className={s.iconSvg} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Plan name */}
                <h3 className={s.planName}>{pkg.name}</h3>

                {/* Sub price (small) */}
                <p className={s.subPrice}>{formatSubPrice(pkg)}</p>

                {/* Main price (huge) */}
                <p
                  className={`${s.mainPrice} ${pkg.isPopular ? s.mainPricePopular : pkg.isCustomPrice ? s.mainPriceCustom : s.mainPriceDefault}`}
                >
                  {formatMainPrice(pkg)}
                </p>

                {/* Billing label */}
                <p className={s.billingLabel}>/{pkg.billingPeriod}</p>

                {/* Features */}
                <ul className={s.featureList}>
                  {pkg.features.map((f) => (
                    <li
                      key={f.id}
                      className={`${s.featureItem} ${f.isHighlighted ? s.featureItemHighlight : ""}`}
                    >
                      <span
                        className={`${s.checkCircle} ${f.isHighlighted ? s.checkCircleHighlight : ""}`}
                      >
                        <svg
                          viewBox="0 0 12 10"
                          fill="none"
                          className={s.checkSvg}
                        >
                          <path
                            d="M1 5l3.5 3.5L11 1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className={s.featureText}>{f.featureText}</span>
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div className={s.spacer} />

                {/* CTA */}
                {pkg.isCustomPrice ? (
                  <Link
                    href="/contact"
                    className={`${s.ctaBtn} ${s.ctaDefault}`}
                  >
                    Hubungi Kami
                  </Link>
                ) : (
                  <Link
                    href={`/user/checkout?package=${pkg.id}`}
                    className={`${s.ctaBtn} ${pkg.isPopular ? s.ctaPopular : s.ctaDefault}`}
                  >
                    Pilih {pkg.name}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
