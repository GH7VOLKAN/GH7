"use client";

import { mockCompetitors } from "@/lib/mock-data";
import { CompetitorTable } from "@/components/dashboard/competitor-table";

export default function RakipPage() {
  const topCompetitor = mockCompetitors.find(
    (c) => !c.isUser && c.advantages && c.advantages.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Baslik */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          RAKİP İSTİHBARATI
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {mockCompetitors.filter((c) => !c.isUser).length} rakip takip ediliyor
        </p>
      </div>

      {/* Tablo */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <CompetitorTable competitors={mockCompetitors} />
      </div>

      {/* Analiz */}
      {topCompetitor && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[14px] border border-border bg-card p-5">
            <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
              {topCompetitor.name} Neden Önde?
            </h3>
            <div className="mt-4 space-y-2">
              {topCompetitor.advantages?.map((adv, i) => (
                <p key={i} className="text-sm text-muted">
                  · {adv}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-card p-5">
            <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
              Sizde Eksik Olan
            </h3>
            <div className="mt-4 space-y-2">
              {topCompetitor.userGaps?.map((gap, i) => (
                <p key={i} className="text-sm text-score-low">
                  · {gap}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
