export default function HeroSection() {
  return (
    <section className="hero">
      <span className="hero-tag">AI Visibility Platform</span>
      <h1 className="hero-h1">
        Yapay zeka seni<br />
        <em>taniyormu?</em>
      </h1>
      <div className="hero-body">
        <p>
          Musteri artik Google&apos;a yazmiyor. ChatGPT&apos;ye, Claude&apos;a,
          Gemini&apos;ye soruyor. Cevap seni iceriyorsa &mdash; satisin var.
          Icermiyorsa &mdash; <strong>yoksun.</strong>
        </p>
        <p className="hero-ama">Ama...</p>
        <ul className="hero-list">
          <li>ChatGPT seni onerir mi &mdash; bilmiyorsun.</li>
          <li>Rakibin orada mi &mdash; bilmiyorsun.</li>
          <li>Hangi prompt&apos;ta ciktigin &mdash; bilmiyorsun.</li>
          <li>Hangi ulkede gorundugun &mdash; bilmiyorsun.</li>
          <li>Haftadan haftaya degisimi &mdash; bilmiyorsun.</li>
          <li>Rakibinin yukselisini &mdash; bilmiyorsun.</li>
          <li>Hangi platformda guclu oldugun &mdash; bilmiyorsun.</li>
          <li>Prompt bazinda siralamani &mdash; bilmiyorsun.</li>
          <li>Musterinin seni nasil buldugunu &mdash; bilmiyorsun.</li>
        </ul>
        <p className="hero-kicker">
          <strong>GH7.ai butun bunlari gosteriyor.</strong><br />
          Tek panel. Gercek veri. Her hafta guncellenen AI gorunurluk haritasi.
        </p>
        <div className="hero-buttons">
          <a href="#test" className="btn-black">Ucretsiz Test Et &rarr;</a>
          <a href="#cozum" className="btn-ghost">Paketleri Gor</a>
        </div>
      </div>
    </section>
  );
}
