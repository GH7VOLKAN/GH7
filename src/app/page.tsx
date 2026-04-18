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
  const [isYearly, setIsYearly] = useState(false);
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

  const getInputParam = (kapi: string): string => {
    if (kapi === "kisi") return "name";
    if (kapi === "eticaret") return "input"; // URL veya marka adı
    return "domain"; // firma, export/yurtdisi
  };

  const handleMainSubmit = () => {
    if (!mainInput.trim()) return;
    const param = getInputParam(activeKapi);
    router.push(`/analiz?type=${activeKapi}&${param}=${encodeURIComponent(mainInput)}`);
  };

  const handleFinalSubmit = () => {
    if (!finalInput.trim()) return;
    const type = finalKapi || "firma";
    const param = getInputParam(type);
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
          <p>Bunu kendiniz de öğrenebilirsiniz.</p>
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

      {/* BÖLÜM 2: 4 KAPI + INPUT — Testi Başlat (ÜCRETSIZ AUDIT) */}
      <section className="kapi-sec reveal" id="test">
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

      {/* BÖLÜM 3: KORKU — Virüsü Göster (%73) */}
      <div className="fear-sec reveal">
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

      {/* BÖLÜM 4: FİYATLANDIRMA */}
      <div className="pricing-sec reveal" id="cozum">
        <div className="pricing-inner">
          <div className="pricing-header">
            <span className="sec-tag">Fiyatlandırma</span>
            <h2 className="sec-h2">İhtiyacınıza göre<br/><span className="muted">doğru planı seçin.</span></h2>
            <p className="sec-desc">Her iki planda da 5 AI platformu dahil. Kredi kartı gerekmez.</p>
          </div>

          {/* Aylık / Yıllık Toggle */}
          <div className="pricing-toggle-wrap">
            <div className="pricing-toggle">
              <button className={`pricing-toggle-btn${!isYearly ? " active" : ""}`} onClick={() => setIsYearly(false)}>Aylık</button>
              <button className={`pricing-toggle-btn${isYearly ? " active" : ""}`} onClick={() => setIsYearly(true)}>
                Yıllık
              </button>
            </div>
            {!isYearly && <span className="pricing-toggle-badge">Yıllıkta ~₺4.500 tasarruf</span>}
            {isYearly && <span className="pricing-toggle-badge pricing-toggle-badge-active">₺4.500 tasarruf edildi!</span>}
          </div>

          <div className="pricing-grid" id="pricing">
            {/* Free */}
            <div className="pricing-card">
              <div className="pricing-card-head">
                <div className="pricing-plan-name">Free</div>
                <p className="pricing-plan-desc">Markanızı keşfedin</p>
                <div className="pricing-price-row">
                  <span className="pricing-price">₺0</span>
                  <span className="pricing-period">/sonsuza kadar</span>
                </div>
              </div>

              <a href="#test" className="pricing-cta pricing-cta-outline">Ücretsiz Başla</a>
              <p className="pricing-cta-note">Kayıt gerekmez · 60 saniye</p>

              <div className="pricing-divider" />

              <ul className="pricing-features">
                {[
                  { text: "5 AI platformu", bold: "5" },
                  { text: "1 kez tarama (tek seferlik)", bold: "1 kez" },
                  { text: "10 sorgu limiti", bold: "10" },
                  { text: "1 il · 1 proje", bold: "1" },
                  { text: "Temel GEO skoru" },
                  { text: "Rakip karşılaştırma" },
                  { text: "Sonuç raporu + Pro önerisi" },
                ].map((f, i) => (
                  <li key={i}><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>{f.bold ? <><strong>{f.bold}</strong> {f.text.replace(f.bold, "").trim()}</> : f.text}</span></li>
                ))}
              </ul>

              <div className="pricing-platforms-row">
                <span className="pricing-platforms-label">Dahil:</span>
                <div className="pricing-platforms-icons">
                  {(["chatgpt", "gemini", "perplexity", "claude", "google_aio"] as AIPlatform[]).map((p) => (
                    <AIPlatformIcon key={p} platform={p} size={18} colored />
                  ))}
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-card-pro">
              <div className="pricing-badge-wrap">
                <span className="pricing-badge">En Popüler</span>
              </div>
              <div className="pricing-card-head">
                <div className="pricing-plan-name">Pro</div>
                <p className="pricing-plan-desc">Tam izleme + rekabet yönetimi</p>
                <div className="pricing-price-row">
                  <span className="pricing-price">₺699</span>
                  <span className="pricing-period">/ay</span>
                </div>
                <p className="pricing-annual">
                  Yıllık tek ödeme: <strong>₺8.388</strong>
                  <span className="pricing-save"> (aylık ₺699)</span>
                </p>
              </div>

              <a href="/login" className="pricing-cta pricing-cta-filled">{isYearly ? "Yıllık Planla Başla" : "7 Gün Ücretsiz Dene"}</a>
              <p className="pricing-cta-note">{isYearly ? "Yıllık ödemede 2 ay hediye" : "7 gün boyunca ücret yok"}</p>

              <div className="pricing-divider" />

              <p className="pricing-includes">Free&apos;deki her şey, artı:</p>
              <ul className="pricing-features">
                {[
                  { text: "3 proje (firma + kişi + ürün)", bold: "3 proje" },
                  { text: "20 sorgu · 5 il takibi", bold: "20 sorgu" },
                  { text: "Haftada 3 varyasyonlu sorgu (Pzt/Çar/Cum)", bold: "Haftada 3" },
                  { text: "Haftada 1 aksiyon listesi", bold: "Haftada 1" },
                  { text: "Ayda 1 detaylı rapor (PDF)", bold: "Ayda 1" },
                  { text: "Tam şeffaf sorgu görünürlüğü", bold: "Tam şeffaf" },
                  { text: "Rakip istihbaratı + audit", bold: "Rakip istihbaratı" },
                  { text: "AI içerik taslakları", bold: "AI içerik" },
                  { text: "Korelasyon motoru (aksiyon→sonuç)" },
                  { text: "E-posta + WhatsApp bildirimleri" },
                ].map((f, i) => (
                  <li key={i}><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>{f.bold ? <><strong>{f.bold}</strong> {f.text.replace(f.bold, "").trim()}</> : f.text}</span></li>
                ))}
              </ul>

              <div className="pricing-platforms-row">
                <span className="pricing-platforms-label">Dahil:</span>
                <div className="pricing-platforms-icons">
                  {(["chatgpt", "gemini", "perplexity", "claude", "google_aio"] as AIPlatform[]).map((p) => (
                    <AIPlatformIcon key={p} platform={p} size={18} colored />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="pricing-trust">
            <div className="pricing-trust-item">
              <svg className="pricing-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
              <div>
                <strong>Güvenli Altyapı</strong>
                <span>256-bit SSL · KVKK uyumlu</span>
              </div>
            </div>
            <div className="pricing-trust-item">
              <svg className="pricing-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>
              <div>
                <strong>Destek</strong>
                <span>E-posta + WhatsApp desteği</span>
              </div>
            </div>
            <div className="pricing-trust-item">
              <svg className="pricing-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
              <div>
                <strong>14 Gün İade</strong>
                <span>Memnun kalmazsanız iade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BÖLÜM 5: ISITMAX CASE STUDY */}
      <div className="case-sec reveal">
        <div className="case-inner">
          <div className="case-header" style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="sec-tag">İlk Müşteri &amp; Referans</span>
            <h2 className="sec-h2">GH7 kullananlar.<br/><span className="muted">İlk biz denedik, şimdi sıra sizde.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {/* Kart 1: ISITMAX */}
            <div style={{ border: "1px solid #e5e5e5", borderRadius: 16, padding: 24, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#92400e" }}>IS</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#09090b" }}>ISITMAX</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>isitmax.com · Isıtma Sistemleri</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.6, marginBottom: 16 }}>
                GH7&apos;nin ilk müşterisi. 3 haftada GEO skoru 71&apos;den 74&apos;e çıktı. &quot;Çatı kar eritme&quot; sorgusunda %14&apos;ten %24&apos;e yükseldi.
              </p>
              <div style={{ display: "flex", gap: 16, paddingTop: 16, borderTop: "1px solid #f4f4f5" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#09090b" }}>74</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa" }}>GEO Skoru</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#09090b" }}>%26</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa" }}>Ses Payı</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>↑3</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa" }}>Haftalık</div>
                </div>
              </div>
            </div>

            {/* Kart 2: Yakında */}
            <div style={{ border: "1px dashed #e5e5e5", borderRadius: 16, padding: 24, background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 200 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#52525b", marginBottom: 4 }}>Yakında</div>
              <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>
                2. müşteri case study&apos;si için yer ayrıldı. Siz olabilir misiniz?
              </p>
            </div>

            {/* Kart 3: Yakında */}
            <div style={{ border: "1px dashed #e5e5e5", borderRadius: 16, padding: 24, background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 200 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#52525b", marginBottom: 4 }}>Yakında</div>
              <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>
                3. müşteri case study&apos;si için yer ayrıldı. Erken kullanıcı avantajını kaçırmayın.
              </p>
            </div>
          </div>
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
          <details className="faq"><summary className="faq-q">Free ile Pro arasındaki fark nedir? <span className="faq-plus">+</span></summary><p className="faq-a">Free ile 1 marka, 10 sorgu ve 1 ilde temel izleme yaparsınız. Pro&apos;da 3 proje, 20 sorgu, 5 il, rakip istihbaratı, içerik taslakları ve haftalık aksiyon listesi dahil — tüm gelişmiş özellikler açılır.</p></details>
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
              <div className="fcol"><h4>Ürün</h4><ul><li><Link href="/analiz">Ücretsiz Analiz</Link></li><li><a href="#pricing">Pro Üyelik</a></li><li><Link href="/panel/hizmetler">Hizmet Paketleri</Link></li></ul></div>
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
