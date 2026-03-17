import { useState, useEffect, useRef } from "react";

// ── AI Platform SVG Logos ──
const AILogos = {
  chatgpt: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#10a37f" />
      <path d="M12 5.5c-1.5 0-2.8.7-3.6 1.8-.3-.1-.6-.1-.9-.1-2 0-3.5 1.6-3.5 3.5 0 .5.1 1 .3 1.4C3.5 12.8 3 13.8 3 15c0 2 1.6 3.5 3.5 3.5.3 0 .6 0 .9-.1.8 1.1 2.1 1.8 3.6 1.8s2.8-.7 3.6-1.8c.3.1.6.1.9.1 2 0 3.5-1.6 3.5-3.5 0-1.2-.5-2.2-1.3-2.9.2-.4.3-.9.3-1.4 0-2-1.6-3.5-3.5-3.5-.3 0-.6 0-.9.1C14.8 6.2 13.5 5.5 12 5.5z" fill="white" opacity="0.9"/>
    </svg>
  ),
  claude: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#d97706" />
      <path d="M8 8.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5v7c0 .8-.7 1.5-1.5 1.5h-5c-.8 0-1.5-.7-1.5-1.5v-7z" fill="white" opacity="0.9"/>
      <circle cx="11" cy="11" r="1" fill="#d97706"/>
      <circle cx="14" cy="11" r="1" fill="#d97706"/>
    </svg>
  ),
  gemini: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#4285f4" />
      <path d="M12 6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" fill="white" opacity="0.3"/>
      <path d="M12 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" fill="white" opacity="0.6"/>
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.9"/>
    </svg>
  ),
  perplexity: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#14b8a6" />
      <path d="M12 6l5 3v6l-5 3-5-3V9l5-3z" fill="white" opacity="0.9"/>
      <circle cx="12" cy="12" r="2" fill="#14b8a6"/>
    </svg>
  ),
};

// ── Animated Counter ──
const AnimatedNumber = ({ target, duration = 1200 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(timer); }
          else setVal(Math.round(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}</span>;
};

// ── Fade-in on scroll ──
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const translate = direction === "up" ? "translateY(30px)" : direction === "left" ? "translateX(-30px)" : "translateX(30px)";
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : translate,
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// ── Stagger children ──
const Stagger = ({ children, baseDelay = 0, stagger = 0.08 }) => (
  <>
    {Array.isArray(children)
      ? children.map((child, i) => (
          <FadeIn key={i} delay={baseDelay + i * stagger}>{child}</FadeIn>
        ))
      : children}
  </>
);

// ── Progress Bar animated ──
const AnimBar = ({ pct, color = "#111", delay = 0 }) => {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setW(pct), delay * 1000 + 100);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ height: 8, borderRadius: 4, background: "#f0f0f0", overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
};

