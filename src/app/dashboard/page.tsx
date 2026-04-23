/**
 * /dashboard — zengin 6 kart grid (Brief E ADIM 5)
 *
 * Layout (SidebarProvider + header + sidebar) parent layout.tsx'te.
 * Burada sadece içerik: hero + 6 shadcn Card.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  ClipboardCheck,
  LineChart,
  Radar,
  Sparkles,
  Settings,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { isPaidPlan, getPlanLabel, PLANS } from "@/lib/constants/plan";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ brand?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) redirect("/analiz");

  const brands = await prisma.brand.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { completedAt: "desc" },
        take: 2, // trend için son 2 scan
      },
      competitors: {
        where: { isPrimary: true },
        select: { id: true },
      },
    },
  });

  if (brands.length === 0) redirect("/analiz");

  // ?brand=X veya en yeni
  const activeBrand =
    brands.find((b) => b.id === params.brand) || brands[0];
  const latestScan = activeBrand.scans[0];
  const previousScan = activeBrand.scans[1];

  const score = latestScan?.score ?? 0;
  const scoreTotal = latestScan?.scoreTotal ?? 25;
  const scorePercentage =
    scoreTotal > 0 ? Math.round((score / scoreTotal) * 100) : 0;

  const scoreTrend = previousScan
    ? score - (previousScan.score ?? 0)
    : 0;

  const unlocked = isPaidPlan(profile.plan);
  const planLabel = getPlanLabel(profile.plan);
  const competitorCount = activeBrand.competitors.length;

  type Card = {
    slug: string;
    icon: typeof Eye;
    brand: string;
    title: string;
    locked: boolean;
    content: React.ReactNode;
    description: string;
    href: string;
    cta: string;
  };

  const cards: Card[] = [
    {
      slug: "insight",
      icon: Eye,
      brand: "INSIGHT",
      title: "AI Görünürlük Skoru",
      locked: false,
      content: (
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight tabular-nums">
              {score}
              <span className="text-xl text-muted-foreground">
                /{scoreTotal}
              </span>
            </span>
            {scoreTrend !== 0 && (
              <Badge
                variant={scoreTrend > 0 ? "default" : "destructive"}
                className="gap-1"
              >
                {scoreTrend > 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {scoreTrend > 0 ? "+" : ""}
                {scoreTrend}
              </Badge>
            )}
          </div>
          <Progress value={scorePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {scorePercentage}% · Son tarama{" "}
            {latestScan?.completedAt
              ? new Date(latestScan.completedAt).toLocaleDateString("tr-TR")
              : "yok"}
          </p>
        </div>
      ),
      description: "5 AI platformunda kaç kere anıldığını gör.",
      href: "/dashboard/insight",
      cta: "Detayları Gör",
    },
    {
      slug: "audit",
      icon: ClipboardCheck,
      brand: "AUDIT",
      title: "43 Maddelik Denetim",
      locked: !unlocked,
      content: unlocked ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight tabular-nums">
              —
            </span>
            <Badge variant="outline">Yakında</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Geliştirme aşamasında, Pro+ üyelerine ücretsiz açılacak.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-muted-foreground">
              ?
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pro üyelikle site denetimi + 43 maddelik aksiyon listesi.
          </p>
        </div>
      ),
      description: "Schema, içerik, hız — her madde için iyileştirme talimatı.",
      href: unlocked ? "/dashboard/audit" : "/dashboard/pro/audit",
      cta: unlocked ? "Denetimi Gör" : "Pro ile Aç",
    },
    {
      slug: "tracker",
      icon: LineChart,
      brand: "TRACKER",
      title: "Haftalık Otomatik Takip",
      locked: !unlocked,
      content: unlocked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Her Pazartesi 08:00</span>
          </div>
          <Badge variant="outline">Yakında</Badge>
          <p className="text-xs text-muted-foreground">
            İlk otomatik tarama aktifleştikten sonra başlar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Haftalık tarama Pro üyelerde
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Skor sürekli izlenir, düşüş anında bildirim.
          </p>
        </div>
      ),
      description: "Her hafta skor ölçülür, trend grafiği güncellenir.",
      href: unlocked ? "/dashboard/tracker" : "/dashboard/pro/tracker",
      cta: unlocked ? "Takibi Aç" : "Pro ile Aç",
    },
    {
      slug: "radar",
      icon: Radar,
      brand: "RADAR",
      title: "Rakip Takip",
      locked: !unlocked,
      content: unlocked ? (
        <div className="space-y-3">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {competitorCount}
          </span>
          <p className="text-xs text-muted-foreground">
            İzlenen rakip · Karşılaştırma sayfası yakında.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <span className="text-4xl font-bold tracking-tight text-muted-foreground">
            3
          </span>
          <p className="text-xs text-muted-foreground">
            Pro ile rakiplerin skorunu yan yana gör.
          </p>
        </div>
      ),
      description: "3 rakibin skoru senin skorunla yan yana.",
      href: unlocked ? "/dashboard/radar" : "/dashboard/pro/radar",
      cta: unlocked ? "Rakipleri Gör" : "Pro ile Aç",
    },
    {
      slug: "advisor",
      icon: Sparkles,
      brand: "ADVISOR",
      title: "Haftalık Trend Raporu",
      locked: !unlocked,
      content: unlocked ? (
        <div className="space-y-3">
          <Badge variant="outline">Opus · Yakında</Badge>
          <p className="text-xs text-muted-foreground">
            Sektör trendleri ve kişisel öncelik adımları.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Badge variant="outline">Pro</Badge>
          <p className="text-xs text-muted-foreground">
            Claude Opus ile hazırlanmış sektöre özel rapor.
          </p>
        </div>
      ),
      description: "AI arama trendleri + Opus ile sektör analizi.",
      href: unlocked ? "/dashboard/advisor" : "/dashboard/pro/advisor",
      cta: unlocked ? "Raporu Oku" : "Pro ile Aç",
    },
    {
      slug: "studio",
      icon: Settings,
      brand: "STUDIO",
      title: "Ayarlar ve Kontrol",
      locked: false,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {brands.length} marka
              {profile.plan === PLANS.PRO_PLUS ? " / 5" : ""}
            </Badge>
            <Badge variant="secondary">{planLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Profil, newsletter, marka yönetimi.
          </p>
        </div>
      ),
      description: "Profil, bültenler ve marka tercihleri.",
      href: "/dashboard/studio",
      cta: "Ayarlar",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeBrand.name}
        </h1>
        <p className="text-muted-foreground">
          {profile.plan === PLANS.FREE &&
            "Ücretsiz analizin hazır. 4 Pro aracı aç, markanı sürekli izle."}
          {profile.plan === PLANS.PRO &&
            "Pro üyesin. Tüm araçların aktif, markanı sürekli izle."}
          {profile.plan === PLANS.PRO_PLUS &&
            `Pro+ üyesin. ${brands.length}/5 marka izliyorsun, tüm araçlar aktif.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.slug}
              href={card.href}
              className="group focus:outline-none"
            >
              <Card
                className={`h-full transition-all hover:border-foreground/20 hover:shadow-md ${
                  card.locked ? "bg-muted/30" : ""
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      GH7 {card.brand}
                    </span>
                  </div>
                  {card.locked && (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardTitle className="text-lg font-semibold">
                    {card.title}
                  </CardTitle>

                  {card.content}

                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>

                  <div className="flex items-center gap-1 pt-2 text-sm font-medium">
                    <span>{card.cta}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
