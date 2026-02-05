export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent border-l-transparent" />
        </div>
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-medium text-slate-100 sm:text-base">
            Menyiapkan dashboard Zaptify...
          </p>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Menghubungkan automasi WhatsApp dan memuat data toko Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
