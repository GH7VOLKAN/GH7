"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface RaasOfferData {
  selectedCount: number;
  currentScore: number;
  targetScore: number;
  price: string;
  deposit: string;
  timeline: string;
}

export function RaasOfferCard({
  selectedCount,
  currentScore,
  targetScore,
  price,
  deposit,
  timeline,
}: RaasOfferData) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>RaaS Teklifi</CardTitle>
        <CardDescription>
          GH7 ekibi seçili görevleri sizin adınıza uygular
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Görev</p>
            <p className="text-2xl font-semibold tabular-nums">
              {selectedCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Skor</p>
            <p className="text-2xl font-semibold tabular-nums">
              {currentScore} → {targetScore}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fiyat</p>
            <p className="text-2xl font-semibold tabular-nums">{price}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Süre</p>
            <p className="text-2xl font-semibold tabular-nums">{timeline}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{deposit}</p>
        <Button>Teklif Al</Button>
      </CardFooter>
    </Card>
  );
}
