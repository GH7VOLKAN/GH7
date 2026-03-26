export function FooterSection() {
  return (
    <footer className="px-5 sm:px-10 pt-12 pb-7 border-t border-zinc-100">
      <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8 max-w-[1120px] mx-auto mb-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <div className="font-extrabold text-[15px] mb-1.5" style={{ letterSpacing: "-0.5px" }}>
            GH7.ai
          </div>
          <p className="text-[11px] text-zinc-400 max-w-[220px] leading-[1.5]">
            Türkiye&apos;nin ilk GEO platformu. Yapay zeka görünürlüğünüzü takip edin, anlayın, iyileştirin.
          </p>
        </div>

        {/* Platform */}
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] mb-2.5">
            Platform
          </div>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Firma Analizi
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Kişi Analizi
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            E-Ticaret Analizi
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Export Analizi
          </a>
          <a href="#fiyat" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Fiyatlandırma
          </a>
        </div>

        {/* Blog */}
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] mb-2.5">
            Blog
          </div>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            GEO Nedir?
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            SEO vs GEO
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Sektör Raporları
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Sağlık Turizmi ve AI
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            E-Ticaret ve AI
          </a>
        </div>

        {/* Kaynaklar */}
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] mb-2.5">
            Kaynaklar
          </div>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            API Dokümantasyonu
          </a>
          <a href="#sss" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            SSS
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            İletişim
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Gizlilik Politikası
          </a>
        </div>

        {/* Şirket */}
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] mb-2.5">
            Şirket
          </div>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Hakkımızda
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            ISITMAX Projesi
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Ajans Ortaklığı
          </a>
          <a href="#" className="block text-[12px] text-zinc-500 no-underline py-[3px] hover:text-[#09090B]">
            Kariyer
          </a>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-300 pt-5 border-t border-zinc-100 max-w-[1120px] mx-auto">
        © 2026 GH7.ai — Bir ISITMAX projesidir. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
