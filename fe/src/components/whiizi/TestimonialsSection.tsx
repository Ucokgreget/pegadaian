const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Owner Toko Akun Premium",
    quote: "Sejak pakai Sijaka.id, jualan akun premium jadi otomatis! Omset naik 300%. Customer gak perlu nunggu admin bangun tidur buat order.",
    initials: "RP",
    color: "bg-blue-100 text-blue-700"
  },
  {
    name: "Dewi Lestari",
    role: "Seller Produk Digital",
    quote: "Setup cuma 5 menit, customer senang karena proses cepat di WhatsApp. Integrasi payment gateway-nya mulus banget.",
    initials: "DL",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "Ahmad Faisal",
    role: "Agensi TopUp Game",
    quote: "Dulu pusing ngecek mutasi satu-satu. Sekarang bot Sijaka yang handle semuanya. Sangat sangat recommended untuk seller digital!",
    initials: "AF",
    color: "bg-purple-100 text-purple-700"
  },
  {
    name: "Siska Saraswati",
    role: "Kreator E-Course",
    quote: "Jualan e-book dan kelas online jalan sendiri. Tinggal fokus bikin konten, urusan transaksi dan pengiriman file udah diurus bot.",
    initials: "SS",
    color: "bg-rose-100 text-rose-700"
  },
];

export function TestimonialsSection() {
  // We duplicate the items to create a seamless infinite loop
  const loopTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimoni" className="relative py-24 sm:py-32 overflow-hidden bg-slate-50/30">
      {/* Top Border */}
      <div className="absolute top-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto flex flex-col items-center px-4 text-center sm:px-6 lg:px-8 mb-16">
        <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
          Testimoni
        </p>
        <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-foreground leading-[1.15] max-w-2xl">
          Dipercaya ribuan seller digital di seluruh Indonesia.
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative flex max-w-[100vw] overflow-hidden">
        {/* Left/Right fading gradients to hide edges smoothly */}
        <div className="absolute left-0 top-0 z-10 h-full w-[10%] bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-[10%] bg-gradient-to-l from-background to-transparent" />

        {/* Marquee Inner Track */}
        <div className="flex w-fit animate-marquee hover:animate-paused gap-6 px-3">
          {loopTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="flex w-[320px] sm:w-[400px] shrink-0 flex-col justify-between rounded-2xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-[0.95rem] leading-[1.65] text-muted-foreground font-medium mb-8">
                “{item.quote}”
              </blockquote>
              <div className="mt-auto flex items-center gap-4 border-t border-border/50 pt-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${item.color}`}>
                  {item.initials}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-sm">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
