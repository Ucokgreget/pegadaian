import { PhonePreview } from "./PhonePreview";

export function HeroSection() {
  return (
    <section className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center mb-20 lg:gap-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Automasi WhatsApp untuk e-commerce digital
        </div>

        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-sky-500 bg-clip-text text-transparent">
            Pusing Ngurus Orderan Manual?
          </span>
          <br />
          Ubah Bisnis dengan Automasi WhatsApp.
        </h1>

        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Automasi seluruh alur bisnis e-commerce dengan bot WhatsApp pintar.
          Tingkatkan penjualan hingga 300% dengan strategi automasi yang
          terbukti berhasil.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Mulai Gratis Sekarang
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-input px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
          >
            Lihat Demo Chat
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            10.000+ Toko Digital Aktif
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            99,9% Uptime
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Support 24/7
          </div>
        </div>
      </div>

      <PhonePreview />
    </section>
  );
}
