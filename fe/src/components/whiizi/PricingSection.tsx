const plans = [
  {
    name: "Paket Basic",
    price: "Rp 15.000/bulan",
    highlight: false,
    description: "Cocok untuk satu toko digital yang baru mulai.",
    features: [
      "1 Bot WhatsApp",
      "10.000 Transaksi/bulan",
      "Dashboard Analytics dasar",
    ],
  },
  {
    name: "Paket Pro",
    price: "Rp 25.000/bulan",
    highlight: true,
    description: "Untuk seller yang ingin scale dan butuh support prioritas.",
    features: [
      "3 Bot WhatsApp",
      "Unlimited Transaksi",
      "Prioritas Support 24/7",
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="harga"
      className="relative border-t border-slate-800 bg-slate-950 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Harga
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Paket fleksibel sesuai tahap bisnis Anda.
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Mulai dari harga yang sangat terjangkau. Upgrade kapan saja saat
            transaksi Anda meningkat.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl border p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.7)] transition-all duration-300 border-slate-800/80 bg-slate-900/40 hover:border-emerald-500 hover:bg-slate-900/80"
            >
              {plan.highlight && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/40">
                  Paling Populer
                </span>
              )}

              <h3 className="text-base font-semibold text-slate-50">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

              <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-50">
                {plan.price}
              </p>

              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.6666 5.83337L8.33329 14.1667L3.33329 9.16671"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="mt-6 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition border border-slate-700 text-slate-100 hover:border-emerald-500 hover:text-emerald-300"
                type="button"
              >
                Mulai Gratis Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
