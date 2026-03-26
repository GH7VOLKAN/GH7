export function FooterSection() {
  return (
    <footer className="px-5 sm:px-10 pt-12 pb-7 border-t border-[#E5E7EB]">
      <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-8 max-w-[1120px] mx-auto mb-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <div
            className="font-extrabold text-[15px] mb-1.5"
            style={{ letterSpacing: "-0.5px" }}
          >
            GH7<span className="text-[#9CA3AF]">.ai</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] max-w-[220px] leading-[1.5]">
            Türkiye&apos;nin ilk GEO platformu. Yapay zeka görünürlüğünüzü
            takip edin, anlayın, iyileştirin.
          </p>
        </div>

        {/* Platform */}
        <div>
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2.5">
            Platform
          </div>
          <a href="/analiz?type=firma" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Firma Analizi
          </a>
          <a href="/analiz?type=kisi" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Kişi Analizi
          </a>
          <a href="/analiz?type=eticaret" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            E-Ticaret Analizi
          </a>
          <a href="/analiz?type=export" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Export Analizi
          </a>
          <a href="#pricing" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Fiyatlandırma
          </a>
        </div>

        {/* Kaynaklar */}
        <div>
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2.5">
            Kaynaklar
          </div>
          <a href="#geo" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            GEO Nedir?
          </a>
          <a href="#faq" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            SSS
          </a>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            API Dokümantasyonu
          </a>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            İletişim
          </a>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Gizlilik Politikası
          </a>
        </div>

        {/* Şirket */}
        <div>
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2.5">
            Şirket
          </div>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Hakkımızda
          </a>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            ISITMAX Projesi
          </a>
          <a href="#" className="block text-[12px] text-[#6B7280] no-underline py-[3px] hover:text-[#09090B]">
            Ajans Ortaklığı
          </a>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#D1D5DB] pt-5 border-t border-[#F3F4F6] max-w-[1120px] mx-auto">
        &copy; 2026 GH7.ai &mdash; Bir ISITMAX projesidir. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
