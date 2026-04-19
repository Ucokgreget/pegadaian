"use client";

import { Package } from "@/actions/package";
import { PackageFeature } from "@/actions/packageFeature";
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
      ? "grid-cols-[minmax(0,22rem)]"
      : packages.length === 2
        ? "grid-cols-2 max-sm:grid-cols-1"
        : packages.length === 3
          ? "grid-cols-3 max-sm:grid-cols-1"
          : "grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-1";

  return (
    <section
      id="harga"
      className="relative py-20 pb-24 border-t border-border bg-background"
    >
      <div className="max-w-[72rem] mx-auto px-6">
        {/* Header */}
        <div className="max-w-[36rem] mb-16">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase text-primary bg-primary/10 border border-primary/20 py-1 px-3 rounded-full">
            Harga
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-[1.2] tracking-[-0.03em] text-foreground">
            Paket fleksibel sesuai{" "}
            <span className="text-primary">tahap bisnis Anda.</span>
          </h2>
          <p className="mt-3 text-[0.9rem] text-muted-foreground leading-[1.6]">
            Mulai dari harga yang sangat terjangkau. Upgrade kapan saja saat
            transaksi Anda meningkat.
          </p>
        </div>

        {/* Cards wrapper — popular card naik ke atas */}
        <div className={`grid gap-6 items-end ${gridClass}`}>
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-500 ${pkg.isPopular ? "-mt-10 max-sm:mt-0" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Popular badge — di ATAS card */}
              {pkg.isPopular && (
                <div className="self-center inline-flex items-center gap-[0.35rem] py-[0.45rem] px-[1.1rem] rounded-full bg-foreground text-background text-[0.78rem] font-bold tracking-[0.03em] -mb-[1px] relative z-10 shadow-md">
                  🔥 Paling Populer
                </div>
              )}

              <div
                className={`flex flex-col p-[2rem_1.75rem_1.75rem] rounded-[1.5rem] bg-card border border-border text-center transition-all duration-250 min-h-[520px] hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl ${pkg.isPopular ? "border-primary/35 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl" : ""}`}
              >
                {/* Icon */}
                <div
                  className={`w-[3.25rem] h-[3.25rem] rounded-[0.9rem] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-5 shadow-md ${pkg.isPopular ? "shadow-lg" : ""}`}
                >
                  <svg
                    className="w-[1.4rem] h-[1.4rem] text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
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
                <h3 className="text-[1.3rem] font-bold text-foreground tracking-[-0.02em] m-0">
                  {pkg.name}
                </h3>

                {/* Sub price (small) */}
                <p className="text-[0.8rem] text-muted-foreground mt-[0.3rem] mb-0">
                  {formatSubPrice(pkg)}
                </p>

                {/* Main price (huge) */}
                <p
                  className={`text-[clamp(2.8rem,6vw,3.8rem)] font-black tracking-[-0.05em] leading-none mt-3 mb-0 ${pkg.isPopular ? "text-primary" : pkg.isCustomPrice ? "text-primary opacity-70" : "text-primary"}`}
                >
                  {formatMainPrice(pkg)}
                </p>

                {/* Billing label */}
                <p className="text-[0.82rem] text-muted-foreground mt-[0.35rem] mb-6">
                  /{pkg.billingPeriod}
                </p>

                {/* Features */}
                <ul className="list-none p-0 m-0 flex flex-col gap-[0.65rem] text-left">
                  {pkg.features.map((f) => (
                    <li
                      key={f.id}
                      className={`flex items-start gap-[0.65rem] ${f.isHighlighted ? "font-semibold text-foreground" : ""}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-primary/12 border-[1.5px] border-primary/30 flex items-center justify-center shrink-0 mt-[0.1rem] text-primary ${f.isHighlighted ? "bg-primary border-primary text-primary-foreground" : ""}`}
                      >
                        <svg
                          viewBox="0 0 12 10"
                          fill="none"
                          className="w-[0.55rem] h-[0.55rem]"
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
                      <span
                        className={`text-[0.875rem] leading-[1.45] ${f.isHighlighted ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                      >
                        {f.featureText}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div className="flex-1 min-h-[1.5rem]" />

                {/* CTA */}
                {pkg.isCustomPrice ? (
                  <Link
                    href="/contact"
                    className="w-full py-[0.85rem] px-6 rounded-xl text-[0.9rem] font-semibold cursor-pointer tracking-[0.01em] transition-all duration-200 bg-muted text-foreground border border-border hover:bg-muted/80"
                  >
                    Hubungi Kami
                  </Link>
                ) : (
                  <Link
                    href={`/user/checkout?package=${pkg.id}`}
                    className={`w-full py-[0.85rem] px-6 rounded-xl text-[0.9rem] font-semibold cursor-pointer tracking-[0.01em] transition-all duration-200 border-none ${pkg.isPopular ? "bg-foreground text-background hover:opacity-90 hover:-translate-y-px hover:shadow-lg" : "bg-muted text-foreground border border-border hover:bg-muted/80"}`}
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
