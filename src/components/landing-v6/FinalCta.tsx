"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const kapilar = [
  { id: "firma", label: "Firma", placeholder: "firmaniz.com" },
  { id: "kisi", label: "Kisi", placeholder: "Ad Soyad" },
  { id: "eticaret", label: "E-Ticaret", placeholder: "Urun satis linki" },
  { id: "export", label: "Export", placeholder: "firmaniz.com" },
];

export default function FinalCta() {
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
    <section className="final-sec reveal">
      <h2 className="final-title">Yapay zeka seni taniyor mu?</h2>
      <p className="final-sub">60 saniyede ogren. Ucretsiz.</p>

      <div className="final-kapi">
        {kapilar.map(k => (
          <button
            key={k.id}
            className={`fk${active === k.id ? " active" : ""}`}
            onClick={() => setActive(k.id)}
          >
            {k.label}
          </button>
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
