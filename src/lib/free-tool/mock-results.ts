import type {
  FreeToolInput,
  FreeToolResult,
  PlatformResult,
  PlatformId,
  CompetitorPreview,
} from "./types";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const platformMeta: { id: PlatformId; label: string }[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
];

// ── Kişisel excerpts ──────────────────────────────────
const kisiselFoundExcerpts = [
  (name: string, field: string, city: string) =>
    `${name}, ${city} merkezli bir ${field} olarak tanınmaktadır. Sektördeki çalışmaları ve dijital içerikleriyle dikkat çekmektedir. Özellikle ${field} alanında sıkça referans gösterilen isimler arasında yer almaktadır.`,
  (name: string, field: string, _city: string) =>
    `${field} alanında faaliyet gösteren ${name}, dijital içerikleri ve profesyonel profiliyle öne çıkmaktadır. AI platformları tarafından ${field} konusunda güvenilir bir kaynak olarak değerlendirilmektedir.`,
  (name: string, field: string, city: string) =>
    `${name}, ${city}'de aktif olarak çalışan ve ${field} alanında referans gösterilen bir profesyoneldir. Online varlığı ve sektörel katkıları AI tarafından tanınmasını sağlamaktadır.`,
  (name: string, field: string, _city: string) =>
    `${name} ismi ${field} alanında sıkça karşılaşılan ve önerilen bir uzmandır. Dijital ayak izi güçlü, sektörel içerikleri AI modellerinin eğitim verilerinde yer almaktadır.`,
];

const kisiselNotFoundExcerpts = [
  (name: string, field: string, _city: string) =>
    `${field} alanında "${name}" araması yapıldığında bu isme rastlanmamaktadır. AI, bu alanda farklı uzmanları önermekte ve referans göstermektedir.`,
  (name: string, _field: string, _city: string) =>
    `${name} hakkında yeterli dijital veri bulunamamıştır. AI platformları bu ismi tanıyamamakta, bunun yerine dijital varlığı daha güçlü profesyonelleri öne çıkarmaktadır.`,
  (name: string, field: string, _city: string) =>
    `Bu platformda ${name} yerine farklı ${field} profesyonelleri önerilmektedir. Dijital görünürlük eksikliği, AI'ın bu ismi tanımasını engellemektedir.`,
];

// ── Firma excerpts ────────────────────────────────────
const firmaFoundExcerpts = [
  (name: string, field: string, city: string) =>
    `${name}, ${city}'de ${field} sektöründe faaliyet gösteren bir marka olarak bahsedilmektedir. Web sitesi ve dijital varlıkları AI tarafından referans alınmaktadır.`,
  (name: string, field: string, _city: string) =>
    `${field} sektöründe ${name} markası, AI yanıtlarında önerilen firmalar arasında yer almaktadır. Site yapısı ve içerik kalitesi AI görünürlüğünü desteklemektedir.`,
  (name: string, field: string, city: string) =>
    `${name}, ${city} bölgesinde ${field} hizmeti veren ve sıkça referans gösterilen bir firmadır. Yapılandırılmış veri ve SEO altyapısı AI tarafından doğru yorumlanmaktadır.`,
  (name: string, field: string, _city: string) =>
    `${name} markası ${field} alanında AI yanıtlarında görünür durumdadır. Sektörel içerikleri ve müşteri referansları AI'ın bu markayı tanımasına katkı sağlamaktadır.`,
];

const firmaNotFoundExcerpts = [
  (name: string, field: string, _city: string) =>
    `${field} sektöründe "${name}" araması yapıldığında bu markaya rastlanmamaktadır. AI, bu sektörde dijital varlığı daha güçlü rakip firmaları önermektedir.`,
  (name: string, _field: string, _city: string) =>
    `${name} hakkında AI platformlarında yeterli bilgi bulunamamıştır. Site yapısı, yapılandırılmış veri eksikliği veya düşük dijital otorite bunun nedeni olabilir.`,
  (name: string, field: string, _city: string) =>
    `Bu platformda ${name} yerine ${field} sektöründeki farklı firmalar öne çıkmaktadır. SEO ve içerik stratejisi güçlendirilerek AI görünürlüğü artırılabilir.`,
];

// ── Rakip isimleri ────────────────────────────────────
const kisiselCompetitorNames = [
  "Dr. Mehmet Öz", "Prof. Ayşe Kılıç", "Ali Serkan Yıldız",
  "Zeynep Tunçer", "Burak Gökçe", "Deniz Atalay",
  "Can Sarıoğlu", "Elif Demir", "Murat Başaran",
  "Selin Koç", "Emre Aydın", "Gizem Yılmaz",
];

const firmaCompetitorNames = [
  "Turkuaz Digital", "NetPeak Agency", "Growth Lab",
  "Dijital Sahne", "SEO Master TR", "Brandify",
  "SektorUp", "AjansAI", "MetrikBilgi",
  "DataBridge", "Optimum360", "InnovaDigital",
];

// ── Pozisyonlar ───────────────────────────────────────
const foundPositions = [
  "İlk yanıtta bahsediliyor",
  "İkinci sırada öneriliyor",
  "Yanıtın detay kısmında",
  "Alternatifler arasında",
];

