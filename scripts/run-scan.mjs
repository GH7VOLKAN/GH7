/**
 * Standalone scan script — runs outside Next.js
 * Replaces the scan engine logic for local execution
 * Usage: node scripts/run-scan.mjs
 */
import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname, override: true });

const BRAND_ID = "cmmoqeny10001js04ualn38o8";
const PROMPT_BATCH_SIZE = 5;

// ─── Prisma Client ───
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

// ─── AI Providers ───
const { default: Anthropic } = await import("@anthropic-ai/sdk");
const { default: OpenAI } = await import("openai");
const { GoogleGenerativeAI } = await import("@google/generative-ai");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000 })
  : null;
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30000 })
  : null;
const google = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;
const perplexityKey = process.env.PERPLEXITY_API_KEY || null;

const analyzerClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 15000 })
  : null;

async function sendToOpenAI(promptText) {
  if (!openai) return { platform: "chatgpt", content: "", error: "No key" };
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini", max_tokens: 2048,
      messages: [{ role: "user", content: promptText }],
    });
    return { platform: "chatgpt", content: r.choices[0]?.message?.content ?? "" };
  } catch (err) {
    return { platform: "chatgpt", content: "", error: err.message };
  }
}

async function sendToClaude(promptText) {
  if (!anthropic) return { platform: "claude", content: "", error: "No key" };
  try {
    const r = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001", max_tokens: 2048,
      messages: [{ role: "user", content: promptText }],
    });
    const text = r.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    return { platform: "claude", content: text };
  } catch (err) {
    return { platform: "claude", content: "", error: err.message };
  }
}

async function sendToGemini(promptText) {
  if (!google) return { platform: "gemini", content: "", error: "No key" };
  try {
    const model = google.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { maxOutputTokens: 2048 } });
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 30000));
    const result = await Promise.race([model.generateContent(promptText), timeout]);
    return { platform: "gemini", content: result.response.text() };
  } catch (err) {
    return { platform: "gemini", content: "", error: err.message };
  }
}

async function sendToPerplexity(promptText) {
  if (!perplexityKey) return { platform: "perplexity", content: "", error: "No key" };
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${perplexityKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: promptText }], max_tokens: 2048 }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return { platform: "perplexity", content: "", error: `HTTP ${res.status}` };
    const data = await res.json();
    return { platform: "perplexity", content: data.choices?.[0]?.message?.content ?? "", citations: data.citations ?? [] };
  } catch (err) {
    return { platform: "perplexity", content: "", error: err.message };
  }
}

const providers = [
  ...(openai ? [sendToOpenAI] : []),
  ...(anthropic ? [sendToClaude] : []),
  ...(google ? [sendToGemini] : []),
  ...(perplexityKey ? [sendToPerplexity] : []),
];
const platformNames = [
  ...(openai ? ["chatgpt"] : []),
  ...(anthropic ? ["claude"] : []),
  ...(google ? ["gemini"] : []),
  ...(perplexityKey ? ["perplexity"] : []),
];

// ─── Analyzer ───
const ANALYSIS_SYSTEM = `Sen bir marka bahsedilme analizcisisin. Bir AI platformunun verdiği yanıtı analiz edip markanın nasıl bahsedildiğini belirle.

JSON formatında yanıt ver (başka bir şey yazma):
{
  "mentioned": boolean,
  "position": "1. sıra" | "2. sıra" | "3. sıra" | "bahsediliyor" | null,
  "sentiment": "pozitif" | "nötr" | "negatif",
  "excerpt": "en fazla 200 karakter, markanın bahsedildiği kısım",
  "citations": ["url1", "url2"]
}`;

