import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname, override: true });

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

async function querySonar(prompt) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not found in .env.local");
  const res = await fetch(PERPLEXITY_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: prompt }], max_tokens: 3000 }),
  });
  if (!res.ok) throw new Error("Sonar error: " + res.status + " " + await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

console.log("Step 1: Running Sonar queries...");

const q1 = `ISITMAX isitmax.com firmasının Türkiye'deki doğrudan rakipleri kimler? Bu firma elektrikli yerden ısıtma, heat trace, endüstriyel ısıtma, boru donma önleme alanında faaliyet gösteriyor. Aynı ürün/hizmet kategorisinde olan firmalar, web siteleri ve ana ürünleri neler? Önemli: Sadece AYNI alt kategorideki firmalar (elektrikli ısıtma ile sulu ısıtma farklı kategoriler).`;
const q2 = `elektrikli yerden ısıtma, heat trace, endüstriyel ısıtma, boru donma önleme sektöründe Türkiye ve dünyada faaliyet gösteren firmalar hangileri? Her birinin web sitesi, ana ürünleri ve hangi alt kategoride olduğu nedir? Detaylı liste ver. Türkiye pazarındaki firmalara öncelik ver.`;

const [r1, r2] = await Promise.all([querySonar(q1), querySonar(q2)]);
console.log("Sonar result 1 length:", r1.length);
console.log("Sonar result 2 length:", r2.length);

const sonarResearch = r1 + "\n\n--- ARASTIRMA 2 ---\n\n" + r2;

console.log("\nStep 2: Running Claude Opus analysis...");

const { default: Anthropic } = await import("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 120000 });

const prompt = `Sen GH7.ai'nin rakip analiz motorusun. Bir firmanin GERCEK rakiplerini belirleyeceksin.

KRITIK KURAL: Rakipler AYNI URUN KATEGORISINDE olmali. Sadece benzer sektor yetmez!

ORNEKLER:
- ISITMAX elektrikli yerden isitma ve heat trace yapiyorsa:
  - YANLIS rakipler: Warmhaus, Rehau, Uponor, Vaillant (bunlar SULU sistem firmalari - farkli urun kategorisi!)
  - DOGRU rakipler: Nexans, Devi/Danfoss, Ensto, Thermopads (bunlar ELEKTRIKLI isitma - ayni kategori!)

FIRMA BILGILERI:
- Ad: ISITMAX
- Domain: isitmax.com
- Sektor: elektrikli yerden isitma
- Uzmanlik Alanlari: elektrikli yerden isitma, heat trace, endustriyel isitma, boru donma onleme
- Sehir: Istanbul
- Tip: firma

WEB ARASTIRMA SONUCLARI (Perplexity Sonar ile gercek zamanli):
${sonarResearch.slice(0, 8000)}

GOREV:
1. Firma bilgilerini ve web arastirmasini analiz et
2. Firmanin TAM OLARAK ne yaptigini anla
3. AYNI urun kategorisinde GERCEK rakipleri belirle

SADECE JSON dondur:
{
  "nicheDescription": "Firmanin nisi ve alt kategorisi - 1-2 cumle",
  "competitors": [
    {
      "name": "Firma Adi",
      "domain": "firma.com",
      "reason": "Neden bu firma dogrudan rakip - max 2 cumle",
      "products": ["urun1", "urun2"],
      "relevance": "direct"
    }
  ]
}

KURALLAR:
- 5-10 rakip dondur (Turkiye ve global)
- "direct": Ayni urun kategorisinde
- "indirect": Yakin kategoride
- Turkiye firmalarina agirlik ver`;

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  messages: [{ role: "user", content: prompt }],
});

const text = response.content[0].type === "text" ? response.content[0].text : "";
console.log("\nClaude Opus response length:", text.length);

const jsonMatch = text.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  const parsed = JSON.parse(jsonMatch[0]);
  console.log("\n=== KESFEDILEN RAKIPLER ===");
  console.log("Nis:", parsed.nicheDescription);
  console.log("\nRakipler:");
  for (const c of parsed.competitors || []) {
    console.log(`  - ${c.name} (${c.domain}) [${c.relevance}]`);
    console.log(`    Neden: ${c.reason}`);
    console.log(`    Urunler: ${(c.products || []).join(", ")}`);
  }

  // Save to DB using dynamic import
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const brandId = "cmmoqeny10001js04ualn38o8";

  for (const c of (parsed.competitors || []).slice(0, 10)) {
    await prisma.competitor.create({
      data: {
        brandId,
        name: c.name || "",
        domain: c.domain || "",
        mentionScore: 0,
        readinessScore: 0,
        platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
        reason: c.reason || "",
        products: c.products || [],
        relevance: c.relevance || "direct",
        source: "ai_discovered",
        discoveredAt: new Date(),
      }
    });
  }
  console.log(`\nSaved ${Math.min((parsed.competitors || []).length, 10)} competitors to DB`);
  await prisma.$disconnect();
} else {
  console.error("Could not extract JSON from response");
  console.log(text);
}
