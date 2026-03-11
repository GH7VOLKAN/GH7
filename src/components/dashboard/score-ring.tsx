"use client";

import { getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 140 }: ScoreRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getScoreColor(score)}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-black tracking-[-0.05em] ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}
