"use client";

import type { PlatformStat, CompetitorRankEntry, RecentMention } from "@/lib/dal/overview";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Helper: Tooltip icon                                               */
/* ------------------------------------------------------------------ */
function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-400">
        ?
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Change badge                                               */
/* ------------------------------------------------------------------ */
function ChangeBadge({
  value,
  suffix = "",
  prefix = "",
  invert = false,
}: {
  value: number | null;
  suffix?: string;
  prefix?: string;
  invert?: boolean;
}) {
  if (value === null) return null;
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = value === 0;
  const arrow = isNeutral ? "\u2192" : isPositive ? "\u2191" : "\u2193";
  const color = isNeutral
    ? "text-gray-500"
    : isPositive
      ? "text-green-600"
      : "text-red-500";
  const displayVal = Math.abs(value);
  return (
    <span className={`text-sm font-medium ${color}`}>
      {arrow}
      {prefix}
      {displayVal}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface MetricCardsProps {
  mentionScore: number;
  totalMentions: number;
  totalResults: number;
  platformStats: PlatformStat[];
  competitorRanking: CompetitorRankEntry[];
  recentMentions: RecentMention[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function MetricCards({
  mentionScore,
  totalMentions,
  totalResults,
  platformStats,
  competitorRanking,
  recentMentions,
}: MetricCardsProps) {
  // Ses Payi: user's share from competitorRanking
  const userEntry = competitorRanking.find((c) => c.isUser);
  const totalCompetitorMentions = competitorRanking.reduce(
    (s, c) => s + c.mentionCount,
    0
  );
  const shareOfVoice =
    userEntry && totalCompetitorMentions > 0
      ? Math.round((userEntry.mentionCount / totalCompetitorMentions) * 100)
      : 0;

  // Kapsam: (totalMentions / totalResults) * 100
  const coverage =
    totalResults > 0 ? Math.round((totalMentions / totalResults) * 100) : 0;

  // Ortalama Sira: from recentMentions positions
  const positions = recentMentions
    .map((m) => parseFloat(m.position))
    .filter((p) => !isNaN(p) && p > 0);
  const avgPosition =
    positions.length > 0
      ? (positions.reduce((s, p) => s + p, 0) / positions.length).toFixed(1)
      : "-";

  // Algi Skoru: from recentMentions sentiments
  const sentimentMap = { pozitif: 1, "nötr": 0.5, negatif: 0 } as const;
  const sentimentScores = recentMentions
    .map((m) => sentimentMap[m.sentiment as keyof typeof sentimentMap])
    .filter((s) => s !== undefined);
  const sentimentScore =
    sentimentScores.length > 0
      ? (
          sentimentScores.reduce<number>((s, v) => s + v, 0) / sentimentScores.length
        ).toFixed(2)
      : "-";

  const cards = [
    {
      label: "Ses Payı",
      value: `%${shareOfVoice}`,
      change: null as number | null,
      suffix: "%",
      prefix: "%",
      tooltip:
        "Markanızın, takip edilen tüm AI aramalarındaki görünme oranını gösterir.",
    },
    {
      label: "Kapsam",
      value: `%${coverage}`,
      change: null as number | null,
      suffix: "%",
      prefix: "%",
      tooltip:
        "Takip edilen aramaların yüzde kaçında markanız en az bir kez görünüyor.",
    },
    {
      label: "Ortalama Sıra",
      value: avgPosition.toString(),
      change: null as number | null,
      invert: true,
      tooltip:
        "AI yanıtlarında markanızın ortalama sıralama pozisyonudur. 1.0 en iyi değeridir.",
    },
    {
      label: "Algı Skoru",
      value: sentimentScore.toString(),
      change: null as number | null,
      tooltip:
        "AI'ın markanızı nasıl tanımladığı ve önerdiği ile ilgili genel duygu skorudur.",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((m) => (
        <div
          key={m.label}
          className="border border-gray-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center text-sm text-gray-500">
            {m.label}
            <InfoTip text={m.tooltip} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{m.value}</div>
          <ChangeBadge
            value={m.change}
            suffix={m.suffix}
            prefix={m.prefix}
            invert={m.invert}
          />
        </div>
      ))}
    </div>
  );
}
