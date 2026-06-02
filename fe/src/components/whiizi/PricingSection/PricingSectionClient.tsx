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
    <section id="harga" className="relative py-24 sm:py-32 bg-white">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-[40rem] mx-auto text-center mb-20">
          <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
            Harga
          </p>
          <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-foreground leading-[1.15]">
            Investasi yang sesuai dengan <span className="text-primary">tahap bisnis Anda.</span>
          </h2>
          <p className="mt-4 text-[1.05rem] text-muted-foreground leading-relaxed">
            Mulai dari harga yang sangat terjangkau. Tidak ada biaya tersembunyi. Upgrade kapan saja saat transaksi Anda meningkat tajam.
          </p>
        </div>

        {/* Cards wrapper */}
        <div className={`grid gap-8 items-stretch ${gridClass}`}>
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`flex flex-col relative animate-in fade-in slide-in-from-bottom-6 duration-700 ${pkg.isPopular ? "lg:-mt-4 max-lg:order-first z-10" : "z-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div
                className={`flex h-full flex-col p-8 sm:p-10 rounded-[1.75rem] bg-white text-center transition-all duration-300 min-h-[520px] 
                ${pkg.isPopular 
                  ? "border-2 border-primary shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] ring-1 ring-primary/20 scale-100 lg:scale-105" 
                  : "border border-border shadow-sm hover:shadow-lg hover:border-border/80"}`}
              >
                {/* Popular badge */}
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[0.8rem] font-bold tracking-wider shadow-lg">
                    <span>🔥</span> Paling Populer
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 
                    ${pkg.isPopular 
                      ? "bg-primary text-white shadow-lg shadow-primary/30" 
                      : "bg-primary/10 text-primary ring-1 ring-primary/20"}`}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Plan name */}
                <h3 className="text-xl font-bold text-foreground m-0">
                  {pkg.name}
                </h3>

                {/* Main price */}
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className={`text-[2.75rem] font-black tracking-tight leading-none ${pkg.isPopular ? "text-foreground" : "text-foreground/90"}`}>
                    {formatMainPrice(pkg)}
                  </span>
                </div>
                
                {/* Billing label */}
                <p className="text-sm font-medium text-muted-foreground mt-2 mb-8">
                  {formatSubPrice(pkg)}
                </p>

                {/* Features */}
                <ul className="list-none p-0 m-0 flex flex-col gap-4 text-left border-t border-border/50 pt-8">
                  {pkg.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-[0.15rem] 
                        ${pkg.isPopular || f.isHighlighted 
                          ? "bg-primary text-white" 
                          : "bg-primary/10 text-primary"}`}>
                        <svg viewBox="0 0 12 10" fill="none" className="w-[0.55rem] h-[0.55rem]">
                          <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className={`text-[0.9rem] leading-[1.45] ${f.isHighlighted ? "font-bold text-foreground" : "text-muted-foreground font-medium"}`}>
                        {f.featureText}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div className="flex-1 min-h-[2rem]" />

                {/* CTA */}
                {pkg.isCustomPrice ? (
                  <Link
                    href="/contact"
                    className="w-full py-3.5 px-6 rounded-xl text-[0.95rem] font-bold cursor-pointer transition-all duration-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Hubungi Kami
                  </Link>
                ) : (
                  <Link
                    href={`/user/checkout?package=${pkg.id}`}
                    className={`w-full py-3.5 px-6 rounded-xl text-[0.95rem] font-bold cursor-pointer transition-all duration-300 border-none 
                      ${pkg.isPopular 
                        ? "bg-foreground text-white hover:bg-foreground/90 shadow-[0_8px_16px_-4px_rgba(10,22,40,0.2)] hover:-translate-y-0.5" 
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}
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
