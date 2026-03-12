import type {
  FreeToolInput,
  FreeToolResult,
  PlatformResult,
  PlatformId,
} from "./types";

// Simple deterministic hash from string → number
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

const kisiselFoundExcerpts = [
  (name: string, field: string, city: string) =>
    `${name}, ${city} merkezli bir ${field} olarak tanınmaktadır. Sektördeki çalışmalarıyla dikkat çekmektedir.`,
  (name: string, field: string) =>
    `${field} alanında faaliyet gösteren ${name}, özellikle dijital içerikleriyle öne çıkmaktadır.`,
  (name: string, _field: string, city: string) =>
    `${name}, ${city}'de aktif olarak çalışan ve sektörde referans gösterilen bir profesyoneldir.`,
  (name: string, field: string) =>
    `${name} ismi ${field} alanında sıkça karşılaşılan ve önerilen bir uzmandır.`,
];

const kisiselNotFoundExcerpts = [
  (name: string, field: string) =>
    `${field} alanında arama yapıldığında ${name} ismine rastlanmamıştır. Farklı uzmanlar önerilmektedir.`,
  (name: string) =>
    `${name} hakkında yeterli dijital veri bulunamamıştır. Tanınırlık düşük görünmektedir.`,
  (_name: string, field: string) =>
    `Bu alanda farklı ${field} profesyonelleri önerilmektedir.`,
];

const firmaFoundExcerpts = [
  (name: string, field: string, city: string) =>
    `${name}, ${city}'de ${field} sektöründe faaliyet gösteren bir marka olarak bahsedilmektedir.`,
  (name: string, field: string) =>
    `${field} sektöründe ${name} markası önerilen firmalar arasında yer almaktadır.`,
  (name: string, _field: string, city: string) =>
    `${name}, ${city} bölgesinde hizmet veren ve sıkça referans gösterilen bir firmadır.`,
  (name: string, field: string) =>
    `${name} markası ${field} alanında AI yanıtlarında görünür durumdadır.`,
];

const firmaNotFoundExcerpts = [
  (name: string, field: string) =>
    `${field} sektöründe ${name} markasına rastlanmamıştır. Rakip firmalar önerilmektedir.`,
  (name: string) =>
    `${name} hakkında AI platformlarında yeterli bilgi bulunamamıştır.`,
  (_name: string, field: string) =>
    `Bu sektörde farklı ${field} firmaları öne çıkmaktadır.`,
];

export function generateMockResults(input: FreeToolInput): FreeToolResult {
  const seed = hashString(
    `${input.name.toLowerCase().trim()}:${input.field.toLowerCase().trim()}:${input.city.toLowerCase().trim()}`
  );

  const isKisisel = input.mode === "kisisel";
  const foundExcerpts = isKisisel ? kisiselFoundExcerpts : firmaFoundExcerpts;
  const notFoundExcerpts = isKisisel
    ? kisiselNotFoundExcerpts
    : firmaNotFoundExcerpts;

  const platforms: PlatformResult[] = platformMeta.map((p, i) => {
    // Each platform gets a deterministic found/not-found based on hash
    const platformSeed = (seed + i * 7919) % 100;
    const found = platformSeed > 35; // ~65% chance found for demo
    const excerptPool = found ? foundExcerpts : notFoundExcerpts;
    const excerptIdx = (seed + i * 3) % excerptPool.length;
    const excerpt = excerptPool[excerptIdx](input.name, input.field, input.city);

    return {
      platform: p.id,
      label: p.label,
      found,
      excerpt,
    };
  });

  const score = platforms.filter((p) => p.found).length;

  const subjectLabel = isKisisel ? "senin" : "markanızın";
  const entityLabel = isKisisel ? input.name : input.name;

  return {
    input,
    platforms,
    score,
    blurredInsights: {
      alternativesTeaser: `${entityLabel} yerine hangi ${isKisisel ? "isimler" : "markalar"} öneriliyor? Pro ile gör.`,
      whyNotTeaser: `AI neden ${subjectLabel} tanımıyor? Detaylı analiz Pro'da.`,
      weeklyTrackingTeaser: `${entityLabel} için haftalık AI görünürlük takibi başlat.`,
    },
  };
}
