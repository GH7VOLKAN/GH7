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

      {/* BÖLÜM 4: FİYATLANDIRMA */}
      <div className="pricing-sec reveal" id="cozum">
        <div className="pricing-inner">
          <div className="pricing-header">
            <span className="sec-tag">Fiyatlandırma</span>
            <h2 className="sec-h2">İhtiyacınıza göre<br/><span className="muted">doğru planı seçin.</span></h2>
            <p className="sec-desc">Her iki planda da tüm AI platformları dahil. Kredi kartı gerekmez.</p>
          </div>

          <div className="pricing-grid" id="pricing">
            {/* Free */}
            <div className="pricing-card">
              <div className="pricing-card-head">
                <div className="pricing-plan-name">Free</div>
                <p className="pricing-plan-desc">Başlangıç için ideal</p>
                <div className="pricing-price-row">
                  <span className="pricing-price">₺0</span>
                  <span className="pricing-period">/ay · Sonsuza kadar</span>
                </div>
              </div>

              <a href="#test" className="pricing-cta pricing-cta-outline">Ücretsiz Başla</a>
              <p className="pricing-cta-note">Kayıt gerekmez · 60 saniye</p>

              <div className="pricing-divider" />

              <ul className="pricing-features">
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>1</strong> marka takibi</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>10</strong> arama sorgusu</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>5</strong> AI platformu izleme</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>1</strong> il takibi</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Haftalık otomatik tarama</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Temel GEO skoru</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Rakip karşılaştırma</span></li>
                <li><svg className="pricing-check" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>E-posta bildirimleri</span></li>
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
                <p className="pricing-plan-desc">Büyüyen markalar için</p>
                <div className="pricing-price-row">
                  <span className="pricing-price">₺2.450</span>
                  <span className="pricing-period">/ay</span>
                </div>
                <p className="pricing-annual">₺24.900/yıl <span className="pricing-save">(2 ay hediye)</span></p>
              </div>

              <a href="/login" className="pricing-cta pricing-cta-filled">7 Gün Ücretsiz Dene</a>
              <p className="pricing-cta-note">7 gün boyunca ücret yok</p>

              <div className="pricing-divider" />

              <p className="pricing-includes">Free&apos;deki her şey, artı:</p>
              <ul className="pricing-features">
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>3 proje</strong> (firma + kişi + ürün)</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>20</strong> arama sorgusu</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>5 il</strong> takibi</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Günlük tarama + PDF rapor</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>Rakip istihbarat</strong> analizi</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>AI içerik taslakları</strong></span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span><strong>Haftalık aksiyon listesi</strong></span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Korelasyon motoru</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>E-posta + WhatsApp bildirimleri</span></li>
                <li><svg className="pricing-check pricing-check-pro" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg><span>Öncelikli destek</span></li>
              </ul>

              <div className="pricing-platforms-row">
                <span className="pricing-platforms-label">Dahil:</span>
                <div className="pricing-platforms-icons">
                  {(["chatgpt", "gemini", "perplexity", "claude", "google_aio", "copilot"] as AIPlatform[]).map((p) => (
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

      {/* BÖLÜM 5.5: TÜRKİYE HARİTASI */}
      <section className="map-sec reveal">
        <div className="map-inner">
          <h2 className="sec-h2">Her il ayrı bir pazar.<br/><span className="muted">Her ilde ayrı rakip.</span></h2>
          <p className="sec-desc" style={{ marginBottom: 32 }}>81 ilde yapay zeka görünürlüğünüzü takip edin.</p>
          <div className="map-grid">
            <div className="map-visual">
              {[
                { name: "İstanbul", score: 82, x: 28, y: 18, color: "#22C55E" },
                { name: "Ankara", score: 71, x: 42, y: 35, color: "#22C55E" },
                { name: "Balıkesir", score: 91, x: 18, y: 30, color: "#22C55E" },
                { name: "İzmir", score: 65, x: 12, y: 42, color: "#F59E0B" },
                { name: "Bursa", score: 58, x: 24, y: 26, color: "#F59E0B" },
                { name: "Antalya", score: 45, x: 30, y: 58, color: "#F59E0B" },
                { name: "Konya", score: 38, x: 42, y: 50, color: "#EF4444" },
                { name: "Trabzon", score: 22, x: 62, y: 18, color: "#EF4444" },
                { name: "Erzurum", score: 15, x: 70, y: 25, color: "#EF4444" },
                { name: "Diyarbakır", score: 12, x: 65, y: 40, color: "#EF4444" },
              ].map((city) => (
                <div
                  key={city.name}
                  className="map-pin"
                  style={{ left: `${city.x}%`, top: `${city.y}%` }}
                >
                  <span className="map-dot" style={{ background: city.color }} />
                  <span className="map-pin-label">{city.name} ({city.score})</span>
                </div>
              ))}
            </div>
            <div className="map-stats">
              <div className="map-stat"><span className="map-stat-dot" style={{ background: "#22C55E" }} /><span className="map-stat-num">3</span> güçlü il</div>
              <div className="map-stat"><span className="map-stat-dot" style={{ background: "#F59E0B" }} /><span className="map-stat-num">3</span> orta il</div>
              <div className="map-stat"><span className="map-stat-dot" style={{ background: "#EF4444" }} /><span className="map-stat-num">4</span> zayıf il</div>
              <div className="map-stat"><span className="map-stat-dot" style={{ background: "#E5E7EB" }} /><span className="map-stat-num">71</span> takip dışı</div>
              <a href="#test" className="map-cta">Kendi illerinizi analiz edin →</a>
            </div>
          </div>
        </div>
      </section>


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
              <div className="fcol"><h4>Çözümler</h4><ul><li><a href="#">Tespit Et</a></li><li><a href="#">Takip Et</a></li><li><a href="#">Çözüm Üret</a></li><li><a href="#">Uygulat</a></li></ul></div>
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
