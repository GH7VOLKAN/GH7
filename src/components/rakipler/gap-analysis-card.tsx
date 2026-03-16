"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  LightbulbIcon,
  GlobeIcon,
  ShieldAlertIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";

interface CompetitorDetail {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
}

interface GapAnalysisCardProps {
  detail: CompetitorDetail | null;
  userName: string;
}

export function GapAnalysisCard({ detail, userName }: GapAnalysisCardProps) {
  if (!detail) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <SparklesIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            Henüz rakip verisi yok
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Rakip ekledikten ve tarama çalıştırdıktan sonra rekabet analizi burada görünecek.
          </p>
        </CardContent>
      </Card>
    );
  }

  const gap = detail.mentionScore - detail.userMentionScore;
  const isAhead = gap <= 0;
  const criticalGaps = detail.readinessGaps.slice(0, 5);
  const hasReadinessGaps = criticalGaps.length > 0;
  const hasSourcePages = detail.topSourcePages.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="size-5 text-primary" />
          Rekabet Analizi — {detail.name} vs {userName}
        </CardTitle>
        <CardDescription>
          AI platformlarında en güçlü rakibinizle karşılaştırma ve iyileştirme fırsatları
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Score comparison hero */}
        <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-5">
          <div className="flex-1 text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {userName}
            </p>
            <p className="text-4xl font-bold tabular-nums text-primary">
              {detail.userMentionScore}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${detail.userMentionScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 font-bold ${
                isAhead
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isAhead ? "ÖNDE" : `${gap} FARK`}
            </Badge>
            <span className="text-[10px] text-muted-foreground">puan farkı</span>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {detail.name}
            </p>
            <p className="text-4xl font-bold tabular-nums text-muted-foreground">
              {detail.mentionScore}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  detail.mentionScore > detail.userMentionScore ? "bg-red-400" : "bg-zinc-300"
                }`}
                style={{ width: `${detail.mentionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interpretation — What does this mean? */}
        <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium mb-1">Bu ne anlama geliyor?</p>
              {isAhead ? (
                <p className="text-muted-foreground">
                  {userName} şu an AI platformlarında {detail.name}&apos;den daha sık bahsediliyor.
                  Bu avantajı korumak için site teknik altyapınızı güçlendirmeye ve içerik üretmeye devam edin.
                </p>
              ) : gap <= 10 ? (
                <p className="text-muted-foreground">
                  {detail.name} sadece {gap} puan önde — farkı kapatmak mümkün.
                  Aşağıdaki teknik iyileştirmeleri yaparak ve sektörel içerik üreterek rakibinizi geçebilirsiniz.
                </p>
              ) : gap <= 30 ? (
                <p className="text-muted-foreground">
                  {detail.name} AI platformlarında {userName}&apos;den belirgin şekilde daha fazla bahsediliyor.
                  Bu farkın kaynağı genellikle daha zengin yapılandırılmış veri, daha fazla harici kaynak ve daha güçlü dijital varlıktır.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Büyük bir fark var. {detail.name} muhtemelen çok daha güçlü bir dijital altyapıya sahip.
                  Öncelikle aşağıdaki hazırlık eksikliklerini giderin, ardından içerik stratejisi ile farkı kapatmaya başlayın.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Readiness gaps — prioritized */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldAlertIcon className="size-4 text-amber-500" />
              Teknik Hazırlık Eksiklikleri
            </h3>
            {hasReadinessGaps ? (
              <div className="flex flex-col gap-2">
                {criticalGaps.map((gap, i) => {
                  const [label, ...rest] = gap.split(":");
                  const recommendation = rest.join(":").trim();

                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm hover:bg-accent/50 transition-colors"
                    >
                      <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <span className="font-medium">{label}</span>
                        {recommendation && (
                          <span className="text-muted-foreground">: {recommendation}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <p className="mt-1 text-xs text-muted-foreground px-1">
                  Bu eksiklikleri gidermek AI platformlarında görünürlüğünüzü artırır. Site Analizi sayfasından detaylı kontrol yapabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 px-4 py-3 dark:bg-emerald-900/10">
                <CheckCircle2Icon className="size-4 text-emerald-500" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Teknik altyapınız iyi durumda — tüm kontroller geçiyor!
                </p>
              </div>
            )}
          </div>

          {/* Source visibility — where are they found */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <GlobeIcon className="size-4 text-blue-500" />
              AI&apos;ın Kullandığı Kaynaklar
            </h3>
            {hasSourcePages ? (
              <div className="flex flex-col gap-2">
                {detail.topSourcePages.map((page, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs tabular-nums text-muted-foreground w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium truncate">{page.path}</span>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {page.promptCount} URL
                    </Badge>
                  </div>
                ))}
                <p className="mt-1 text-xs text-muted-foreground px-1">
                  Bu domainlerden gelen bilgiler AI yanıtlarını doğrudan etkiliyor. Bu kaynaklarda görünürlüğünüzü artırın.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
                <GlobeIcon className="size-4" />
                Tarama sonrası kaynak analizi burada görünecek.
              </div>
            )}
          </div>
        </div>

        {/* Action items summary */}
        {!isAhead && (
          <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-blue-50 p-4 dark:from-violet-900/10 dark:to-blue-900/10">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ArrowRightIcon className="size-4 text-violet-600 dark:text-violet-400" />
              Önerilen Adımlar
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {hasReadinessGaps && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span>Teknik eksiklikleri giderin (Site Analizi → Aksiyon Planı)</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>Yapay zekanin sizi daha iyi anlamasi icin sitenizi yapilandirin</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>Sektörel blog ve SSS içerikleri oluşturun</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>Harici kaynaklarda (dizinler, haberler) yer alın</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
