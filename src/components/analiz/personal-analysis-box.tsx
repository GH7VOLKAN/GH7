"use client";

import { TrendingDown } from "lucide-react";

interface Props {
  brandName: string;
  analysis: string;
  monthlyLoss: number;
  yearlyLoss: number;
  competitorName?: string;
}

function formatAnalysisText(text: string, brandName: string, competitorName?: string): string {
  let formatted = text;
  // Bold brand name
  if (brandName) {
    const brandRegex = new RegExp(`\\b(${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
    formatted = formatted.replace(brandRegex, "**$1**");
  }
  // Bold competitor name
  if (competitorName) {
    const compRegex = new RegExp(`\\b(${competitorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
    formatted = formatted.replace(compRegex, "**$1**");
  }
  return formatted;
}

function renderWithBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function PersonalAnalysisBox({
  brandName,
  analysis,
  monthlyLoss,
  yearlyLoss,
  competitorName,
}: Props) {
  const formatted = formatAnalysisText(analysis, brandName, competitorName);

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50/50">
      {/* Loss Highlight */}
      {monthlyLoss > 0 && (
        <div className="flex items-start gap-4 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <TrendingDown className="w-6 h-6 text-red-600 shrink-0 mt-1" />
          <div>
            <p className="text-xs text-red-700 font-medium uppercase tracking-wide mb-1">
              Aylık Tahmini Kaybınız
            </p>
            <p className="text-3xl font-bold text-red-700">
              ₺{monthlyLoss.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Yıllık: ₺{yearlyLoss.toLocaleString("tr-TR")} · AI'larda görünmediğiniz için
            </p>
          </div>
        </div>
      )}

      {/* Analysis Text */}
      <div className="prose prose-sm max-w-none">
        {analysis.split(/\n\n+/).map((paragraph, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3">
            {renderWithBold(formatAnalysisText(paragraph, brandName, competitorName))}
          </p>
        ))}
      </div>
    </div>
  );
}