function extractUrls(text) {
  return [...new Set((text.match(/https?:\/\/[^\s)>"'\]]+/g) ?? []))];
}

function extractExcerpt(text, brandName) {
  const idx = text.toLowerCase().indexOf(brandName.toLowerCase());
  if (idx === -1) return text.slice(0, 200);
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + brandName.length + 150);
  return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
}

async function analyzeResponse(rawResponse, brandName) {
  const lowerResponse = rawResponse.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  if (!lowerResponse.includes(lowerBrand)) {
    return { mentioned: false, position: null, sentiment: null, excerpt: null, citations: extractUrls(rawResponse) };
  }

  if (!analyzerClient) {
    return { mentioned: true, position: "bahsediliyor", sentiment: "nötr", excerpt: extractExcerpt(rawResponse, brandName), citations: extractUrls(rawResponse) };
  }

  try {
    const r = await analyzerClient.messages.create({
      model: "claude-haiku-4-5-20251001", max_tokens: 512,
      system: ANALYSIS_SYSTEM,
      messages: [{ role: "user", content: `Marka: "${brandName}"\n\nAI Platformunun Yanıtı:\n${rawResponse.slice(0, 3000)}` }],
    });
    const text = r.content.filter(b => b.type === "text").map(b => b.text).join("");
    const parsed = JSON.parse(text);
    return {
      mentioned: parsed.mentioned ?? true,
      position: parsed.position ?? "bahsediliyor",
      sentiment: parsed.sentiment ?? "nötr",
      excerpt: parsed.excerpt?.slice(0, 200) ?? extractExcerpt(rawResponse, brandName),
      citations: [...new Set([...(parsed.citations ?? []), ...extractUrls(rawResponse)])],
    };
  } catch {
    return { mentioned: true, position: "bahsediliyor", sentiment: "nötr", excerpt: extractExcerpt(rawResponse, brandName), citations: extractUrls(rawResponse) };
  }
}

// ─── Main ───
async function main() {
  const brand = await prisma.brand.findUnique({ where: { id: BRAND_ID } });
  if (!brand) { console.error("Brand not found"); process.exit(1); }

  const prompts = await prisma.prompt.findMany({ where: { brandId: BRAND_ID, isActive: true } });
  console.log(`\n🚀 Starting scan for ${brand.name}: ${prompts.length} prompts × ${providers.length} platforms = ${prompts.length * providers.length} calls\n`);

  // Cleanup stuck scans
  await prisma.scan.updateMany({
    where: { brandId: BRAND_ID, status: "running", startedAt: { lt: new Date(Date.now() - 600000) } },
    data: { status: "failed", completedAt: new Date() },
  });

  const scan = await prisma.scan.create({ data: { brandId: BRAND_ID, status: "running" } });
  console.log(`Scan ID: ${scan.id}`);

  let totalResults = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (let batchStart = 0; batchStart < prompts.length; batchStart += PROMPT_BATCH_SIZE) {
    const batch = prompts.slice(batchStart, batchStart + PROMPT_BATCH_SIZE);
    const batchNum = Math.floor(batchStart / PROMPT_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(prompts.length / PROMPT_BATCH_SIZE);
    const batchTimer = Date.now();

    const batchResults = await Promise.allSettled(
      batch.map(async (prompt, promptIdx) => {
        const globalIdx = batchStart + promptIdx + 1;

        const platformResults = await Promise.allSettled(
          providers.map(async (sendFn) => {
            const aiResponse = await sendFn(prompt.text);

            let analysis;
            if (aiResponse.error) {
              analysis = { mentioned: false, position: null, sentiment: null, excerpt: null, citations: [] };
            } else {
              analysis = await analyzeResponse(aiResponse.content, brand.name);
              if (aiResponse.citations?.length) {
                analysis.citations = [...new Set([...analysis.citations, ...aiResponse.citations])];
              }
            }

            await prisma.promptResult.create({
              data: {
                scanId: scan.id, promptId: prompt.id,
                platform: aiResponse.platform, mentioned: analysis.mentioned,
                position: analysis.position, sentiment: analysis.sentiment,
                excerpt: analysis.excerpt, citations: analysis.citations,
              },
            });
            totalResults++;
          })
        );

        const failed = platformResults.filter(r => r.status === "rejected");
        totalErrors += failed.length;
        for (const f of failed) console.error(`  ❌ Prompt ${globalIdx} error:`, f.reason?.message ?? f.reason);
      })
    );

    const batchMs = Date.now() - batchTimer;
    console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} prompts) done in ${(batchMs / 1000).toFixed(1)}s — ${totalResults}/${prompts.length * providers.length} total`);
  }

  // ─── Score calculation ───
  console.log("\n📊 Calculating scores...");
  const allResults = await prisma.promptResult.findMany({ where: { scanId: scan.id } });

  let totalPoints = 0;
  for (const r of allResults) {
    if (!r.mentioned) continue;
    switch (r.position) {
      case "1. sıra": totalPoints += 100; break;
      case "2. sıra": totalPoints += 75; break;
      case "3. sıra": totalPoints += 50; break;
      default: totalPoints += 25;
    }
  }
  const mentionScore = Math.round((totalPoints / (allResults.length * 100)) * 100);

  const latestScore = await prisma.scoreHistory.findFirst({ where: { brandId: BRAND_ID }, orderBy: { date: "desc" } });
  const readinessScore = latestScore?.readinessScore ?? 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  await prisma.scoreHistory.upsert({
    where: { brandId_date: { brandId: BRAND_ID, date: today } },
    update: { mentionScore },
    create: { brandId: BRAND_ID, date: today, mentionScore, readinessScore },
  });
  console.log(`  Mention Score: ${mentionScore}/100`);

  // ─── Competitor scoring ───
  console.log("\n🏆 Scoring competitors...");
  const competitors = await prisma.competitor.findMany({ where: { brandId: BRAND_ID } });

  for (const comp of competitors) {
    const platformCounts = { chatgpt: { m: 0, t: 0 }, claude: { m: 0, t: 0 }, gemini: { m: 0, t: 0 }, perplexity: { m: 0, t: 0 } };
    const nameLower = comp.name.toLowerCase();

    for (const r of allResults) {
      if (!platformCounts[r.platform]) continue;
      platformCounts[r.platform].t++;
      if (r.excerpt?.toLowerCase().includes(nameLower)) platformCounts[r.platform].m++;
    }

    const platforms = {};
    let compMentioned = 0, compTotal = 0;
    for (const [plat, c] of Object.entries(platformCounts)) {
      platforms[plat] = c.t > 0 ? Math.round((c.m / c.t) * 100) : 0;
      compMentioned += c.m;
      compTotal += c.t;
    }
    const compScore = compTotal > 0 ? Math.round((compMentioned / compTotal) * 100) : 0;

    await prisma.competitor.update({ where: { id: comp.id }, data: { platforms, mentionScore: compScore } });
    console.log(`  ${comp.name}: ${compScore}% (${compMentioned}/${compTotal})`);
  }

  // ─── Source discovery ───
  console.log("\n🔗 Discovering sources...");
  const allUrls = [];
  for (const r of allResults) {
    const cits = r.citations;
    if (Array.isArray(cits)) allUrls.push(...cits);
  }

  if (allUrls.length > 0) {
    const domainMap = new Map();
    for (const url of allUrls) {
      try {
        const hostname = new URL(url).hostname.replace(/^www\./, "");
        if (!domainMap.has(hostname)) domainMap.set(hostname, new Set());
        domainMap.get(hostname).add(url);
      } catch {}
    }

    const existing = await prisma.sourceDomain.findMany({ where: { brandId: BRAND_ID }, select: { id: true, domain: true, urls: true } });
    const existingMap = new Map(existing.map(s => [s.domain, s]));
    let created = 0, updated = 0;

    for (const [domain, urls] of domainMap) {
      const urlArray = [...urls];
      const usagePercent = Math.round((urlArray.length / allUrls.length) * 100);
      const ex = existingMap.get(domain);
      if (ex) {
        const merged = [...new Set([...(ex.urls ?? []), ...urlArray])];
        await prisma.sourceDomain.update({ where: { id: ex.id }, data: { urls: merged, usagePercent, avgCitations: urlArray.length } });
        updated++;
      } else {
        let type = "kurumsal";
        if (/reddit|quora|forum|eksi/.test(domain)) type = "ugc";
        else if (/news|hurriyet|haberturk|milliyet/.test(domain)) type = "medya";
        else if (/google|yelp|wikipedia/.test(domain)) type = "referans";
        else if (/sikayetvar|sahibinden|hepsiburada/.test(domain)) type = "dizin";
        await prisma.sourceDomain.create({ data: { brandId: BRAND_ID, domain, type, usagePercent, avgCitations: urlArray.length, urls: urlArray } });
        created++;
      }
    }
    console.log(`  ${created} new, ${updated} updated domains`);
  }

  // ─── Complete ───
  await prisma.scan.update({ where: { id: scan.id }, data: { status: "completed", completedAt: new Date() } });
  const totalMs = Date.now() - startTime;
  const mentioned = allResults.filter(r => r.mentioned).length;

  console.log(`\n✅ Scan complete in ${Math.round(totalMs / 1000)}s`);
  console.log(`   ${totalResults} results (${totalErrors} errors)`);
  console.log(`   ${mentioned}/${allResults.length} mentioned (${mentionScore}/100 score)`);
  console.log(`   ${allUrls.length} citations found`);

  await prisma.$disconnect();
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
