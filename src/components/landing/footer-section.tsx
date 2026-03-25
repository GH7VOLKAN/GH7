export function FooterSection() {
  return (
    <footer className="px-5 sm:px-10 pt-12 pb-7 border-t border-zinc-100">
      <div className="flex justify-between gap-10 flex-wrap max-w-[1120px] mx-auto">
        {/* Brand */}
        <div>
          <div className="font-extrabold text-[15px] mb-1.5">GH7.ai</div>
          <p className="text-[12px] text-zinc-400 max-w-[260px] leading-[1.5]">
            Turkiye&apos;nin ilk GEO platformu. Yapay zeka gorunurlugunuzu takip edin, anlayin, iyilestirin.
          </p>
        </div>

        {/* Platform */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.06em] mb-2.5">
            Platform
          </div>
          <a href="#fiyat" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            Fiyatlandirma
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            API Dokumantasyonu
          </a>
          <a href="/login" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            Giris
          </a>
        </div>

        {/* Araclar */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.06em] mb-2.5">
            Araclar
          </div>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            AI Gorunurluk Analizi
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            GEO Skor Hesapla
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            Sektor Raporlari
          </a>
        </div>

        {/* Kaynaklar */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.06em] mb-2.5">
            Kaynaklar
          </div>
          <a href="#geo" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            GEO Nedir?
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            Blog
          </a>
          <a href="#sss" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            SSS
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px]">
            Iletisim
          </a>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-300 mt-10 pt-5 border-t border-zinc-100">
        © 2026 GH7.ai — Bir ISITMAX projesidir.
      </div>
    </footer>
  );
}
