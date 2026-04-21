"use client";

import s from "../analiz.module.css";
import type { AnalysisResult, AuditItem } from "@/lib/analiz/types";

type Props = { analysis: AnalysisResult };

const STATUS_LABEL: Record<string, string> = {
  yes: "Var",
  partial: "Kısmi",
  no: "Yok",
};

function statusScore(status: AuditItem["you"]): number {
  if (status === "yes") return 1;
  if (status === "partial") return 0.5;
  return 0;
}

export function AuditReport({ analysis }: Props) {
  const { audit, yourBrandName, competitorBrandName } = analysis;

  // Grupları audit sırasına göre ilk karşılaştıkları sırada topla
  const groupsInOrder: string[] = [];
  const groupMap: Record<string, AuditItem[]> = {};
  for (const item of audit) {
    if (!groupMap[item.group]) {
      groupMap[item.group] = [];
      groupsInOrder.push(item.group);
    }
    groupMap[item.group].push(item);
  }

  const yourTotal = audit.reduce((a, it) => a + statusScore(it.you), 0);
  const themTotal = audit.reduce((a, it) => a + statusScore(it.them), 0);

  // Kritik fark: high impact + rakip you'dan iyi
  const criticalGaps = audit.filter(
    (it) =>
      it.impact === "high" &&
      statusScore(it.them) > statusScore(it.you),
  );

  return (
    <section className={s.screen}>
      <div className={s.screenLabel}>Ekran 5 · Neden rakibin önde</div>
      <h2 className={s.h2}>43 GEO kriteri, satır satır.</h2>
      <p className={s.sub}>Durum görünür. Çözümler Pro&apos;da.</p>

      <div className={s.auditSummary}>
        <div className={s.auditStat}>
          <b>
            {Math.round(yourTotal)}/{audit.length}
          </b>
          <span>{yourBrandName}</span>
        </div>
        <div className={s.auditStat}>
          <b>
            {Math.round(themTotal)}/{audit.length}
          </b>
          <span>{competitorBrandName}</span>
        </div>
        <div className={s.auditStat}>
          <b>{criticalGaps.length}</b>
          <span>Kritik fark</span>
        </div>
      </div>

      {criticalGaps.length > 0 && (
        <div className={s.criticalGap}>
          <h4>Kritik {criticalGaps.length} fark</h4>
          <p>
            Sıralama farkını yaratan {criticalGaps.length} madde var. Kalan{" "}
            {audit.length - criticalGaps.length}&apos;si ikinci derecede önemli.
            Pro&apos;da öncelikli sıralama görünür.
          </p>
        </div>
      )}

      {groupsInOrder.map((group) => {
        const items = groupMap[group];
        const groupYou = items.reduce((a, it) => a + statusScore(it.you), 0);
        const groupThem = items.reduce((a, it) => a + statusScore(it.them), 0);
        return (
          <div key={group} className={s.auditGroup}>
            <div className={s.auditGroupHead}>
              <span>{group}</span>
              <span className={s.groupScore}>
                {Math.round(groupYou)}/{items.length} · Rakip{" "}
                {Math.round(groupThem)}/{items.length}
              </span>
            </div>
            <ul className={s.auditList}>
              {items.map((it) => (
                <li key={it.id} className={s.auditItem}>
                  <span
                    className={`${s.auditItemTitle} ${it.impact === "high" ? s.high : ""}`}
                  >
                    {it.title}
                  </span>
                  <span
                    className={`${s.auditStatusCell} ${statusClass(it.you)}`}
                    title={`Senin durumun: ${STATUS_LABEL[it.you]}`}
                  >
                    {STATUS_LABEL[it.you]}
                  </span>
                  <span
                    className={`${s.auditStatusCell} ${statusClass(it.them)}`}
                    title={`Rakip: ${STATUS_LABEL[it.them]}`}
                  >
                    {STATUS_LABEL[it.them]}
                  </span>
                  <span className={s.fixLock}>
                    Nasıl düzeltilir
                    <span className={s.fixLockBadge}>PRO</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function statusClass(status: AuditItem["you"]): string {
  if (status === "yes") return s.statusYes;
  if (status === "no") return s.statusNo;
  return s.statusPartial;
}
