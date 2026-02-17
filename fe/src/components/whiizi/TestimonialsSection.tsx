const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Owner Toko Akun Premium",
    quote:
      "Sejak pakai Zaptify, jualan akun premium jadi otomatis! Omset naik 300%.",
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
      className="relative border-t border-border bg-card/10 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Testimoni
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Dipercaya seller digital di seluruh Indonesia.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Dari penjual akun streaming hingga e-course, Zaptify membantu
              mengotomasi order tanpa harus balas chat satu per satu.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <blockquote className="text-sm text-muted-foreground sm:text-base">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 flex flex-col text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{item.name}</span>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
