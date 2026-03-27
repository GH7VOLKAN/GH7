export default function FearSection() {
  return (
    <section className="fear-sec reveal">
      <div className="fear-stat">
        <span className="fear-pct">%73</span>
        <span className="fear-label">
          tuketici, bir urun veya hizmet hakkinda ilk bilgiyi artik yapay zekadan aliyor.
        </span>
      </div>
      <div className="fear-findings">
        <div className="ff">
          <span className="ff-num">01</span>
          <p>Google aramalarin <strong>%25&apos;i</strong> artik AI&apos;ya kayiyor. Organik trafik dusuyor.</p>
        </div>
        <div className="ff">
          <span className="ff-num">02</span>
          <p>AI cevaplarinda cikmayan markalar, <strong>potansiyel musterilerin %40&apos;ini</strong> kaybediyor.</p>
        </div>
        <div className="ff">
          <span className="ff-num">03</span>
          <p>Rakiplerin AI gorunurlugunu olcemezsen, <strong>strateji kuramazsin.</strong></p>
        </div>
      </div>
    </section>
  );
}
