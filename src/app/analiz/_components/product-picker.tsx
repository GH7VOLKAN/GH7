"use client";

import s from "../analiz.module.css";
import type { Product } from "@/lib/analiz/types";

type Props = {
  products: Product[];
  selectedIds: string[];
  onToggle: (p: Product) => void;
  onSubmit: () => void;
  submitDisabled: boolean;
};

export function ProductPicker({
  products,
  selectedIds,
  onToggle,
  onSubmit,
  submitDisabled,
}: Props) {
  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 2a · Ürün seç</div>
      <h2 className={s.h2}>Hangi ürünleri test edelim?</h2>
      <p className={s.sub}>En çok trafik çeken {products.length} ürün. En fazla 3 ürün seç.</p>

      <ul className={s.cards}>
        {products.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onToggle(p)}
              className={`${s.card} ${selectedIds.includes(p.id) ? s.cardSelected : ""}`}
            >
              <span className={s.cardTitle}>{p.name}</span>
              <span className={s.cardMeta}>
                {p.subcatCount > 0 ? `${p.subcatCount} alt kategori` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          marginTop: 16,
          borderTop: "1px solid var(--g200)",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--g500)", fontVariantNumeric: "tabular-nums" }}>
          {selectedIds.length}/3 ürün seçildi
        </span>
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{
            padding: "12px 24px",
            background: submitDisabled ? "var(--g200)" : "var(--black)",
            color: submitDisabled ? "var(--g400)" : "var(--white)",
            border: "none",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 600,
            cursor: submitDisabled ? "not-allowed" : "pointer",
          }}
        >
          Devam et →
        </button>
      </div>
    </section>
  );
}
