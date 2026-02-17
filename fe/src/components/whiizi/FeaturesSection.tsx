import { ReactNode } from "react";

const features: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Smart AI Bot",
    description:
      "Bot WhatsApp yang mengerti konteks percakapan dan membantu customer hingga checkout.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L3 14H11L11 22L21 10H13L13 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "24/7 Automation",
    description:
      "Transaksi tetap berjalan walau Anda sedang tidur. Bot aktif 24 jam.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 7V12L15 15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "WhatsApp Catalog",
    description: "Tampilkan katalog produk langsung di dalam chat WhatsApp.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M3 9H21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Payment Gateway",
    description:
      "Dukungan QRIS, transfer bank, dan e-wallet untuk pembayaran instan.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2.5"
          y="5"
          width="19"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 9H10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6 13H8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Auto Delivery",
    description:
      "Setelah pembayaran terverifikasi, sistem langsung mengirim file atau akun ke customer.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4H10L20 12L10 20H4L9 12L4 4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      id="fitur"
      className="relative border-t border-border bg-card/10 py-16 sm:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Fitur Unggulan
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Semua yang Anda butuhkan untuk meng-automasi toko digital.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Zaptify membantu mengelola order, pembayaran, dan pengiriman produk
            digital hanya dari WhatsApp. Tanpa ribet, tanpa coding.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/60 hover:bg-accent/50"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/40">
                {/* Icon color needs to optionally change if it's SVG with 'text-emerald-400' inside features array. 
                      However, the features array is defined OUTSIDE the component with hardcoded JSX. 
                      I need to update the features array too. */}
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
