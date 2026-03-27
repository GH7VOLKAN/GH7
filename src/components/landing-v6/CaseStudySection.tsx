export default function CaseStudySection() {
  return (
    <section className="case-sec reveal">
      <span className="case-tag">Vaka Calismasi</span>
      <h2 className="case-title">12 haftada AI gorunurlugu %340 artti.</h2>
      <p className="case-sub">Orta olcekli bir e-ticaret markasi, GH7.ai ile ne basardi?</p>

      <div className="case-body">
        <div className="case-story">
          <div className="case-step">
            <span className="case-num">01</span>
            <div>
              <h4>Baslangic Analizi</h4>
              <p>Marka 5 AI platformunun hicbirinde onerilmiyordu. Gorunurluk skoru: 8/100.</p>
            </div>
          </div>
          <div className="case-step">
            <span className="case-num">02</span>
            <div>
              <h4>Prompt Haritalama</h4>
              <p>Sektordeki 120 prompt analiz edildi. Rakiplerin hangi promptlarda guclu oldugu belirlendi.</p>
            </div>
          </div>
          <div className="case-step">
            <span className="case-num">03</span>
            <div>
              <h4>Icerik Optimizasyonu</h4>
              <p>AI platformlarinin kaynak aldigi sayfalar optimize edildi. Yapisal veri islemeleri eklendi.</p>
            </div>
          </div>
          <div className="case-step">
            <span className="case-num">04</span>
            <div>
              <h4>Haftalik Takip</h4>
              <p>Her hafta skorlar olculdu, strateji guncellendi. 12. haftada skor: 35/100.</p>
            </div>
          </div>
        </div>

        <div className="case-metrics">
          <h4 className="cm-title">12 Hafta Sonuclari</h4>
          <div className="ck-row">
            <span className="ck-label">ChatGPT</span>
            <div className="ck-bar"><div className="ck-fill strong" style={{ width: "25%" }}></div></div>
            <span className="ck-val">Top 3</span>
          </div>
          <div className="ck-row">
            <span className="ck-label">Perplexity</span>
            <div className="ck-bar"><div className="ck-fill strong" style={{ width: "36%" }}></div></div>
            <span className="ck-val">Top 2</span>
          </div>
          <div className="ck-row">
            <span className="ck-label">Gemini</span>
            <div className="ck-bar"><div className="ck-fill moderate" style={{ width: "24%" }}></div></div>
            <span className="ck-val">Top 5</span>
          </div>
          <div className="ck-row">
            <span className="ck-label">Claude</span>
            <div className="ck-bar"><div className="ck-fill weak" style={{ width: "14%" }}></div></div>
            <span className="ck-val">Top 8</span>
          </div>
          <div className="cm-summary">
            <div className="cm-item">
              <span className="cm-big">%340</span>
              <span className="cm-small">Gorunurluk Artisi</span>
            </div>
            <div className="cm-item">
              <span className="cm-big">8 &rarr; 35</span>
              <span className="cm-small">Skor Degisimi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
