"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const kapilar = [
  { id: "firma", label: "Firma", desc: "Markaniz AI\u2019da nasil gorunuyor?", placeholder: "firmaniz.com" },
  { id: "kisi", label: "Kisi", desc: "Adiniz AI\u2019da nasil geciyor?", placeholder: "Ad Soyad" },
  { id: "eticaret", label: "E-Ticaret", desc: "Ürününüz oneriliyor mu?", placeholder: "Urun satis linki" },
  { id: "export", label: "Export", desc: "Yabancilar sizi buluyor mu?", placeholder: "firmaniz.com" },
];

export default function KapiSection() {
  const [active, setActive] = useState("firma");
  const [input, setInput] = useState("");
  const router = useRouter();
  const current = kapilar.find(k => k.id === active)!;

  const handleSubmit = () => {
    if (!input.trim()) return;
    const param = active === "kisi" ? "name" : "domain";
    router.push(`/analiz?type=${active}&${param}=${encodeURIComponent(input)}`);
  };

  return (
    <section className="kapi-sec reveal" id="test">
      <span className="kapi-sec-tag">Ucretsiz Audit</span>
      <h2 className="kapi-title">Sizi test edelim.<br />60 saniye, ucretsiz.</h2>
      <p className="kapi-sub">Firma mi, kisi mi, urun mu, yurt disi mi? Secin, domain girin, sonuclari gorun.</p>

      <div className="kapi-grid">
        {kapilar.map(k => (
          <div
            key={k.id}
            className={`kapi-card${active === k.id ? " active" : ""}`}
            onClick={() => setActive(k.id)}
          >
            <span className="kapi-name">{k.label}</span>
            <span className="kapi-desc">{k.desc}</span>
          </div>
        ))}
      </div>

      <div className="kapi-input-row">
        <input
          className="kapi-input"
          type="text"
          placeholder={current.placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <button className="btn-submit" onClick={handleSubmit}>Ucretsiz Test Et &rarr;</button>
      </div>
      <p className="kapi-note">Kayit gerekmez &middot; Kredi karti yok &middot; 60 saniye</p>
    </section>
  );
}
