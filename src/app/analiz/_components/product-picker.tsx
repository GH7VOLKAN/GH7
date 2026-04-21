"use client";

import s from "../analiz.module.css";
import type { Product } from "@/lib/analiz/types";

type Props = {
  products: Product[];
  selectedId: string | null;
  onSelect: (p: Product) => void;
};

export function ProductPicker({ products, selectedId, onSelect }: Props) {
  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 2a · Ürün seç</div>
      <h2 className={s.h2}>Hangi ürününü test edelim?</h2>
      <p className={s.sub}>En çok trafik çeken {products.length} ürün. Biri yeterli.</p>

      <ul className={s.cards}>
        {products.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={`${s.card} ${selectedId === p.id ? s.cardSelected : ""}`}
            >
              <span className={s.cardTitle}>{p.name}</span>
              <span className={s.cardMeta}>
                {p.subcatCount > 0 ? `${p.subcatCount} alt kategori` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
