export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8 sm:text-sm">
        <p>
          © {new Date().getFullYear()} Zaptify. Seluruh hak cipta dilindungi.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#fitur" className="hover:text-emerald-300">
            Fitur
          </a>
          <a href="#harga" className="hover:text-emerald-300">
            Harga
          </a>
          <a href="#faq" className="hover:text-emerald-300">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}