// ── Free Insight generators ───────────────────────────
function generateFreeInsights(
  input: FreeToolInput,
  platforms: PlatformResult[],
  overallScore: number,
  sectorAverage: number,
): string[] {
  const isKisisel = input.mode === "kisisel";
  const notFoundPlatforms = platforms.filter((p) => !p.found).map((p) => p.label);
  const foundPlatforms = platforms.filter((p) => p.found).map((p) => p.label);
  const subject = isKisisel ? "senin" : "markanızın";
  const entity = input.name;

  const insights: string[] = [];

  // Insight 1: Platform coverage
  if (notFoundPlatforms.length > 0) {
    const pctMap: Record<string, number> = {
      ChatGPT: 38, Claude: 18, Gemini: 28, Perplexity: 16,
    };
    const missedPct = notFoundPlatforms.reduce((sum, p) => sum + (pctMap[p] ?? 15), 0);
    insights.push(
      `${notFoundPlatforms.join(" ve ")} ${subject} tanımıyor — bu platformlar toplam AI sorgularının %${missedPct}'${missedPct > 50 ? "ini" : "sini"} oluşturuyor.`,
    );
  } else {
    insights.push(
      `Tüm AI platformları ${subject} tanıyor — bu çok nadir ve güçlü bir dijital varlık göstergesi.`,
    );
  }

  // Insight 2: Digital footprint
  if (overallScore < 50) {
    insights.push(
      isKisisel
        ? `Dijital iz analizi: ${entity} için LinkedIn profili, kişisel web sitesi veya blog içerik eksikliği tespit edildi. Bu, AI'ın seni tanımasını zorlaştırıyor.`
        : `Dijital varlık analizi: ${entity} için yapılandırılmış veri (Schema.org), blog içeriği veya sektörel dizin kaydı eksikliği tespit edildi.`,
    );
  } else {
    insights.push(
      isKisisel
        ? `Dijital iz analizi: ${entity} için çeşitli kaynaklarda referanslar bulundu. Ancak bazı platformlarda içerik tutarsızlıkları var.`
        : `Dijital varlık analizi: ${entity} web sitesi AI tarafından kısmen okunabiliyor ancak yapılandırılmış veri optimizasyonu ile skor artırılabilir.`,
    );
  }

  // Insight 3: Sector comparison
  const diff = sectorAverage - overallScore;
  if (diff > 10) {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamanın ${diff} puan altındasın. Acil aksiyon gerekli.`,
    );
  } else if (diff > 0) {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamaya yakınsın ancak üst sıralar için iyileştirme gerekli.`,
    );
  } else {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamanın üzerindesin. Pro ile bu avantajı koruyabilirsin.`,
    );
  }

  return insights;
}

// ── Main generator ────────────────────────────────────
export function generateMockResults(input: FreeToolInput): FreeToolResult {
  const seed = hashString(
    `${input.name.toLowerCase().trim()}:${input.field.toLowerCase().trim()}:${input.city.toLowerCase().trim()}`,
  );

  const isKisisel = input.mode === "kisisel";
  const foundExcerpts = isKisisel ? kisiselFoundExcerpts : firmaFoundExcerpts;
  const notFoundExcerpts = isKisisel ? kisiselNotFoundExcerpts : firmaNotFoundExcerpts;

  const platforms: PlatformResult[] = platformMeta.map((p, i) => {
    const platformSeed = (seed + i * 7919) % 100;
    const found = platformSeed > 35;

    const excerptPool = found ? foundExcerpts : notFoundExcerpts;
    const excerptIdx = (seed + i * 3) % excerptPool.length;
    const excerpt = excerptPool[excerptIdx](input.name, input.field, input.city);

    // Visibility score: found → 45-92, not found → 0-18
    const visibilityScore = found
      ? 45 + ((seed + i * 13) % 48)
      : (seed + i * 7) % 19;

    // Sentiment: found → mostly pozitif/nötr, not found → negatif
    const sentimentOptions = found
      ? (["pozitif", "pozitif", "nötr"] as const)
      : (["negatif", "negatif", "nötr"] as const);
    const sentiment = sentimentOptions[(seed + i * 5) % sentimentOptions.length];

    // Position
    const position = found
      ? foundPositions[(seed + i * 11) % foundPositions.length]
      : "Bahsedilmiyor";

    return {
      platform: p.id,
      label: p.label,
      found,
      excerpt,
      sentiment,
      position,
      visibilityScore,
    };
  });

  const score = platforms.filter((p) => p.found).length;

  // Overall score: weighted average of platform scores
  const overallScore = Math.round(
    platforms.reduce((sum, p) => sum + p.visibilityScore, 0) / platforms.length,
  );

  const scoreLabel =
    overallScore <= 25
      ? "Düşük"
      : overallScore <= 50
        ? "Orta"
        : overallScore <= 75
          ? "İyi"
          : "Mükemmel";

  // Sector average: 55-75 range
  const sectorAverage = 55 + (seed % 21);

  // Competitors
  const compNames = isKisisel ? kisiselCompetitorNames : firmaCompetitorNames;
  const competitors: CompetitorPreview[] = Array.from({ length: 3 }, (_, i) => ({
    name: compNames[(seed + i * 4) % compNames.length],
    score: 55 + ((seed + i * 17) % 40),
  })).sort((a, b) => b.score - a.score);

  const freeInsights = generateFreeInsights(input, platforms, overallScore, sectorAverage);

  return {
    input,
    platforms,
    score,
    overallScore,
    scoreLabel,
    sectorAverage,
    freeInsights,
    competitors,
  };
}
