/**
 * Fixed UI chrome strings, per language. Report *content* (titles, bodies,
 * FAQ, etc.) is produced in the target language by the engine; only these
 * fixed labels are translated here.
 */
import type { Lang } from "./types";

export interface ReportLabels {
  poweredBy: string;
  avgPosition: string;
  competitorsWhere: string;
  sourceOwn: string;
  sourceComp: string;
  sourceNeutral: string;
  sourceCount: string;
  gapWhyLosing: string;
  gapAddThis: string;
  gapFaq: string;
  gapSchema: string;
  gapActions: string;
  copy: string;
  copied: string;
}

export const labels: Record<Lang, ReportLabels> = {
  tr: {
    poweredBy: "GH7 · AI Görünürlük",
    avgPosition: "ort. sıra",
    competitorsWhere: "nerede",
    sourceOwn: "Senin siten",
    sourceComp: "Rakip",
    sourceNeutral: "Nötr kaynak",
    sourceCount: "atıf",
    gapWhyLosing: "Neden geride kalıyorsun",
    gapAddThis: "Eklemen gerekenler",
    gapFaq: "Hazır FAQ",
    gapSchema: "JSON-LD şema",
    gapActions: "Aksiyonlar",
    copy: "Kopyala",
    copied: "Kopyalandı",
  },
  en: {
    poweredBy: "GH7 · AI Visibility",
    avgPosition: "avg. rank",
    competitorsWhere: "where",
    sourceOwn: "Your site",
    sourceComp: "Competitor",
    sourceNeutral: "Neutral source",
    sourceCount: "citations",
    gapWhyLosing: "Why you're losing",
    gapAddThis: "What to add",
    gapFaq: "Ready FAQ",
    gapSchema: "JSON-LD schema",
    gapActions: "Actions",
    copy: "Copy",
    copied: "Copied",
  },
};
