export default function CozumSection() {
  return (
    <section className="cozum-sec reveal" id="cozum">
      <span className="cozum-tag">Cozumler</span>
      <h2 className="cozum-title">Net plan, net fiyat.</h2>
      <p className="cozum-sub">Her paket, olculebilir sonuc icin tasarlandi.</p>

      <div className="cozum-steps" id="pricing">
        {/* Tier 0 */}
        <div className="cs">
          <span className="cs-badge free">Ucretsiz</span>
          <h3 className="cs-name">Kesfet</h3>
          <p className="cs-price">&pound;0 <span>/ tek seferlik</span></p>
          <p className="cs-desc">AI seni taniyor mu? 60 saniyede ogren.</p>
          <ul className="cs-list">
            <li>1 marka veya kisi analizi</li>
            <li>5 AI platformunda tarama</li>
            <li>Temel gorunurluk skoru</li>
            <li>PDF rapor</li>
          </ul>
          <a href="#test" className="btn-ghost cs-btn">Ucretsiz Basla &rarr;</a>
        </div>

        {/* Tier 1 */}
        <div className="cs">
          <span className="cs-badge">Baslangic</span>
          <h3 className="cs-name">Takip Et</h3>
          <p className="cs-price">&pound;2.450 <span>/ ay</span></p>
          <p className="cs-desc">Haftalik AI gorunurluk takibi baslasin.</p>
          <ul className="cs-list">
            <li>1 marka &middot; 20 prompt takibi</li>
            <li>5 platform &middot; haftalik tarama</li>
            <li>Rakip karsilastirma (2 rakip)</li>
            <li>Dashboard + haftalik e-posta</li>
          </ul>
          <a href="#test" className="btn-black cs-btn">14 Gun Dene &rarr;</a>
        </div>

        {/* Tier 2 — En Populer */}
        <div className="cs popular">
          <span className="cs-badge pop">En Populer</span>
          <h3 className="cs-name">Buyut</h3>
          <p className="cs-price">&pound;4.450 <span>/ ay</span></p>
          <p className="cs-desc">Tam olcekli GEO stratejisi ve icerik plani.</p>
          <ul className="cs-list">
            <li>3 marka &middot; 60 prompt takibi</li>
            <li>5 platform &middot; 3 ulke &middot; haftalik</li>
            <li>5 rakip karsilastirma</li>
            <li>Icerik onerileri + aksiyon plani</li>
            <li>Oncelikli destek</li>
          </ul>
          <a href="#test" className="btn-black cs-btn">14 Gun Dene &rarr;</a>
        </div>

        {/* Tier 3 */}
        <div className="cs">
          <span className="cs-badge ent">Kurumsal</span>
          <h3 className="cs-name">Domine Et</h3>
          <p className="cs-price">&pound;9.450 <span>/ ay</span></p>
          <p className="cs-desc">Tum pazari kontrol et, her promptta 1 numara ol.</p>
          <ul className="cs-list">
            <li>10 marka &middot; 200 prompt</li>
            <li>5 platform &middot; 10 ulke &middot; gunluk</li>
            <li>Sinirsiz rakip</li>
            <li>API erisimi + webhook</li>
            <li>Dedicated account manager</li>
          </ul>
          <a href="#test" className="btn-black cs-btn">Gorusme Planla &rarr;</a>
        </div>
      </div>
    </section>
  );
}
