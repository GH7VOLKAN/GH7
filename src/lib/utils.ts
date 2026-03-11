import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 60) return "text-score-high";
  if (score >= 35) return "text-score-mid";
  return "text-score-low";
}

export function getScoreBg(score: number): string {
  if (score >= 60) return "bg-score-high";
  if (score >= 35) return "bg-score-mid";
  return "bg-score-low";
}

export function formatTrend(trend: number): string {
  if (trend > 0) return `+${trend}`;
  return `${trend}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString("tr-TR");
}
