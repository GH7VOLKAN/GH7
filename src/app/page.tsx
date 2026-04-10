"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GH7Logo } from "@/components/gh7-logo";
import { AIPlatformIcon, PLATFORM_INFO, AI_PLATFORM_KEYS } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

export default function HomePage() {
  const [activeKapi, setActiveKapi] = useState("firma");
  const [mainInput, setMainInput] = useState("");
  const [finalKapi, setFinalKapi] = useState("");
  const [finalInput, setFinalInput] = useState("");
  const router = useRouter();

  const kapiPlaceholders: Record<string, string> = {
    firma: "firmaniz.com",
    kisi: "Ad Soyad",
    eticaret: "Ürün satış linki",
    export: "firmaniz.com",
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vis");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleMainSubmit = () => {
    if (!mainInput.trim()) return;
    const param = activeKapi === "kisi" ? "name" : "domain";
    router.push(`/analiz?type=${activeKapi}&${param}=${encodeURIComponent(mainInput)}`);
  };

  const handleFinalSubmit = () => {
    if (!finalInput.trim()) return;
    const type = finalKapi || "firma";
    const param = type === "kisi" ? "name" : "domain";
    router.push(`/analiz?type=${type}&${param}=${encodeURIComponent(finalInput)}`);
  };

  return (
    <>
      {/* NAV */}
      <nav className="gh7-nav">
        <Link href="/" className="logo"><GH7Logo size="sm" /></Link>
        <ul className="nav-links">
          <li><a href="#cozum">Çözümler</a></li>
          <li><a href="#pricing">Fiyatlar</a></li>
          <li><a href="#faq">SSS</a></li>
        </ul>
        <div className="nav-right">
          <Link href="/giris" className="btn-ghost">Giriş</Link>
          <a href="#test" className="btn-black">Ücretsiz Test →</a>
        </div>
      </nav>

      {/* BÖLÜM 1: HERO */}
      <section className="hero">
        <span className="hero-eyebrow">Generative Engine Optimization</span>
        <h1 className="hero-h1">Yapay zeka<br/>sizi öneriyor <span className="muted">mu?</span></h1>

        <div className="hero-body">
          <p>Bunu kendiniz de yapabilirsiniz.</p>
          <p style={{ marginTop: 12 }}>ChatGPT&apos;yi açın. &quot;Sektörümde en iyi firma hangisi?&quot; yazın. Cevabı görün.</p>

          <span className="ama">Ama...</span>

          <ul className="hero-list">
            <li>Bunu 50 farklı soruyla,</li>
            <li>5 farklı platformda,</li>
            <li>3 farklı ilde,</li>
            <li>her hafta tekrarlayıp,</li>
            <li>sonuçları karşılaştırıp,</li>
            <li>değişimi takip edip,</li>
            <li>rakiplerinizi izleyip,</li>
            <li>neyin işe yaradığını anlayıp,</li>
            <li>buna göre aksiyon almak...</li>
          </ul>
        </div>

        <p className="hero-kicker">Bunu kimse sürdüremez.</p>
        <p className="hero-kicker-sub">
          <strong>GH7 bunu sizin yerinize yapar.</strong><br/>
          Her hafta. Her platformda. Her ilde.<br/>
          Siz sadece sonuçları görürsünüz.
        </p>
      </section>

      {/* BÖLÜM 2: KORKU — Virüsü Göster */}
      <div className="fear-sec reveal" id="test">
        <div className="fear-inner">
          <div className="fear-stat">
            <span className="fear-stat-num">%73</span>
            <p className="fear-stat-label">Test eden firmaların %73&apos;ünde en az 1 kritik sorun bulundu. Rakipler önde, marka görünmüyor.</p>
          </div>
          <div className="fear-findings">
            <div className="ff">
              <span className="ff-label">En sık karşılaşılan sorun</span>
              <div className="ff-finding">&quot;ChatGPT rakibinizi öneriyor, sizi değil.&quot;</div>
              <p className="ff-sub">Aynı sektör, aynı ürün — ama AI hep rakibi seçiyor. Neden? Çünkü rakibin dijital ayak izi daha güçlü.</p>
            </div>
            <div className="ff">
              <span className="ff-label">İkinci en sık sorun</span>
              <div className="ff-finding">&quot;3 kritik sorguda hiç görünmüyorsunuz.&quot;</div>
              <p className="ff-sub">Müşterinizin sorduğu soruların bir kısmında siz yoksunuz. O satış rakibe gidiyor.</p>
            </div>
            <div className="ff">
              <span className="ff-label">Üçüncü en sık sorun</span>
              <div className="ff-finding">&quot;AI sizi güvenilir kaynak saymıyor.&quot;</div>
              <p className="ff-sub">Görünüyorsunuz ama önerilmiyorsunuz. AI tereddüt ediyor — ve başka bir firma öneriyor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BÖLÜM 3: 4 KAPI + INPUT — Testi Başlat */}
      <section className="kapi-sec reveal">
        <span className="kapi-sec-tag">Ücretsiz Audit</span>
        <h2 className="kapi-title">Sizi test edelim.<br/>60 saniye, ücretsiz.</h2>
        <p className="kapi-sub">Firma mı, kişi mi, ürün mü, yurt dışı mı? Seçin, domain girin, sonuçları görün.</p>

        <div className="kapi-grid">
          {(["firma", "kisi", "eticaret", "export"] as const).map((id) => (
            <div
              key={id}
              className={`kapi-card${activeKapi === id ? " active" : ""}`}
              onClick={() => setActiveKapi(id)}
            >
              <span className="kapi-name">
                {id === "firma" ? "Firma" : id === "kisi" ? "Kişi" : id === "eticaret" ? "E-Ticaret" : "Export"}
              </span>
              <span className="kapi-desc">
                {id === "firma" ? "Markanız AI'da nasıl görünüyor?" : id === "kisi" ? "Adınız AI'da nasıl geçiyor?" : id === "eticaret" ? "Ürününüz öneriliyor mu?" : "Yabancılar sizi buluyor mu?"}
              </span>
            </div>
          ))}
        </div>

        <div className="kapi-input-row">
          <input
            className="kapi-input"
            type="text"
            placeholder={kapiPlaceholders[activeKapi]}
            value={mainInput}
            onChange={(e) => setMainInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMainSubmit()}
          />
          <button className="btn-submit" onClick={handleMainSubmit}>Ücretsiz Test Et →</button>
        </div>
        <p className="kapi-note">Kayıt gerekmez · Kredi kartı yok · 60 saniye</p>
        <div className="kapi-platforms">
          {AI_PLATFORM_KEYS.map((key) => (
            <span key={key} className="kapi-platform-chip">
              <span className="kapi-platform-dot" style={{ background: PLATFORM_INFO[key].color }} />
              <AIPlatformIcon platform={key} size={16} colored />
              <span>{PLATFORM_INFO[key].name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* BÖLÜM 4: FİYATLANDIRMA — 2 Paket */}
      <div className="cozum-sec reveal" id="cozum">
        <div className="cozum-inner">
          <div className="cozum-header">
            <span className="sec-tag">Fiyatlandırma</span>
            <h2 className="sec-h2">Net fiyat.<br/><span className="muted">Gizli maliyet yok.</span></h2>
            <p className="sec-desc">Ücretsiz başlayın. Pro ile takip edin ve çözüm üretin.</p>
          </div>

          <div className="cozum-steps" id="pricing" style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* Ücretsiz */}
            <div className="cs">
              <div className="cs-title">Ücretsiz</div>
              <div className="cs-price">₺0</div>
              <div className="cs-period">tek seferlik</div>
              <p className="cs-desc">Yapay zeka sizi nasıl görüyor? 5 platform, 10 sorgu, tüm rakipler. Tam analiz, blur yok.</p>
              <ul className="cs-features">
                <li>5 AI platformu taraması</li>
                <li>10 sorgu analizi</li>
                <li>Rakip karşılaştırma</li>
                <li>Ses payı, pozisyon, algı skoru</li>
                <li>AI yanıtları tam metin</li>
                <li>Kritik sorunlar listesi</li>
              </ul>
              <a href="#test" className="cs-cta cs-cta-out">Ücretsiz Analiz Et</a>
            </div>

            {/* Pro */}
            <div className="cs">
              <div className="cs-badge">En Popüler</div>
              <div className="cs-title">Pro</div>
              <div className="cs-price">₺2.450</div>
              <div className="cs-period">/ay</div>
              <p className="cs-desc">Haftalık takip + çözüm üretimi. Rakip sizi geçince haberdar olun, hazır çözüm alın.</p>
              <ul className="cs-features">
                <li>Ücretsiz&apos;deki her şey</li>
                <li>20 sorgu, haftalık otomatik tarama</li>
                <li>Haftalık aksiyon listesi</li>
                <li>İçerik taslakları (Opus)</li>
                <li>Rakip istihbarat raporu</li>
                <li>Yaptım → doğrulandı kontrolü</li>
                <li>Trend grafikleri + korelasyon</li>
                <li>PDF rapor + WhatsApp özet</li>
                <li>E-posta bildirimleri</li>
              </ul>
              <Link href="/giris" className="cs-cta cs-cta-black">Pro&apos;ya Başla →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* BÖLÜM 5: ISITMAX CASE STUDY */}
      <div className="case-sec reveal">
        <div className="case-inner">
          <div className="case-header">
            <span className="sec-tag">İlk Müşteri &amp; Referans</span>
            <h2 className="sec-h2">GH7&apos;yi biz yaptık.<br/><span className="muted">İlk kendimizde denedik.</span></h2>
            <p className="case-sub">isitmax.com — Türkiye&apos;nin lider ısıtma platformu, 1M+ aylık ziyaretçi. GH7&apos;yi kurmadan önce kendi verilerimizi analiz ettik. Gördüklerimiz bu platformu inşa ettirdi.</p>
          </div>
          <div className="case-body">
            <div className="case-story">
              <div className="case-step">
                <span className="case-step-num">01</span>
                <div>
                  <div className="case-step-title">ChatGPT&apos;ye sorduk</div>
                  <p className="case-step-desc">&quot;Türkiye&apos;de en iyi ısıtma firması&quot; — çıktık. Güzel. Ama 50 farklı soruda ne olduğunu bilmiyorduk.</p>
                </div>
              </div>
              <div className="case-step">
                <span className="case-step-num">02</span>
                <div>
                  <div className="case-step-title">Gerçeği gördük</div>
                  <p className="case-step-desc">Bazı sorgularda rakipler önümüzdeydi. &quot;Çatı kar eritme&quot; ve &quot;sera ısıtma&quot;da görünürlüğümüz %14&apos;tü.</p>
                </div>
              </div>
              <div className="case-step">
                <span className="case-step-num">03</span>
                <div>
                  <div className="case-step-title">Çözüm ürettik, uyguladık</div>
                  <p className="case-step-desc">Schema ekledik, zayıf sayfaları yeniden yazdık. 3 haftada GEO skoru 71&apos;den 74&apos;e çıktı.</p>
                </div>
              </div>
              <div className="case-step" style={{ borderBottom: "none" }}>
                <span className="case-step-num">04</span>
                <div>
                  <div className="case-step-title">GH7&apos;yi kurduk</div>
                  <p className="case-step-desc">Bu süreci her firma için otomatize etmek için GH7&apos;yi inşa ettik. ISITMAX canlı referans olarak çalışıyor.</p>
                </div>
              </div>
            </div>
            <div className="case-metrics">
              <div className="case-metrics-header">
                <span className="case-brand">ISITMAX</span>
                <span className="case-domain">isitmax.com · Isıtma Sistemleri</span>
              </div>
              <div className="case-score-row">
                <div className="case-score-big">
                  <span className="csb-num">74</span>
                  <span className="csb-label">GEO Skoru</span>
                  <span className="csb-delta">↑ 3 puan / hafta</span>
                </div>
                <div className="case-score-grid">
                  <div className="csg-item"><span className="csg-num">%26</span><span className="csg-lbl">Ses Payı</span><span className="csg-delta">↑ %2</span></div>
                  <div className="csg-item"><span className="csg-num">%100</span><span className="csg-lbl">Kapsam</span><span className="csg-delta">→ sabit</span></div>
                  <div className="csg-item"><span className="csg-num">1.4</span><span className="csg-lbl">Ort. Sıra</span><span className="csg-delta">↑ 0.1</span></div>
                </div>
              </div>
              <div className="case-keywords">
                <div className="ck-header">Arama bazlı görünürlük</div>
                <div className="ck-row"><span className="ck-query">villa banyosu elektrikli yerden ısıtma</span><span className="ck-bar-wrap"><span className="ck-bar" style={{ width: "25%" }}></span></span><span className="ck-val">%25</span></div>
                <div className="ck-row"><span className="ck-query">yüzey altı boru ısıtma kablosu</span><span className="ck-bar-wrap"><span className="ck-bar" style={{ width: "36%" }}></span></span><span className="ck-val">%36</span></div>
                <div className="ck-row"><span className="ck-query">endüstriyel varil ısıtma ceketi</span><span className="ck-bar-wrap"><span className="ck-bar" style={{ width: "24%" }}></span></span><span className="ck-val">%24</span></div>
                <div className="ck-row ck-weak"><span className="ck-query">çatıda kar buz eritme kablo çözümleri</span><span className="ck-bar-wrap"><span className="ck-bar ck-bar-weak" style={{ width: "14%" }}></span></span><span className="ck-val ck-val-weak">%14 ↓</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harita ve ajans bölümleri kaldırıldı */}

      {/* BÖLÜM 6: PLATFORM STRIP */}
      <div className="platform-strip reveal">
        <div className="platform-strip-label">6 AI platformunda anlık izleme</div>
        <div className="platform-row">
          {AI_PLATFORM_KEYS.map((key) => (
            <div key={key} className="platform-item">
              <AIPlatformIcon platform={key} size={28} colored />
              <span className="platform-name">{PLATFORM_INFO[key].name}</span>
              <span className="platform-type">{PLATFORM_INFO[key].description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BÖLÜM 7: ARAŞTIRMA */}
      <div className="research-sec reveal">
        <div className="research-inner">
          <span className="sec-tag">Neden Şimdi?</span>
          <h2 className="sec-h2" style={{ marginBottom: 12 }}>Bu bir trend değil,<br/><span className="muted">yapısal bir dönüşüm</span></h2>
          <p className="sec-desc" style={{ marginBottom: 48, maxWidth: 480 }}>Princeton, Stanford ve Gartner araştırmalarının ortak sonucu.</p>
          <div className="research-grid">
            <div className="rc">
              <span className="rc-source">Gartner, 2025</span>
              <span className="rc-num">%25</span>
              <p className="rc-text">Geleneksel arama trafiği 2026&apos;ya kadar düşecek</p>
            </div>
            <div className="rc">
              <span className="rc-source">Princeton / ACM KDD, 2024</span>
              <span className="rc-num">%40</span>
              <p className="rc-text">GEO optimize edilen içerik AI&apos;da %40 daha fazla görünür</p>
            </div>
            <div className="rc">
              <span className="rc-source">Bain &amp; Company, 2025</span>
              <span className="rc-num">%60</span>
              <p className="rc-text">Google aramalarının %60&apos;ı tıklama olmadan bitiyor</p>
            </div>
          </div>
        </div>
      </div>

      {/* BÖLÜM 8: FAQ */}
      <section className="faq-sec reveal" id="faq">
        <div className="faq-wrap">
          <h2>Merak edilenler</h2>
          <details className="faq"><summary className="faq-q">GEO nedir, SEO&apos;dan farkı ne? <span className="faq-plus">+</span></summary><p className="faq-a">SEO sizi Google&apos;da sıralar. GEO ise ChatGPT, Gemini, Perplexity gibi yapay zeka motorlarının sizi güvenilir kaynak olarak önermesini sağlar. Princeton araştırmasına göre GEO optimize içerikler AI yanıtlarında %40 daha fazla görünüyor. İkisi tamamlayıcı — biri olmadan diğeri eksik kalır.</p></details>
          <details className="faq"><summary className="faq-q">Ücretsiz test ne gösteriyor? <span className="faq-plus">+</span></summary><p className="faq-a">6 AI platformunda markanızı tarıyoruz. Hangi sorgularda görünüyorsunuz, hangilerinde rakibiniz öne çıkıyor, ses payınız ne, algı skorunuz ne — tek raporda görüyorsunuz. Kayıt gerekmez, 60 saniye.</p></details>
          <details className="faq"><summary className="faq-q">Tespit ile Takip arasındaki fark nedir? <span className="faq-plus">+</span></summary><p className="faq-a">Tespit tek seferlik bir fotoğraftır — bugün neredesiniz. Takip ise sürekli izleme — rakip sizi geçtiğinde, yeni bir sorguda görünmediğinizde, skorunuz değiştiğinde anında haberdar olursunuz. Haftalık otomatik çalışır, siz bakmak zorunda kalmazsınız.</p></details>
          <details className="faq"><summary className="faq-q">Ücretsiz ile Pro arasındaki fark ne? <span className="faq-plus">+</span></summary><p className="faq-a">Ücretsiz tek seferlik bir fotoğraftır — bugün neredesiniz. Pro ise sürekli takip + çözüm üretimi. Rakip sizi geçtiğinde haberdar olursunuz, haftalık aksiyon listesi alırsınız, hazır içerik taslakları üretilir, yaptığınız iyileştirmeler doğrulanır.</p></details>
          <details className="faq"><summary className="faq-q">Ne kadar sürede sonuç görürüm? <span className="faq-plus">+</span></summary><p className="faq-a">İlk analiz 60 saniye. Optimizasyon uygulamalarının AI platformlarına yansıması 2-4 hafta. ISITMAX&apos;ta 3 haftada GEO skoru 71&apos;den 74&apos;e çıktı, ses payı %24&apos;ten %26&apos;ya yükseldi.</p></details>
        </div>
      </section>

      {/* BÖLÜM 9: FINAL CTA */}
      <section className="final-sec reveal">
        <h2 className="final-h2">Yapay zekanın<br/><span className="muted">sizi önermesini</span><br/>sağlayın</h2>
        <p className="final-sub">60 saniye. Kayıt gerekmez. Firma, kişi, ürün veya export — hepsi ücretsiz.</p>
        <div className="final-kapi">
          {["Firma", "Kişi", "E-Ticaret", "Export"].map((label) => {
            const id = label === "Firma" ? "firma" : label === "Kişi" ? "kisi" : label === "E-Ticaret" ? "eticaret" : "export";
            return (
              <button
                key={id}
                className="fk"
                style={finalKapi === id ? { borderColor: "var(--black)" } : undefined}
                onClick={() => {
                  setFinalKapi(id);
                  setFinalInput("");
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="final-input-row">
          <input
            className="final-input"
            type="text"
            placeholder={kapiPlaceholders[finalKapi || "firma"]}
            value={finalInput}
            onChange={(e) => setFinalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFinalSubmit()}
          />
          <button className="btn-submit" onClick={handleFinalSubmit}>Test Et →</button>
        </div>
        <div className="final-platforms">
          {AI_PLATFORM_KEYS.map((key) => (
            <span key={key} className="kapi-platform-chip">
              <AIPlatformIcon platform={key} size={16} colored />
              <span>{PLATFORM_INFO[key].name}</span>
            </span>
          ))}
        </div>
        <p className="final-badge">Bir <strong>ISITMAX</strong> projesidir · 1M+ aylık ziyaretçinin arkasındaki ekip</p>
      </section>

      {/* FOOTER */}
      <footer className="gh7-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand"><GH7Logo size="default" /></div>
              <p className="footer-desc">Türkiye&apos;nin ilk GEO platformu. Bir ISITMAX projesidir.</p>
            </div>
            <div className="footer-cols">
              <div className="fcol"><h4>Ürünler</h4><ul><li><a href="#test">Ücretsiz Analiz</a></li><li><a href="#pricing">Pro Paket</a></li></ul></div>
              <div className="fcol"><h4>Platform</h4><ul><li><a href="#">Fiyatlar</a></li><li><Link href="/giris">Giriş</Link></li><li><a href="#">API</a></li></ul></div>
              <div className="fcol"><h4>Kaynaklar</h4><ul><li><a href="#">GEO Nedir?</a></li><li><Link href="/blog">Blog</Link></li><li><a href="#faq">SSS</a></li><li><a href="#">İletişim</a></li></ul></div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 GH7.ai — Bir ISITMAX projesidir.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="#" style={{ fontSize: 13, color: "var(--g300)", textDecoration: "none" }}>Gizlilik</a>
              <a href="#" style={{ fontSize: 13, color: "var(--g300)", textDecoration: "none" }}>Kullanım</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
