"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChartIcon } from "lucide-react";

interface ShareOfVoiceCardProps {
  data: { name: string; isUser: boolean; percentage: number; color: string }[];
}

export function ShareOfVoiceCard({ data }: ShareOfVoiceCardProps) {
  if (data.length === 0) {
    return (
      <Card className="border border-border/50 shadow-sm rounded-2xl">
        <CardContent className="py-12 text-center">
          <PieChartIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            Henüz görünürlük payı verisi yok
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Tarama tamamlandıktan sonra yapay zekalardaki görünürlük dağılımı burada görünecek.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="size-5 text-primary" />
          Görünürlük Payı
        </CardTitle>
        <CardDescription>
          Yapay zekaların sorulara verdiği yanıtlarda bahsedilme oranları
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Stacked horizontal bar */}
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                minWidth: item.percentage > 0 ? "2px" : "0px",
              }}
            >
              {item.percentage >= 8 && `%${item.percentage}`}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className={item.isUser ? "font-semibold" : "text-muted-foreground"}>
                {item.name}
              </span>
              <span className="tabular-nums font-medium">
                %{item.percentage}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
