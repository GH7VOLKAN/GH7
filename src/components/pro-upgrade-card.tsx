import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

type UpgradeType = "trend" | "verification" | "report" | "competitor";

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
    desc: "Rakiplerin ne yaptı? Sen ne kadar ilerldin? Her cuma raporun hazır.",
    cta: "Haftalık rapora başla",
  },
  competitor: {
    title: "Rakiplerini takipte tut",
    desc: "Rakiplerin yeni bir şey yaptığında hemen bildir. Geride kalma.",
    cta: "Rakip takibine başla",
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
    <div className="mx-4 lg:mx-6 rounded-2xl border border-border/50 bg-white p-8 text-center dark:bg-card">
      <p className="text-lg font-semibold text-foreground">{msg.title}</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{desc}</p>
      <Link
        href="/dashboard/ayarlar"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {msg.cta} → 2.495₺/ay
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
