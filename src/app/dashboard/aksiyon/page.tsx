"use client";

import { useState } from "react";
import { actionTasks, raasOffer } from "@/lib/mock-data/actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ActionStatsCard } from "@/components/aksiyon/action-stats-card";
import { ActionTable } from "@/components/aksiyon/action-table";
import { RaasOfferCard } from "@/components/aksiyon/raas-offer-card";

export default function AksiyonPage() {
  const [raasSelected, setRaasSelected] = useState<Set<number>>(
    () =>
      new Set(
        actionTasks
          .filter((t) => t.raasSelected && t.raasEligible)
          .map((t) => t.id)
      )
  );

  function handleRaasToggle(id: number) {
    setRaasSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const completedCount = actionTasks.filter((t) => t.completed).length;
  const totalCount = actionTasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const raasSelectedCount = raasSelected.size;

  const liveOffer = {
    ...raasOffer,
    selectedCount: raasSelectedCount,
  };

  return (
    <>
      <div className="px-4 lg:px-6">
        <ActionStatsCard
          completedCount={completedCount}
          totalCount={totalCount}
          pct={pct}
        />
      </div>
      <div className="px-4 lg:px-6">
        <ActionTable
          tasks={actionTasks}
          raasSelected={raasSelected}
          onRaasToggle={handleRaasToggle}
        />
      </div>
      <div className="px-4 lg:px-6">
        {raasSelectedCount > 0 ? (
          <RaasOfferCard {...liveOffer} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Uygulanmasını istediğiniz görevler için RaaS sütunundaki
              kutuları işaretleyin, teklif otomatik oluşsun.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
