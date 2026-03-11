"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ActionStatsCard } from "@/components/aksiyon/action-stats-card";
import { ActionTable, type ActionTaskItem } from "@/components/aksiyon/action-table";
import { RaasOfferCard } from "@/components/aksiyon/raas-offer-card";

interface AksiyonClientProps {
  brandId: string;
  actionTasks: ActionTaskItem[];
  completedCount: number;
  totalCount: number;
  raasEligibleCount: number;
}

const RAAS_OFFER_BASE = {
  currentScore: 52,
  targetScore: 82,
  price: "12.000₺",
  deposit: "%30 başlangıç (3.600₺) + %70 hedefe ulaşınca",
  timeline: "4-6 hafta",
};

export function AksiyonClient({
  brandId,
  actionTasks,
  completedCount,
  totalCount,
}: AksiyonClientProps) {
  const [raasSelected, setRaasSelected] = useState<Set<string>>(new Set());

  function handleRaasToggle(id: string) {
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

  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const raasSelectedCount = raasSelected.size;

  const liveOffer = {
    ...RAAS_OFFER_BASE,
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
          brandId={brandId}
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
