/**
 * Brand + Competitor Text Highlighting
 *
 * AI yanıtlarında marka adını yeşil, rakip isimlerini turuncu renkle vurgular.
 * Turkish-aware — "İ/i" ve "I/ı" farkını normalize ederek match yapar.
 *
 * Reuse: /analiz sonuç sayfası, /panel/aramalar/[promptId] detay sayfası.
 */

import type { ReactNode } from "react";
import { normalizeTurkish } from "@/lib/utils/turkish";

export interface HighlightOptions {
  brandClassName?: string;
  competitorClassName?: string;
}

const DEFAULT_BRAND_CLASS =
  "bg-green-100 text-green-800 px-0.5 rounded font-medium";
const DEFAULT_COMPETITOR_CLASS =
  "bg-orange-100 text-orange-800 px-0.5 rounded";

/**
 * Metin içindeki marka ve rakip isimlerini <mark> ile sarar.
 *
 * @param text — Orijinal metin (AI yanıtı)
 * @param brandName — Marka adı (yeşil highlight)
 * @param competitors — Rakip isimleri (turuncu highlight)
 * @param options — Özel className override
 */
export function highlightBrandAndCompetitors(
  text: string,
  brandName: string,
  competitors: string[],
  options: HighlightOptions = {},
): ReactNode[] {
  if (!text || !brandName) return [text];

  const brandClass = options.brandClassName ?? DEFAULT_BRAND_CLASS;
  const competitorClass = options.competitorClassName ?? DEFAULT_COMPETITOR_CLASS;

  // Build list of names — brand + unique competitors
  const entries: { name: string; type: "brand" | "competitor" }[] = [
    { name: brandName, type: "brand" },
    ...competitors
      .filter((c) => c && c.toLowerCase() !== brandName.toLowerCase())
      .map((c) => ({ name: c, type: "competitor" as const })),
  ];

  // Sort by length (longest first) to avoid partial matches
  entries.sort((a, b) => b.name.length - a.name.length);

  const escapedNames = entries.map((e) =>
    e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  if (escapedNames.length === 0) return [text];

  const pattern = new RegExp(`(${escapedNames.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const normalized = normalizeTurkish(part);
    const match = entries.find(
      (e) => normalizeTurkish(e.name) === normalized,
    );
    if (match) {
      const className =
        match.type === "brand" ? brandClass : competitorClass;
      return (
        <mark key={i} className={className}>
          {part}
        </mark>
      );
    }
    return part;
  });
}
