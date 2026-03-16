"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActionStatsCard } from "@/components/aksiyon/action-stats-card";
import { ActionTable, type ActionTaskItem } from "@/components/aksiyon/action-table";
import { RaasOfferCard } from "@/components/aksiyon/raas-offer-card";
import type { SituationAnalysis } from "@/lib/dal/actions";

import {
  MessageSquareTextIcon,
  UsersIcon,
  GlobeIcon,
  LinkIcon,
  CheckIcon,
  ZapIcon,
  CrownIcon,
  RocketIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react";

interface AksiyonClientProps {
  brandId: string;
  actionTasks: ActionTaskItem[];
  completedCount: number;
  totalCount: number;
  raasEligibleCount: number;
  situation: SituationAnalysis;
}

const RAAS_OFFER_BASE = {
  currentScore: 52,
  targetScore: 82,
  price: "12.000₺",
  deposit: "%30 başlangıç (3.600₺) + %70 hedefe ulaşınca",
  timeline: "4-6 hafta",
};

// ─── Solution packages ───
const SOLUTION_PACKAGES = [
  {
    tier: "baslangic",
    title: "Başlangıç",
    price: "5.000₺",
    duration: "1-2 hafta",
    color: "blue",
    features: [
      "Yapay zekanin sitenizi daha iyi anlamasi icin yapilandirma",
      "Baslik ve aciklamalarin duzenlenmesi",
      "Yapay zeka erisim izinlerinin ayarlanmasi",
      "Temel teknik hatalarin giderilmesi",
      "Google Isletme Profili duzenleme",
    ],
    cta: "Teklif Al",
  },
  {
    tier: "profesyonel",
    title: "Profesyonel",
    price: "9.000₺",
    duration: "3-4 hafta",
    color: "purple",
    popular: true,
    features: [
      "Başlangıç paketindeki tüm özellikler",
      "AI için içerik stratejisi",
      "Kaynak domain optimizasyonu",
      "SSS ve bilgi tabanı oluşturma",
      "Rakip gap analizi raporu",
      "2 aylık performans takibi",
    ],
    cta: "Teklif Al",
  },
  {
    tier: "kurumsal",
    title: "Kurumsal",
    price: "18.000₺",
    duration: "6-8 hafta",
    color: "amber",
    features: [
      "Profesyonel paketindeki tüm özellikler",
      "Tam AI görünürlük yönetimi",
      "Wikipedia & bilgi grafiği çalışması",
      "Aylık raporlama ve optimizasyon",
      "Özel danışman atanması",
      "6 aylık performans garantisi",
    ],
    cta: "Teklif Al",
  },
];

function platformLabel(platform: string | null): string {
  if (!platform) return "—";
  const labels: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    perplexity: "Perplexity",
  };
  return labels[platform] ?? platform;
}

