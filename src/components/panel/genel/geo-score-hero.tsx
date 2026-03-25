"use client";

function getScoreColor(score: number): string {
  if (score >= 70) return "#22C55E";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

interface GeoScoreHeroProps {
  score: number;
  trend: number;
}

export function GeoScoreHero({ score, trend }: GeoScoreHeroProps) {
  const color = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        GEO Skor Kart&#305;
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference - progress}`}
              strokeDashoffset={circumference * 0.25}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-gray-500 mb-1">
            Genel GEO Performans&#305;n&#305;z
          </p>
          <p className="text-base font-medium text-gray-900 mb-2">
            Ge&#231;en haftaya g&#246;re{" "}
            <span
              className={
                trend > 0
                  ? "text-green-600"
                  : trend < 0
                    ? "text-red-500"
                    : "text-gray-500"
              }
            >
              {trend > 0 ? "+" : ""}
              {trend} puan
            </span>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            GEO Skoru, markan&#305;z&#305;n yapay zeka tabanl&#305; arama motorlar&#305;ndaki
            g&#246;r&#252;n&#252;rl&#252;k, ses pay&#305;, kapsam ve alg&#305; performans&#305;n&#305; tek bir metrikte
            &#246;zetler.
          </p>
        </div>
      </div>
    </div>
  );
}
