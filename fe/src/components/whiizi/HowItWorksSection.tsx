const steps = [
  {
    step: "Langkah 1",
    title: "Daftar & Hubungkan",
    description:
      "Daftar akun Zaptify dan hubungkan nomor WhatsApp Business melalui Meta Business Suite.",
  },
  {
    step: "Langkah 2",
    title: "Setup Produk",
    description:
      "Upload produk digital, atur harga, stok, dan pesan otomatis sesuai alur bisnis Anda.",
  },
  {
    step: "Langkah 3",
    title: "Customer Chat",
    description:
      "Customer memesan via chat WhatsApp, bot membalas otomatis dengan katalog dan opsi paket.",
  },
  {
    step: "Langkah 4",
    title: "Transaksi Otomatis",
    description:
      "Sistem mengecek pembayaran dan langsung mengirim produk atau akun secara instan.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="cara-kerja"
      className="relative border-t border-slate-800 bg-slate-950 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Cara Kerja
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Dari chat pertama hingga produk terkirim, semua otomatis.
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Cukup sekali setup, selanjutnya Zaptify yang meng-handle setiap
            percakapan, order, dan pembayaran via WhatsApp.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative flex flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5"
            >
              <span className="inline-flex w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/40">
                {step.step}
              </span>
              <h3 className="mt-1 text-base font-semibold text-slate-50">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
