import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

type UpgradeType = "trend" | "verification" | "report" | "competitor" | "guide";

const messages: Record<UpgradeType, { title: string; desc: string; cta: string }> = {
  trend: {
    title: "Bu sonuçlar değişiyor mu?",
    desc: "Haftalık takiple trendinizi görün. Geçen hafta 0, bu hafta 2 — yükseliyor musunuz?",
    cta: "Haftalık takibe başla",
  },
  verification: {
    title: "Yaptıklarının işe yaradığını gör",
    desc: "FAQ sayfası oluşturdun mu? Gelecek hafta yapay zekanın fark edip etmediğini kontrol edelim.",
    cta: "İlerleme takibi başlat",
  },
  report: {
    title: "Her hafta raporunu al",
    desc: "Rakiplerin ne yaptı? Sen ne kadar ilerledin? Her cuma raporun hazır.",
    cta: "Haftalık rapora başla",
  },
  competitor: {
    title: "Rakiplerini takipte tut",
    desc: "Rakiplerin yeni bir şey yaptığında hemen bildir. Geride kalma.",
    cta: "Rakip takibine başla",
  },
  guide: {
    title: "Adım adım rehber ile gelişim planını uygula",
    desc: "Pro'da her adımı sana özel hazırlarız ve yapay zekanın fark edip etmediğini kontrol ederiz.",
    cta: "Pro ile rehberi aç",
  },
};

interface ProUpgradeCardProps {
  type: UpgradeType;
  plan?: string;
  /** Optionally override the competitor name in the message */
  competitorName?: string;
}

export function ProUpgradeCard({ type, plan, competitorName }: ProUpgradeCardProps) {
  // Don't show for paid users
  if (plan && plan !== "free") return null;

  const msg = messages[type];
  const desc = competitorName
    ? msg.desc.replace("Rakiplerin", competitorName)
    : msg.desc;

  return (
    <div className="rounded-2xl border border-border/50 bg-white p-5 sm:p-8 text-center dark:bg-card">
      <p className="text-base sm:text-lg font-semibold text-foreground">{msg.title}</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{desc}</p>
      <Link
        href="/dashboard/ayarlar"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
      >
        {msg.cta} → 2.495₺/ay
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
