/**
 * HeroMetrics — Genel Bakış üstündeki 3 hero metrik kartı
 *
 * 1. GEO Skoru (0-100)
 * 2. Rakip Skoru (en iyi rakip)
 * 3. Tahmini Aylık Kayıp
 *
 * Her kart beyaz zemin, siyah kenarlık, büyük rakam (32-48px bold).
 * Sadece yeşil (iyi) / sarı (orta) / kırmızı (kötü) durumlu renk vurgu.
 */

function getScoreColor(score: number): string {
  if (score >= 60) return "text-green-600";
  if (score >= 30) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBarColor(score: number): string {
  if (score >= 60) return "bg-green-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-red-500";
}

function formatTRY(n: number | null | undefined): string {
  if (n == null) return "—";
  return `₺${Math.round(n).toLocaleString("tr-TR")}`;
}

interface Props {
  userScore: number;
  competitorScore: number | null;
  competitorName: string | null;
  estimatedMonthlyLoss: number | null;
  estimatedYearlyLoss: number | null;
}

export function HeroMetrics({
  userScore,
  competitorScore,
  competitorName,
  estimatedMonthlyLoss,
  estimatedYearlyLoss,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* GEO Skorunuz */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          GEO Skorunuz
        </div>
        <div className={`mt-3 text-4xl font-bold ${getScoreColor(userScore)}`}>
          {userScore}
          <span className="text-xl font-normal text-gray-400">/100</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${getScoreBarColor(userScore)}`}
            style={{ width: `${Math.min(100, userScore)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          AI platformlarında markanızın görünürlüğü
        </p>
      </div>

      {/* Rakip Skoru */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Rakip Skoru
        </div>
        <div
          className={`mt-3 text-4xl font-bold ${
            competitorScore != null
              ? getScoreColor(competitorScore)
              : "text-gray-400"
          }`}
        >
          {competitorScore ?? "—"}
          {competitorScore != null && (
            <span className="text-xl font-normal text-gray-400">/100</span>
          )}
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${
              competitorScore != null
                ? getScoreBarColor(competitorScore)
                : "bg-gray-200"
            }`}
            style={{ width: `${Math.min(100, competitorScore ?? 0)}%` }}
          />
        </div>
        <p className="mt-3 truncate text-xs text-gray-500">
          {competitorName ? `En iyi rakip: ${competitorName}` : "Rakip bulunamadı"}
        </p>
      </div>

      {/* Tahmini Kayıp */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Tahmini Kayıp
        </div>
        <div className="mt-3 text-4xl font-bold text-red-600">
          {formatTRY(estimatedMonthlyLoss)}
          <span className="text-xl font-normal text-gray-400">/ay</span>
        </div>
        <p className="mt-5 text-xs text-gray-500">
          {estimatedYearlyLoss != null
            ? `Yıllık tahmini: ${formatTRY(estimatedYearlyLoss)}`
            : "Rakibe kaptırılan müşteri potansiyeli"}
        </p>
      </div>
    </div>
  );
}
