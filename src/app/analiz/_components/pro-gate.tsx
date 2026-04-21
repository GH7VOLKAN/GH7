"use client";

import Link from "next/link";
import s from "../analiz.module.css";

const INCLUDES = [
  "43 madde için rakibine özel çözüm talimatları",
  "Haftalık otomatik tarama, trend grafiği",
  "Rakip seni geçtiğinde e-posta + push uyarı",
  "Haftalık 1 somut görev (\"bu hafta şunu düzelt\")",
  "GH7 servis pazarı — \"bunu benim yerime yapsın\" erişimi",
];

export function ProGate({ productName }: { productName?: string }) {
  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 6 · Pro kapısı</div>

      <div className={s.proBlock}>
        <div className={s.proKicker}>Takip et, çöz</div>
        <h2 className={s.proHead}>
          Her hafta
          <br />
          kendini izle.
        </h2>
        <p className={s.proSub}>
          43 maddenin çözüm rehberi açılır. Her hafta otomatik tarama. Rakip
          seni geçtiği gün bildiririz.
          {productName ? ` ${productName} için takip başlat.` : ""}
        </p>

        <div className={s.proPrice}>
          <span className={s.proPriceNum}>₺699</span>
          <span className={s.proPricePer}>/ ay</span>
          <span className={s.proPriceYearly}>
            yıllık ₺8.388
            <br />
            ilk ay koşulsuz iade
          </span>
        </div>

        <Link href="/giris?next=/panel&intent=pro" className={s.proBtn}>
          Beni takip et →
        </Link>

        <ul className={s.proIncludes}>
          {INCLUDES.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
