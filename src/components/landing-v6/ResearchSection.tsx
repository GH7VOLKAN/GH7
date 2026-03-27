export default function ResearchSection() {
  return (
    <section className="research-sec reveal">
      <span className="research-tag">Arastirma Verileri</span>
      <h2 className="research-title">Rakamlar net konusuyor.</h2>
      <div className="research-grid">
        <div className="rc">
          <span className="rc-pct">%25</span>
          <p className="rc-text">Google aramalarinin ceyregi AI&apos;ya kaydi. Organik trafik azaliyor.</p>
          <span className="rc-src">Gartner, 2025</span>
        </div>
        <div className="rc">
          <span className="rc-pct">%40</span>
          <p className="rc-text">AI cevaplarinda cikmayan markalar musterilerin yarisina yakinini kaybediyor.</p>
          <span className="rc-src">Bain &amp; Co, 2024</span>
        </div>
        <div className="rc">
          <span className="rc-pct">%60</span>
          <p className="rc-text">Z kusagi urun aramasina arama motoru yerine AI ile basliyor.</p>
          <span className="rc-src">Adobe Digital, 2025</span>
        </div>
      </div>
    </section>
  );
}
