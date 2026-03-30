"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Competitor {
  name: string;
  mentionRate: string; // e.g. "3/5 sorguda"
  change: string; // e.g. "→ aynı", "↑ geçen hafta 3.", "↓ düştü"
}

interface ProductRanking {
  product: string;
  competitors: Competitor[];
}

interface CompetitorAdvantage {
  text: string;
  hasIt: boolean; // true = competitor has it, false = competitor lacks it
  suggestion: string;
}

interface CompetitorDetail {
  advantages: CompetitorAdvantage[];
  userAdvantages: string[];
}

interface ProductSummary {
  product: string;
  rank: number;
  total: number;
  isLeader: boolean;
  behindText: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const BRAND_NAME = "ISITMAX";

const PRODUCTS = [
  "Yerden ısıtma kablosu",
  "Heat trace boru ısıtma",
  "Çatı kar buz eritme sistemi",
  "Varil ısıtma ceketi",
  "Sera ısıtma kablosu",
  "Karbon film ısıtıcı",
];

const SERVICES = ["Proje tasarımı", "Teknik destek"];

const PRODUCT_RANKINGS: ProductRanking[] = [
  {
    product: "Yerden ısıtma kablosu",
    competitors: [
      { name: "Warmup", mentionRate: "3/5 sorguda", change: "→ aynı" },
      {
        name: BRAND_NAME,
        mentionRate: "2/5 sorguda",
        change: "↑ geçen hafta 3.",
      },
      { name: "Giacomini", mentionRate: "2/5 sorguda", change: "↓ düştü" },
      { name: "Uponor", mentionRate: "1/5 sorguda", change: "→ aynı" },
    ],
  },
  {
    product: "Heat trace boru ısıtma",
    competitors: [
      {
        name: BRAND_NAME,
        mentionRate: "4/5 sorguda",
        change: "→ aynı",
      },
      { name: "Danfoss", mentionRate: "3/5 sorguda", change: "↓ düştü" },
      {
        name: "nVent Raychem",
        mentionRate: "2/5 sorguda",
        change: "→ aynı",
      },
      {
        name: "Thermon",
        mentionRate: "1/5 sorguda",
        change: "↑ geçen hafta 4.",
      },
    ],
  },
  {
    product: "Çatı kar buz eritme sistemi",
    competitors: [
      { name: "EasyHeat", mentionRate: "3/5 sorguda", change: "→ aynı" },
      {
        name: "WarmlyYours",
        mentionRate: "3/5 sorguda",
        change: "↑ geçen hafta 3.",
      },
      {
        name: BRAND_NAME,
        mentionRate: "2/5 sorguda",
        change: "→ aynı",
      },
    ],
  },
  {
    product: "Varil ısıtma ceketi",
    competitors: [
      {
        name: BRAND_NAME,
        mentionRate: "4/5 sorguda",
        change: "→ aynı",
      },
      {
        name: "RezistansMarket",
        mentionRate: "2/5 sorguda",
        change: "→ aynı",
      },
      {
        name: "BandHeater",
        mentionRate: "1/5 sorguda",
        change: "↓ düştü",
      },
    ],
  },
  {
    product: "Sera ısıtma kablosu",
    competitors: [
      { name: "Flora Sera", mentionRate: "3/5 sorguda", change: "→ aynı" },
      {
        name: BRAND_NAME,
        mentionRate: "2/5 sorguda",
        change: "↑ geçen hafta 3.",
      },
      { name: "AgriHeat", mentionRate: "1/5 sorguda", change: "→ aynı" },
    ],
  },
  {
    product: "Karbon film ısıtıcı",
    competitors: [
      { name: "Warmup", mentionRate: "3/5 sorguda", change: "→ aynı" },
      {
        name: BRAND_NAME,
        mentionRate: "2/5 sorguda",
        change: "→ aynı",
      },
      {
        name: "HeatTech",
        mentionRate: "1/5 sorguda",
        change: "↑ geçen hafta 3.",
      },
    ],
  },
];

const COMPETITOR_DETAILS: Record<string, Record<string, CompetitorDetail>> = {
  Warmup: {
    "Yerden ısıtma kablosu": {
      advantages: [
        {
          text: "YouTube'da kurulum videoları var (12 video)",
          hasIt: true,
          suggestion: "Sende yok → Video içerik üret",
        },
        {
          text: "Sayfalarında FAQ schema kullanıyor (8 sayfa)",
          hasIt: true,
          suggestion: "Sende 0 sayfa → Schema ekle",
        },
        {
          text: "Blog'da rehber serisi var (15 yazı)",
          hasIt: true,
          suggestion: "Sende 3 yazı → İçerik üret",
        },
        {
          text: "llms.txt dosyası yok",
          hasIt: false,
          suggestion: "Senin avantajın → Korumaya devam et",
        },
      ],
      userAdvantages: [
        "Heat trace'de lider",
        "Sera ısıtma'da tek referans",
        "Domain authority daha yüksek",
      ],
    },
    "Karbon film ısıtıcı": {
      advantages: [
        {
          text: "Uluslararası distribütör ağı geniş",
          hasIt: true,
          suggestion: "Türkiye odaklı içerik ile fark yarat",
        },
        {
          text: "Karbon film özel sayfası var (detaylı)",
          hasIt: true,
          suggestion: "Sende genel sayfa → Özel ürün sayfası oluştur",
        },
        {
          text: "llms.txt dosyası yok",
          hasIt: false,
          suggestion: "Senin avantajın → Korumaya devam et",
        },
      ],
      userAdvantages: [
        "Yerli üretim avantajı",
        "Teknik destek hızı daha iyi",
      ],
    },
  },
  Giacomini: {
    "Yerden ısıtma kablosu": {
      advantages: [
        {
          text: "50+ yıllık marka bilinirliği",
          hasIt: true,
          suggestion: "Niş uzmanlık ile fark yarat",
        },
        {
          text: "Bayii ağı çok geniş (200+ bayi)",
          hasIt: true,
          suggestion: "Online satış kanallarını güçlendir",
        },
        {
          text: "AI yanıtlarında kaynak çeşitliliği az",
          hasIt: false,
          suggestion: "Senin avantajın → Kaynak çeşitliliğini koru",
        },
      ],
      userAdvantages: [
        "Elektrikli ısıtma uzmanlığı",
        "Blog içerik sayısı daha fazla",
      ],
    },
  },
  Uponor: {
    "Yerden ısıtma kablosu": {
      advantages: [
        {
          text: "Global marka, çok dilli içerik",
          hasIt: true,
          suggestion: "Türkçe içerikte derinleş",
        },
        {
          text: "Teknik dokümantasyon çok detaylı",
          hasIt: true,
          suggestion: "Teknik dökümanlarını zenginleştir",
        },
      ],
      userAdvantages: [
        "Elektrikli sistem uzmanlığı (Uponor sulu sistem)",
        "Daha hızlı teknik destek",
      ],
    },
  },
  Danfoss: {
    "Heat trace boru ısıtma": {
      advantages: [
        {
          text: "Endüstriyel referanslar çok fazla",
          hasIt: true,
          suggestion: "Referans sayfası oluştur, vaka çalışmaları ekle",
        },
        {
          text: "Teknik PDF'ler AI tarafından indeksleniyor",
          hasIt: true,
          suggestion: "PDF'lerini AI-friendly formata çevir",
        },
        {
          text: "Türkçe içerik az",
          hasIt: false,
          suggestion: "Senin avantajın → Türkçe içeriği artır",
        },
      ],
      userAdvantages: [
        "Türkiye'de yerel üretim",
        "Türkçe teknik destek",
        "Daha uygun fiyat noktası",
      ],
    },
  },
  "nVent Raychem": {
    "Heat trace boru ısıtma": {
      advantages: [
        {
          text: "Petrokimya sektöründe güçlü referanslar",
          hasIt: true,
          suggestion: "Sektör bazlı içerik üret",
        },
        {
          text: "llms.txt dosyası yok",
          hasIt: false,
          suggestion: "Senin avantajın → Korumaya devam et",
        },
      ],
      userAdvantages: [
        "Daha geniş ürün yelpazesi",
        "Yerel stok avantajı",
      ],
    },
  },
  Thermon: {
    "Heat trace boru ısıtma": {
      advantages: [
        {
          text: "Uluslararası sertifikalar (ATEX, IECEx)",
          hasIt: true,
          suggestion: "Sertifika bilgilerini sayfana ekle",
        },
      ],
      userAdvantages: [
        "Türkiye pazarında daha tanınır",
        "Fiyat avantajı",
        "Hızlı teslimat",
      ],
    },
  },
  EasyHeat: {
    "Çatı kar buz eritme sistemi": {
      advantages: [
        {
          text: "ABD pazarında çok sayıda kullanıcı yorumu",
          hasIt: true,
          suggestion: "Türkiye'den müşteri yorumları topla",
        },
        {
          text: "Amazon'da en çok satan ürün",
          hasIt: true,
          suggestion: "E-ticaret platformlarına gir",
        },
      ],
      userAdvantages: [
        "Türkiye iklimine uygun ürünler",
        "Yerel teknik destek",
      ],
    },
  },
  WarmlyYours: {
    "Çatı kar buz eritme sistemi": {
      advantages: [
        {
          text: "Kapsamlı hesaplama araçları (online kalkülator)",
          hasIt: true,
          suggestion: "Web sitene hesaplama aracı ekle",
        },
        {
          text: "Detaylı kurulum kılavuzları",
          hasIt: true,
          suggestion: "Kurulum rehberi içeriği üret",
        },
        {
          text: "Türkçe içerik yok",
          hasIt: false,
          suggestion: "Senin avantajın → Türkçe içeriği koru",
        },
      ],
      userAdvantages: [
        "Türk pazarını biliyor",
        "Proje tasarım hizmeti",
      ],
    },
  },
  RezistansMarket: {
    "Varil ısıtma ceketi": {
      advantages: [
        {
          text: "Fiyat odaklı pazarlama yapıyor",
          hasIt: true,
          suggestion: "Kalite ve garanti avantajını öne çıkar",
        },
        {
          text: "Marka bilinirliği düşük",
          hasIt: false,
          suggestion: "Senin avantajın → Marka gücünü kullan",
        },
      ],
      userAdvantages: [
        "Daha geniş ürün gamı",
        "Endüstriyel referanslar",
        "Teknik destek kalitesi",
      ],
    },
  },
  BandHeater: {
    "Varil ısıtma ceketi": {
      advantages: [
        {
          text: "Niş odaklı web sitesi",
          hasIt: true,
          suggestion: "Varil ısıtma için özel landing page yap",
        },
      ],
      userAdvantages: [
        "Çok daha geniş ürün yelpazesi",
        "Endüstriyel müşteri tabanı",
      ],
    },
  },
  "Flora Sera": {
    "Sera ısıtma kablosu": {
      advantages: [
        {
          text: "Sera sektörüne özel içerik üretiyor",
          hasIt: true,
          suggestion: "Sera kategorisinde blog içeriği artır",
        },
        {
          text: "Tarım fuarlarında aktif tanıtım",
          hasIt: true,
          suggestion: "Fuar katılımlarını içeriğe dönüştür",
        },
      ],
      userAdvantages: [
        "Elektrikli ısıtma uzmanlığı",
        "Daha güvenilir ürün kalitesi",
      ],
    },
  },
  AgriHeat: {
    "Sera ısıtma kablosu": {
      advantages: [
        {
          text: "İngilizce içerikle global erişim",
          hasIt: true,
          suggestion: "Türkçe arama trafiğinde avantajını koru",
        },
      ],
      userAdvantages: [
        "Türkiye pazarında daha tanınır",
        "Yerel destek ağı",
      ],
    },
  },
  HeatTech: {
    "Karbon film ısıtıcı": {
      advantages: [
        {
          text: "Karbon film konusunda özel YouTube kanalı",
          hasIt: true,
          suggestion: "Video içerik üretmeye başla",
        },
        {
          text: "AI yanıtlarında düşük çeşitlilik",
          hasIt: false,
          suggestion: "Senin avantajın → Kaynak çeşitliliğini koru",
        },
      ],
      userAdvantages: [
        "Daha geniş ürün yelpazesi",
        "Endüstriyel müşteri tabanı",
      ],
    },
  },
};

const PRODUCT_SUMMARIES: ProductSummary[] = [
  {
    product: "Yerden ısıtma kablosu",
    rank: 2,
    total: 4,
    isLeader: false,
    behindText: "Warmup'ın 1 sıra gerisinde",
  },
  {
    product: "Heat trace boru ısıtma",
    rank: 1,
    total: 4,
    isLeader: true,
    behindText: "",
  },
  {
    product: "Çatı kar buz eritme sistemi",
    rank: 3,
    total: 3,
    isLeader: false,
    behindText: "2 rakip önde",
  },
  {
    product: "Varil ısıtma ceketi",
    rank: 1,
    total: 3,
    isLeader: true,
    behindText: "",
  },
  {
    product: "Sera ısıtma kablosu",
    rank: 2,
    total: 3,
    isLeader: false,
    behindText: "1 rakip önde",
  },
  {
    product: "Karbon film ısıtıcı",
    rank: 2,
    total: 3,
    isLeader: false,
    behindText: "Warmup'ın 1 sıra gerisinde",
  },
];

// ---------------------------------------------------------------------------
// Helper: medal for rank
// ---------------------------------------------------------------------------

function medalForRank(rank: number): string {
  if (rank === 1) return "\u{1F947}";
  if (rank === 2) return "\u{1F948}";
  if (rank === 3) return "\u{1F949}";
  return "";
}

// ---------------------------------------------------------------------------
// Helper: progress bar
// ---------------------------------------------------------------------------

function ProgressBar({
  rank,
  total,
}: {
  rank: number;
  total: number;
}) {
  const filled = Math.round(((total - rank + 1) / total) * 10);
  const empty = 10 - filled;
  return (
    <span className="font-mono text-sm">
      <span className="text-gray-800">{"▓".repeat(filled)}</span>
      <span className="text-gray-300">{"░".repeat(empty)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface SeninYerineKimProps {
  userName: string;
}

export function SeninYerineKim({ userName }: SeninYerineKimProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<{
    name: string;
    product: string;
  } | null>(null);

  const detail =
    selectedCompetitor &&
    COMPETITOR_DETAILS[selectedCompetitor.name]?.[selectedCompetitor.product];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Senin Yerine Kim?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ürün/hizmet bazlı gerçek rakip tespiti ve sıralama
        </p>
      </div>

      {/* 5.1 — Ürün/Hizmet Haritası */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          {userName} — Ürün/Hizmet Haritanız
        </h2>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <span className="shrink-0">📦</span>
            <div>
              <span className="font-medium text-gray-700">Ürünler:</span>{" "}
              <span className="text-gray-600">
                {PRODUCTS.join(" · ")}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="shrink-0">🔧</span>
            <div>
              <span className="font-medium text-gray-700">Hizmetler:</span>{" "}
              <span className="text-gray-600">
                {SERVICES.join(" · ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5.2 — Ürün Bazlı Sıralama Tabloları */}
      {PRODUCT_RANKINGS.map((pr) => (
        <ProductRankingTable
          key={pr.product}
          ranking={pr}
          brandName={BRAND_NAME}
          onCompetitorClick={(name) =>
            setSelectedCompetitor({ name, product: pr.product })
          }
        />
      ))}

      {/* 5.4 — Genel Rekabet Özeti */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Genel Rekabet Özeti
        </h2>
        <div className="space-y-3">
          {PRODUCT_SUMMARIES.map((ps) => (
            <div
              key={ps.product}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="w-56 shrink-0 truncate text-gray-700">
                {ps.product}
              </span>
              <ProgressBar rank={ps.rank} total={ps.total} />
              <span className="text-gray-500">
                {ps.rank}/{ps.total}
              </span>
              {ps.isLeader ? (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  ✅ LİDER
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  ({ps.behindText})
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span className="font-medium">Genel:</span>{" "}
          {PRODUCT_SUMMARIES.filter((s) => s.isLeader).length} üründen{" "}
          {PRODUCT_SUMMARIES.filter((s) => s.isLeader).length}
          {"'"}
          {PRODUCT_SUMMARIES.filter((s) => s.isLeader).length === 2
            ? "si"
            : "i"}
          nde lider,{" "}
          {PRODUCT_SUMMARIES.filter((s) => !s.isLeader).length}
          {"'"}ünde yükselme potansiyeli var.
        </div>
      </div>

      {/* 5.3 — Rakip Derinlik Analizi Dialog */}
      <Dialog
        open={!!selectedCompetitor}
        onOpenChange={(open) => {
          if (!open) setSelectedCompetitor(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCompetitor?.name} — {selectedCompetitor?.product} Rakibi
            </DialogTitle>
            <DialogDescription>
              Neden önde olduğunu ve senin avantajlarını incele
            </DialogDescription>
          </DialogHeader>

          {detail ? (
            <div className="space-y-6">
              {/* Neden Önde */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Neden senden önde:
                </h3>
                <div className="space-y-2">
                  {detail.advantages.map((adv, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">
                          {adv.hasIt ? "✅" : "❌"}
                        </span>
                        <div>
                          <p className="text-sm text-gray-800">{adv.text}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {adv.hasIt ? "💡" : "🟢"} {adv.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senin Avantajların */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Senin Avantajların:
                </h3>
                <div className="space-y-1.5">
                  {detail.userAdvantages.map((adv, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-600">├──</span>
                      {adv}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Bu rakip için henüz detay analizi mevcut değil.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Ranking Table
// ---------------------------------------------------------------------------

function ProductRankingTable({
  ranking,
  brandName,
  onCompetitorClick,
}: {
  ranking: ProductRanking;
  brandName: string;
  onCompetitorClick: (name: string) => void;
}) {
  const brandRank =
    ranking.competitors.findIndex((c) => c.name === brandName) + 1;
  const isLeader = brandRank === 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span>📦</span>
        <h2 className="text-sm font-semibold text-gray-900">
          {ranking.product}
        </h2>
        {isLeader && (
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            ✅ LİDER
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="pb-2 pr-3 font-medium">Sıra</th>
              <th className="pb-2 pr-3 font-medium">Firma</th>
              <th className="pb-2 pr-3 font-medium">Mention Rate</th>
              <th className="pb-2 pr-3 font-medium">Değişim</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {ranking.competitors.map((comp, idx) => {
              const rank = idx + 1;
              const isBrand = comp.name === brandName;
              const medal = medalForRank(rank);

              return (
                <tr
                  key={comp.name}
                  className={`border-b border-gray-50 ${
                    isBrand ? "bg-gray-50 font-bold" : ""
                  }`}
                >
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {medal ? (
                      <span>
                        {medal} {rank}.
                      </span>
                    ) : (
                      <span className="pl-5">{rank}.</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    {comp.name}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600">
                    {comp.mentionRate}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 text-xs">
                    {comp.change}
                  </td>
                  <td className="py-2.5">
                    {!isBrand && (
                      <button
                        type="button"
                        onClick={() => onCompetitorClick(comp.name)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                      >
                        Neden Önde?
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ajansınıza Gönderin button */}
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-gray-600"
          onClick={() => window.location.href = '/panel/ajans-paketleri'}
        >
          <Send className="mr-1.5 size-3.5" />
          Ajansınıza Gönderin
        </Button>
      </div>
    </div>
  );
}