const GH7Dashboard = () => {
  const [activeTab, setActiveTab] = useState("genel");
  const [expandedCard, setExpandedCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: "genel", label: "Genel Bakış" },
    { id: "sorular", label: "Sorular" },
    { id: "rakipler", label: "Rakipler" },
    { id: "kaynaklar", label: "Kaynaklar" },
    { id: "site", label: "Site Kontrolü" },
  ];

  const gelisimItems = [
    { status: "done", label: "Google'da görünüyor" },
    { status: "warn", label: "LinkedIn güncel değil" },
    { status: "miss", label: "Schema eksik" },
    { status: "done", label: "Google Business var" },
    { status: "done", label: "Dizinlerde var" },
    { status: "miss", label: "FAQ sayfası yok" },
    { status: "done", label: "AI botlar erişebiliyor" },
  ];

  const statusIcon = (s) =>
    s === "done" ? <span style={{ color: "#22c55e", fontSize: 13 }}>✓</span>
    : s === "warn" ? <span style={{ color: "#eab308", fontSize: 13 }}>⚠</span>
    : <span style={{ color: "#ef4444", fontSize: 13 }}>✗</span>;

  // ── GENEL BAKIŞ ──
  const GenelBakis = () => (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* HERO */}
      <FadeIn>
        <section style={{ padding: "72px 0 48px", textAlign: "center" }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb", marginBottom: 16, fontWeight: 500 }}>
            Yapay Zeka Durum Raporu
          </p>
          <h1 style={{ fontSize: 56, fontWeight: 800, margin: 0, lineHeight: 1.05, color: "#111", letterSpacing: -2 }}>
            4 yapay zekadan<br />
            <span style={{ background: "linear-gradient(135deg, #111 0%, #555 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <AnimatedNumber target={2} duration={800} />'si seni tanıyor
            </span>
          </h1>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            <div style={{ width: 180, height: 5, borderRadius: 3, background: "#eee", overflow: "hidden" }}>
              <div style={{ width: "50%", height: "100%", background: "#111", borderRadius: 3, transition: "width 1s ease 0.5s" }} />
            </div>
            <span style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>%50</span>
          </div>
        </section>
      </FadeIn>

      {/* PLATFORM KARTLARI */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 56 }}>
        <Stagger baseDelay={0.2} stagger={0.1}>
          {[
            { name: "ChatGPT", logo: "chatgpt", score: 3, total: 10, color: "#10a37f", active: true },
            { name: "Claude", logo: "claude", score: 0, total: 10, color: "#d97706", active: false },
            { name: "Gemini", logo: "gemini", score: 4, total: 10, color: "#4285f4", active: true },
            { name: "Perplexity", logo: "perplexity", score: 2, total: 10, color: "#14b8a6", active: true },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                background: "#fff",
                border: `1.5px solid ${p.active ? p.color + "30" : "#eee"}`,
                borderRadius: 20,
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${p.color}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                {AILogos[p.logo](36)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: p.active ? "#111" : "#bbb", marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: p.active ? "#111" : "#ddd", letterSpacing: -1 }}>
                {p.active ? <><AnimatedNumber target={p.score} duration={1000} />/{p.total}</> : "—"}
              </div>
              <div style={{ fontSize: 12, color: p.active ? "#888" : "#ccc", marginTop: 4 }}>
                {p.active ? "soruda öneriyor" : "henüz tanımıyor"}
              </div>
            </div>
          ))}
        </Stagger>
      </section>

      {/* SENİN YERİNE KİM */}
      <FadeIn delay={0.3}>
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: "#111", letterSpacing: -0.5 }}>
            Senin yerine kim öneriliyor?
          </h2>
          <p style={{ fontSize: 14, color: "#999", margin: "0 0 28px" }}>Yapay zekaların senin yerine önerdiği firmalar</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { name: "ABC Isıtma", score: 80, you: false },
              { name: "İdavilla (sen)", score: 50, you: true },
              { name: "XYZ Tesisat", score: 30, you: false },
              { name: "123 Kombi", score: 20, you: false },
              { name: "Ege Isıtma", score: 10, you: false },
            ].map((r, i) => (
              <div
                key={r.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 50px",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: r.you ? "#f8f8f8" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: r.you ? 700 : 400, color: r.you ? "#111" : "#555" }}>
                  {r.name}
                </span>
                <AnimBar pct={r.score} color={r.you ? "#111" : "#d4d4d4"} delay={0.3 + i * 0.1} />
                <span style={{ fontSize: 13, color: "#999", textAlign: "right", fontWeight: 500 }}>
                  %{r.score / 10}
                </span>
              </div>
            ))}
          </div>

          {/* BLUR ZONE */}
          <div style={{ position: "relative", marginTop: 4 }}>
            {[6, 7, 8, 9, 10].map((i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 50px", alignItems: "center", gap: 16, padding: "12px 16px", filter: "blur(7px)", userSelect: "none" }}>
                <span style={{ fontSize: 14, color: "#ccc" }}>Firma {i}</span>
                <div style={{ height: 8, borderRadius: 4, background: "#f0f0f0" }}><div style={{ width: `${60 - i * 5}%`, height: "100%", background: "#e5e5e5", borderRadius: 4 }} /></div>
                <span style={{ fontSize: 13, color: "#ddd" }}>%{6 - i + 4}</span>
              </div>
            ))}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button style={{ background: "#111", color: "#fff", padding: "12px 32px", borderRadius: 100, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = ""}
              >
                <span style={{ fontSize: 14 }}>🔒</span> Tüm rakipleri gör
              </button>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* BU HAFTA */}
      <FadeIn delay={0.4}>
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: "#111", letterSpacing: -0.5 }}>Bu hafta değişenler</h2>
          <p style={{ fontSize: 14, color: "#999", margin: "0 0 24px" }}>Son 7 günde yapay zekadaki değişimler</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Stagger baseDelay={0.5} stagger={0.08}>
              {[
                { icon: "↑", text: "Perplexity seni 2 kez önerdi", sub: "Geçen hafta: 0 kez", good: true },
                { icon: "●", text: "Yeni rakip: 123 Kombi", sub: "ChatGPT'de görünmeye başladı", good: false },
                { icon: "↑", text: "Google Business puanın arttı", sub: "4.2 → 4.4", good: true },
                { icon: "↓", text: "Claude seni tanımayı bıraktı", sub: "Geçen hafta 1/3, bu hafta 0/3", good: false },
              ].map((item, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "20px", display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: item.good ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: item.good ? "#22c55e" : "#ef4444", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{item.text}</div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </Stagger>
          </div>
        </section>
      </FadeIn>

      {/* AKSİYONLAR */}
      <FadeIn delay={0.5}>
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: "#111", letterSpacing: -0.5 }}>Şimdi ne yapmalısın?</h2>
          <p style={{ fontSize: 14, color: "#999", margin: "0 0 24px" }}>Kolay olanlar önce — hemen başlayabilirsin</p>

          {[
            { title: "Google Business yorumlarını artır", desc: "Rakibin ABC'nin 280 yorumu var, senin 23. Müşterilerinden yorum iste.", ease: 5, time: "30 dk", impact: "Yüksek" },
            { title: "FAQ sayfası oluştur", desc: "Yapay zeka sık sorulan sorular sayfası olan siteleri tercih ediyor. Rakibin ABC'nin FAQ'ı var.", ease: 4, time: "2 saat", impact: "Yüksek" },
          ].map((a, i) => (
            <div key={i} onClick={() => setExpandedCard(expandedCard === `a-${i}` ? null : `a-${i}`)}
              style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "22px 24px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ddd"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eee"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#ef4444" }}>✗</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{a.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 11, color: "#bbb" }}>{"●".repeat(a.ease)}{"○".repeat(5 - a.ease)}</span>
                  <span style={{ fontSize: 20, color: "#ccc", transition: "transform 0.2s", transform: expandedCard === `a-${i}` ? "rotate(45deg)" : "" }}>+</span>
                </div>
              </div>
              <div style={{ maxHeight: expandedCard === `a-${i}` ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                <div style={{ paddingTop: 16, borderTop: "1px solid #f0f0f0", marginTop: 16 }}>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                  <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                    <span style={{ fontSize: 12, color: "#999" }}>⏱ {a.time}</span>
                    <span style={{ fontSize: 12, color: "#999" }}>📈 {a.impact}</span>
                  </div>
                  <button style={{ marginTop: 16, background: "#111", color: "#fff", border: "none", borderRadius: 100, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ""}
                  >
                    Adım adım rehber →
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* BLUR */}
          <div style={{ position: "relative" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "22px 24px", marginBottom: 10, filter: "blur(7px)", userSelect: "none" }}>
                <div style={{ height: 16, background: "#f5f5f5", borderRadius: 4, width: "60%" }} />
              </div>
            ))}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button style={{ background: "#111", color: "#fff", padding: "12px 32px", borderRadius: 100, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔒</span> Tüm önerileri gör
              </button>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );

  // ── SORULAR ──
  const Sorular = () => (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <FadeIn>
        <section style={{ padding: "72px 0 48px", textAlign: "center" }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb", marginBottom: 16, fontWeight: 500 }}>Soru Analizi</p>
          <h1 style={{ fontSize: 56, fontWeight: 800, margin: 0, lineHeight: 1.05, color: "#111", letterSpacing: -2 }}>
            10 sorunun <AnimatedNumber target={4} />'ünde<br />çıkıyorsun
          </h1>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {["Tümü", "Öneri", "Karşılaştırma", "Fiyat"].map((f, i) => (
            <button key={f} style={{ background: i === 0 ? "#111" : "transparent", color: i === 0 ? "#fff" : "#888", border: "1.5px solid", borderColor: i === 0 ? "#111" : "#e5e5e5", borderRadius: 100, padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Stagger baseDelay={0.2} stagger={0.08}>
          {[
            { q: "En iyi yerden ısıtma firması hangisi?", area: "Yerden ısıtma", cat: "Öneri", p: [true, false, true, true], rival: "ABC Isıtma" },
            { q: "Yerden ısıtma yaptıracağım, firma öner", area: "Yerden ısıtma", cat: "Öneri", p: [true, false, false, true], rival: "ABC Isıtma" },
            { q: "Radyatör için hangi firmayı önerirsin?", area: "Radyatör", cat: "Öneri", p: [false, false, true, false], rival: "Kimse güçlü değil 💡" },
            { q: "Kombi mi yerden ısıtma mı ekonomik?", area: "Kombi", cat: "Karşılaştırma", p: [true, false, false, false], rival: "ABC Isıtma" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, padding: "24px", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: 11, background: "#f5f5f5", padding: "3px 10px", borderRadius: 100, color: "#666", fontWeight: 500 }}>{s.area}</span>
                <span style={{ fontSize: 11, background: "#111", color: "#fff", padding: "3px 10px", borderRadius: 100, fontWeight: 500 }}>{s.cat}</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: "0 0 18px", lineHeight: 1.45 }}>"{s.q}"</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[
                  { logo: "chatgpt", ok: s.p[0] },
                  { logo: "claude", ok: s.p[1] },
                  { logo: "gemini", ok: s.p[2] },
                  { logo: "perplexity", ok: s.p[3] },
                ].map((pl) => (
                  <div key={pl.logo} style={{ opacity: pl.ok ? 1 : 0.25, transition: "opacity 0.3s" }}>
                    {AILogos[pl.logo](28)}
                  </div>
                ))}
                <span style={{ fontSize: 12, color: "#999", alignSelf: "center", marginLeft: 4, fontWeight: 500 }}>
                  {s.p.filter(Boolean).length}/4
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Senin yerine: <strong style={{ color: "#555" }}>{s.rival}</strong>
              </div>
            </div>
          ))}
        </Stagger>
      </div>

      {/* BLUR */}
      <div style={{ position: "relative", marginTop: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, filter: "blur(8px)", userSelect: "none" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, padding: "24px", height: 170 }}>
              <div style={{ height: 12, background: "#f5f5f5", borderRadius: 4, width: "40%", marginBottom: 16 }} />
              <div style={{ height: 12, background: "#f5f5f5", borderRadius: 4, width: "85%", marginBottom: 8 }} />
              <div style={{ height: 12, background: "#f5f5f5", borderRadius: 4, width: "65%" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button style={{ background: "#111", color: "#fff", padding: "14px 36px", borderRadius: 100, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔒</span> 50 sorunun tamamını gör
          </button>
        </div>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "genel": return <GenelBakis />;
      case "sorular": return <Sorular />;
      default: return (
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <FadeIn>
            <section style={{ padding: "72px 0 48px", textAlign: "center" }}>
              <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb", marginBottom: 16, fontWeight: 500 }}>Çok yakında</p>
              <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, color: "#111", letterSpacing: -2 }}>{tabs.find(t => t.id === activeTab)?.label}</h1>
            </section>
          </FadeIn>
        </div>
      );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 256 : 0, background: "#fff", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0 }}>
        <div style={{ padding: "28px 20px 20px" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: -1.5 }}>GH7</span>
          <span style={{ fontSize: 9, background: "#111", color: "#fff", padding: "2px 7px", borderRadius: 100, fontWeight: 600, marginLeft: 8, verticalAlign: "middle" }}>FREE</span>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 8 }}>İdavilla Bungalov</div>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#ccc", padding: "8px 14px", fontWeight: 600 }}>Analiz</div>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "block", width: "100%", padding: "10px 14px", background: activeTab === t.id ? "#f5f5f5" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? "#111" : "#888", marginBottom: 1, textAlign: "left", transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}

          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#ccc", padding: "24px 14px 8px", fontWeight: 600 }}>Gelişim</div>
          <div style={{ padding: "0 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Gelişim Planı</span>
              <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>5/22</span>
            </div>
            <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginBottom: 14 }}>
              <div style={{ width: "23%", height: "100%", background: "#111", borderRadius: 2 }} />
            </div>
            {gelisimItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#666", padding: "3px 0" }}>
                {statusIcon(item.status)}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </nav>

        <div style={{ padding: "14px" }}>
          <div style={{ background: "#111", color: "#fff", borderRadius: 14, padding: "16px", textAlign: "center", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = ""}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>Pro'ya Geç</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>2.495₺/ay</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* MINIMAL HEADER */}
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(250,250,250,0.8)", backdropFilter: "blur(16px)", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#bbb", padding: 4, lineHeight: 1 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>V</div>
        </header>

        <div style={{ padding: "0 32px 80px" }}>{renderTab()}</div>
      </main>
    </div>
  );
};

export default GH7Dashboard;