export function AksiyonClient({
  brandId,
  actionTasks,
  completedCount,
  totalCount,
  raasEligibleCount,
  situation,
}: AksiyonClientProps) {
  const [raasSelected, setRaasSelected] = useState<Set<string>>(new Set());

  function handleRaasToggle(id: string) {
    setRaasSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const raasSelectedCount = raasSelected.size;

  const liveOffer = {
    ...RAAS_OFFER_BASE,
    selectedCount: raasSelectedCount,
  };

  const mentionPct = situation.totalPrompts > 0
    ? Math.round((situation.mentionedCount / situation.totalPrompts) * 100)
    : 0;

  return (
    <>
      {/* ─── SECTION 1: AI Durum Raporu ─── */}
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            AI Durum Raporu
          </p>
          <h2 className="mt-1 text-lg font-light tracking-[-0.04em]">
            Mevcut durumunuzun özeti
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Bahsedilme Kartı */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <MessageSquareTextIcon className="size-4 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Bahsedilme</span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{situation.mentionScore}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <Progress value={situation.mentionScore} className="mt-2 h-1.5" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {situation.totalPrompts > 0
                  ? `${situation.totalPrompts} sorunun ${situation.mentionedCount} tanesinde sizi oneriyor (%${mentionPct}).`
                  : "Henuz tarama yapilmadi."}
                {situation.weakPlatform && situation.weakPlatform !== situation.topPlatform && (
                  <> <strong>{platformLabel(situation.weakPlatform)}</strong> sizi en az taniyan yapay zeka.</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Rakipler Kartı */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <UsersIcon className="size-4 text-red-600 dark:text-red-300" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Rakipler</span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{situation.competitorCount}</span>
                  <span className="text-sm text-muted-foreground">rakip</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {situation.topCompetitor
                  ? <>En güçlü: <strong>{situation.topCompetitor}</strong> ({situation.topCompetitorScore}%)</>
                  : "Henüz rakip eklenmemiş."}
              </p>
            </CardContent>
          </Card>

          {/* Site Hazırlığı Kartı */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <GlobeIcon className="size-4 text-green-600 dark:text-green-300" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Site Hazırlığı</span>
              </div>
              <div className="mt-3">
                {situation.auditScore !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{situation.auditScore}</span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <Progress value={situation.auditScore} className="mt-2 h-1.5" />
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg text-muted-foreground">Kontrol yapilmadi</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {situation.auditScore !== null
                  ? <>{situation.auditPassCount} kontrol başarılı, <strong>{situation.auditFailCount} kontrol başarısız</strong>.</>
                  : "Site analizi çalıştırarak AI hazırlık puanınızı öğrenin."}
              </p>
            </CardContent>
          </Card>

          {/* Kaynaklar Kartı */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <LinkIcon className="size-4 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Kaynaklar</span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{situation.sourceCount}</span>
                  <span className="text-sm text-muted-foreground">domain</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {situation.topSourceDomain
                  ? <>En güçlü kaynak: <strong>{situation.topSourceDomain}</strong></>
                  : "Henüz kaynak bulunamadı."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 2: Çözüm Paketleri ─── */}
      <div className="px-4 lg:px-6">
        <div className="mb-4 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Profesyonel Çözümler
          </p>
          <h2 className="mt-1 text-lg font-light tracking-[-0.04em]">
            AI görünürlüğünüzü hızla artırın
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Uzman ekibimiz markanızın AI platformlarındaki görünürlüğünü optimize eder.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SOLUTION_PACKAGES.map((pkg) => {
            const colorStyles =
              pkg.color === "amber"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                : pkg.color === "purple"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";

            const iconMap = {
              baslangic: ZapIcon,
              profesyonel: RocketIcon,
              kurumsal: CrownIcon,
            };
            const Icon = iconMap[pkg.tier as keyof typeof iconMap] ?? ZapIcon;

            return (
              <Card
                key={pkg.tier}
                className={`relative transition-all hover:shadow-md ${
                  pkg.popular ? "border-foreground/30 shadow-sm" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-0.5 text-[10px] font-bold text-background">
                    Önerilen
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${colorStyles}`}>
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-base">{pkg.title}</CardTitle>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{pkg.price}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{pkg.duration}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
                      pkg.popular
                        ? "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98]"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {pkg.cta}
                    <ArrowRightIcon className="ml-1 inline size-3.5" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Durum bazlı insight */}
        {(situation.mentionScore < 30 || (situation.auditScore !== null && situation.auditScore < 50)) && (
          <Card className="mt-4 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Markanız acil iyileştirme gerektiriyor
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  {situation.mentionScore < 30 && "Yapay zekalar sizi yeterince tanimiyor. "}
                  {situation.auditScore !== null && situation.auditScore < 50 && "Siteniz yapay zeka icin yeterince hazir degil. "}
                  Cozum paketlerimiz ile yapay zekadaki gorunurlugunuzu hizla artirabiliriz.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── SECTION 3: Görev Tablosu ─── */}
      <div className="px-4 lg:px-6">
        <div className="mb-4 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Görevler
          </p>
          <h2 className="mt-1 text-lg font-light tracking-[-0.04em]">
            Aksiyon Planı
          </h2>
        </div>
      </div>

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
