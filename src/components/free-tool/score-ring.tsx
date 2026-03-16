"use client";

import { useEffect, useState } from "react";

function getScoreColor(score: number): string {
  if (score <= 30) return "#ef4444"; // red
  if (score <= 60) return "#f59e0b"; // amber
  return "#22c55e"; // green
}

export function ScoreRing({
  score,
  label,
  sectorAverage,
}: {
  score: number;
  label: string;
  sectorAverage: number;
}) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (animated / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Ring */}
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-[-0.04em]">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color }}>
          {label}
        </p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Yapay Zeka Gorunurluk Puani
        </p>
      </div>

      {/* Sector comparison bar */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sen: {score}</span>
          <span>Sektör ort: {sectorAverage}</span>
        </div>
        <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animated}%`, backgroundColor: color }}
          />
          {/* Sector average marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/60"
            style={{ left: `${sectorAverage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
