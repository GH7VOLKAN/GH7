"use client";

import { useState } from "react";

export default function GenelBakisPage() {
  // Gerçek tier burada DB'den gelecek — şimdilik demo
  const [tier] = useState<"takip" | "cozum" | "uygulat">("cozum");
  const [doneItems, setDoneItems] = useState<Set<number>>(new Set());
  const [copiedItem, setCopiedItem] = useState<number | null>(null);

  const toggleDone = (idx: number) => {
    setDoneItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCopy = (idx: number) => {
    setCopiedItem(idx);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const totalActions = 3;
  const doneCount = doneItems.size;

  return (
    <>
      {/* ═══ HERO ZONE ═══ */}
      <div className="hero-zone">
        {/* TAKIP HERO */}
        {tier === "takip" && (
          <div className="takip-hero">
            <span className="th-week">Bu Hafta · 24-30 Mart 2026</span>
            <div className="th-split">
              <div className="th-cell">
                <span className="th-cell-label good">İyi haber</span>
                <span className="th-cell-num">12</span>
                <div className="th-cell-desc">sorguda görünüyorsunuz. Geçen haftaya göre <strong>+2 sorgu</strong>.</div>
              </div>
              <div className="th-cell">
                <span className="th-cell-label bad">Kötü haber</span>
                <span className="th-cell-num">3</span>
                <div className="th-cell-desc">sorguda rakibiniz <strong>sizi geçti</strong>. Geçen hafta öndeydıniz.</div>
              </div>
            </div>
            <div className="th-actions">
              <button className="btn-primary">Hangi sorgular? →</button>
              <button className="btn-secondary">Geçen haftayla karşılaştır</button>
            </div>
          </div>
        )}

        {/* ÇÖZÜM HERO */}
        {tier === "cozum" && (
          <div className="cozum-hero">
            <div className="ch-header">
              <div className="ch-title">Bu hafta 3 şey hazır.<br/>Kopyala, yapıştır, bitti.</div>
              <div className="ch-sub">GH7 analiz etti, çözüm üretti. Sizin yapmanız gereken tek şey uygulamak.</div>
            </div>
            <div className="ch-items">
              {[
                { title: "Havuz ekipmanları fiyatları — içerik", desc: "ChatGPT bu sorguda sizi bulamıyor. Hazır içerik paragrafını sayfanıza ekleyin." },
                { title: "Ürün sayfaları — schema kodu", desc: "Gemini ve AI Overview için schema markup. Ana sayfanızın <head> bölümüne yapıştırın." },
                { title: "Rakip karşılaştırma — başlık ve FAQ", desc: "Perplexity'de rakibiniz öne çıkıyor. Bu başlık ve 3 soru ile farkı kapatabilirsiniz." },
              ].map((item, idx) => (
                <div className="ch-item" key={idx}>
                  <span className="ch-item-num">{String(idx + 1).padStart(2, "0")}</span>
                  <div className="ch-item-text">
                    <div className="ch-item-title">{item.title}</div>
                    <div className="ch-item-desc">{item.desc}</div>
                  </div>
                  <button
                    className={`btn-copy${copiedItem === idx ? " copied" : ""}`}
                    onClick={() => handleCopy(idx)}
                  >
                    {copiedItem === idx ? "Kopyalandı" : "Kopyala"}
                  </button>
                  <div
                    className={`ch-item-done${doneItems.has(idx) ? " checked" : ""}`}
                    onClick={() => toggleDone(idx)}
                  />
                </div>
              ))}
            </div>
            <div className="ch-progress">
              <div className="ch-progress-bar-wrap">
                <div className="ch-progress-bar" style={{ width: `${(doneCount / totalActions) * 100}%` }} />
              </div>
              <span className="ch-progress-text">{doneCount} / {totalActions} tamamlandı</span>
            </div>
          </div>
        )}

        {/* UYGULAT HERO */}
        {tier === "uygulat" && (
          <div className="uygulat-hero">
            <div className="uh-header">
              <span className="uh-month">Mart 2026</span>
              <div className="uh-title">Ajans bu ay 4 şeyi uyguladı.<br/>Sonuçlar gelmeye başladı.</div>
              <div className="uh-sub">Siz onayladınız, biz yaptık. İşte bu ayki değişim.</div>
            </div>
            <div className="uh-score-row">
              <div>
                <div className="uh-score-arrow">
                  <span className="from">61</span>
                  <span className="arr">→</span>
                  <span className="to">74</span>
                </div>
                <div className="uh-score-label">GEO Skoru · <strong>+13 puan</strong> bu ay</div>
              </div>
              <div className="uh-score-details">
                <div className="uh-detail-row"><span className="uh-detail-label">Ses Payı</span><span className="uh-detail-val pos">%24 → %26 ↑</span></div>
                <div className="uh-detail-row"><span className="uh-detail-label">Görünür Sorgu</span><span className="uh-detail-val pos">9 → 12 ↑</span></div>
                <div className="uh-detail-row"><span className="uh-detail-label">Rakip önde</span><span className="uh-detail-val pos">5 → 3 ↓</span></div>
                <div className="uh-detail-row"><span className="uh-detail-label">Ort. Pozisyon</span><span className="uh-detail-val pos">2.1 → 1.4 ↑</span></div>
              </div>
            </div>
            <div className="uh-done-list">
              <div className="uh-done">
                <div className="uh-done-title">Schema markup eklendi</div>
                <div className="uh-done-desc">12 ürün sayfasına yapılandırılmış veri eklendi.</div>
                <span className="uh-done-status">Uygulandı · 3 Mart</span>
              </div>
              <div className="uh-done">
                <div className="uh-done-title">FAQ içerikleri yazıldı</div>
                <div className="uh-done-desc">8 sorguda AI&apos;ın aradığı içerik oluşturuldu ve yayınlandı.</div>
                <span className="uh-done-status">Uygulandı · 8 Mart</span>
              </div>
              <div className="uh-done">
                <div className="uh-done-title">Başlık ve meta güncelleme</div>
                <div className="uh-done-desc">Ana sayfa ve 5 kategori sayfasında AI uyumlu başlıklar.</div>
                <span className="uh-done-status">Uygulandı · 15 Mart</span>
              </div>
              <div className="uh-done">
                <div className="uh-done-title">Rakip boşluğu içerikleri</div>
                <div className="uh-done-desc">Rakibin öne çıktığı 3 sorguda yeni içerik üretildi.</div>
                <span className="uh-done-status">Uygulandı · 22 Mart</span>
              </div>
            </div>
            <div className="th-actions">
              <button className="btn-primary">Nisan planını gör →</button>
              <button className="btn-secondary">Detaylı rapor</button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ DIVIDER ═══ */}
      <div style={{ padding: "32px 40px 0" }}>
        <div style={{ borderTop: "1px solid var(--g200)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <span style={{ position: "absolute", background: "var(--g50)", padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "var(--g400)", textTransform: "uppercase" as const, letterSpacing: ".8px", border: "1px solid var(--g200)", borderRadius: 20 }}>
            Detaylar
          </span>
        </div>
      </div>

      {/* ═══ DETAIL ZONE ═══ */}
      <div className="detail-zone">
        {/* Metrikler */}
        <div className="detail-grid-3" style={{ marginBottom: 2 }}>
          <div className="dc">
            <span className="dc-label">Ses Payı</span>
            <div className="mini-metric">
              <span className="mm-num">%26</span>
              <span className="mm-delta pos">↑ %2</span>
            </div>
            <span className="mm-label">Tüm AI önerilerinde payınız</span>
          </div>
          <div className="dc">
            <span className="dc-label">Kapsam</span>
            <div className="mini-metric">
              <span className="mm-num">%80</span>
              <span className="mm-delta pos">↑ %5</span>
            </div>
            <span className="mm-label">Takip edilen sorgularda görünme oranı</span>
          </div>
          <div className="dc">
            <span className="dc-label">Ortalama Pozisyon</span>
            <div className="mini-metric">
              <span className="mm-num">1.4</span>
              <span className="mm-delta pos">↑ 0.3</span>
            </div>
            <span className="mm-label">AI&apos;ın sizi önerme sırası (düşük = iyi)</span>
          </div>
        </div>

        {/* Sorgu Dağılımı + Platform */}
        <div className="detail-grid" style={{ marginBottom: 2 }}>
          <div className="dc">
            <span className="dc-label">Sorgu Bazlı Görünürlük</span>
            <div className="bar-list">
              <div className="bar-row"><span className="bar-lbl">Havuz ekipmanı fiyat</span><div className="bar-track"><div className="bar-fill" style={{ width: "36%" }} /></div><span className="bar-val">%36</span></div>
              <div className="bar-row"><span className="bar-lbl">Havuz pompası seçimi</span><div className="bar-track"><div className="bar-fill" style={{ width: "29%" }} /></div><span className="bar-val">%29</span></div>
              <div className="bar-row"><span className="bar-lbl">Isıtma sistemi karş.</span><div className="bar-track"><div className="bar-fill" style={{ width: "24%" }} /></div><span className="bar-val">%24</span></div>
              <div className="bar-row"><span className="bar-lbl">Yüzme havuzu bakım</span><div className="bar-track"><div className="bar-fill" style={{ width: "18%" }} /></div><span className="bar-val">%18</span></div>
              <div className="bar-row"><span className="bar-lbl">Klor dozaj sistemi</span><div className="bar-track"><div className="bar-fill weak" style={{ width: "11%" }} /></div><span className="bar-val weak">%11 ↓</span></div>
            </div>
          </div>
          <div className="dc">
            <span className="dc-label">Platform Dağılımı</span>
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Skor</th>
                  <th>Değişim</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>ChatGPT</td><td>74</td><td style={{ color: "var(--green)" }}>+8</td><td><span className="score-pill sp-green">Güçlü</span></td></tr>
                <tr><td>Perplexity</td><td>83</td><td style={{ color: "var(--green)" }}>+12</td><td><span className="score-pill sp-green">Güçlü</span></td></tr>
                <tr><td>Gemini</td><td>58</td><td style={{ color: "var(--green)" }}>+3</td><td><span className="score-pill sp-amber">Orta</span></td></tr>
                <tr><td>AI Overview</td><td>61</td><td style={{ color: "var(--green)" }}>+5</td><td><span className="score-pill sp-amber">Orta</span></td></tr>
                <tr><td>Claude</td><td>49</td><td style={{ color: "var(--red)" }}>-3</td><td><span className="score-pill sp-red">Zayıf</span></td></tr>
                <tr><td>Copilot</td><td>41</td><td style={{ color: "var(--red)" }}>-1</td><td><span className="score-pill sp-red">Zayıf</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rakip Ses Payı + Aksiyonlar */}
        <div className="detail-grid" style={{ marginBottom: 0 }}>
          <div className="dc">
            <span className="dc-label">Rakip Ses Payı Dağılımı</span>
            <div className="comp-list">
              <div className="comp-item">
                <span className="comp-name me">Aqua Store</span>
                <div className="comp-bar-wrap"><div className="comp-bar" style={{ width: "26%" }} /></div>
                <span className="comp-pct">%26</span>
              </div>
              <div className="comp-item">
                <span className="comp-name">Havuz Dünyası</span>
                <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "19%" }} /></div>
                <span className="comp-pct">%19</span>
              </div>
              <div className="comp-item">
                <span className="comp-name">Piscimar TR</span>
                <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "14%" }} /></div>
                <span className="comp-pct">%14</span>
              </div>
              <div className="comp-item">
                <span className="comp-name">AquaTech</span>
                <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "9%" }} /></div>
                <span className="comp-pct">%9</span>
              </div>
              <div className="comp-item">
                <span className="comp-name" style={{ color: "var(--g400)" }}>Diğer</span>
                <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "32%", background: "var(--g100)" }} /></div>
                <span className="comp-pct" style={{ color: "var(--g400)" }}>%32</span>
              </div>
            </div>
          </div>
          <div className="dc">
            <span className="dc-label">Bu Haftanın Aksiyon Listesi</span>
            <div className="action-list">
              <div className="action-item">
                <span className="action-priority ap-high">Yüksek</span>
                <div>
                  <div className="action-text">Klor dozaj sayfasına FAQ ekle</div>
                  <div className="action-sub">Perplexity&apos;de rakip bu sorguda sizi geçiyor. Hazır içerik panelde.</div>
                </div>
              </div>
              <div className="action-item">
                <span className="action-priority ap-high">Yüksek</span>
                <div>
                  <div className="action-text">Claude için schema markup güncelle</div>
                  <div className="action-sub">Claude sizi tanımıyor. Hazır kod kopyalanmaya hazır.</div>
                </div>
              </div>
              <div className="action-item">
                <span className="action-priority ap-mid">Orta</span>
                <div>
                  <div className="action-text">Havuz ısıtma karşılaştırma içeriği</div>
                  <div className="action-sub">Gemini&apos;de görünürlük %24&apos;te. İçerik taslağı hazır.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
