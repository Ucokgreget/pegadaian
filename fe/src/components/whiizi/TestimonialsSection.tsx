const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Owner Toko Akun Premium",
    quote:
      "Sejak pakai Whiizi, jualan akun premium jadi otomatis! Omset naik 300%.",
  },
  {
    name: "Dewi Lestari",
    role: "Seller Produk Digital",
    quote:
      "Setup cuma 5 menit, customer senang karena proses cepat di WhatsApp.",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimoni"
      className="relative border-t border-slate-800 bg-slate-950/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Testimoni
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Dipercaya seller digital di seluruh Indonesia.
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Dari penjual akun streaming hingga e-course, Whiizi membantu
              mengotomasi order tanpa harus balas chat satu per satu.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.6)]"
            >
              <blockquote className="text-sm text-slate-300 sm:text-base">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 flex flex-col text-sm text-slate-400">
                <span className="font-medium text-slate-50">{item.name}</span>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
