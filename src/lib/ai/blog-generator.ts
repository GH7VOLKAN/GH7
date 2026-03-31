/**
 * GH7.ai Blog Generator
 *
 * Her analiz sonrasi Opus ile 1500 kelimelik SEO uyumlu Turkce blog yazisi uretir.
 * Gunluk max 20 blog. Limit asilirsa status="queued", ertesi gun cron ile uretilir.
 * Blog basi ~$0.05, aylik max ~$30.
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { generateQuerySlug } from "@/lib/query-pages";

// ── Constants ──────────────────────────────────────
const DAILY_BLOG_LIMIT = 20;

const BLOG_SYSTEM_PROMPT = `Sen GH7.ai için SEO ve GEO uyumlu Türkçe blog yazıları üreten bir içerik uzmanısın.

Sana bir yapay zeka görünürlük analizinin verilerini göndereceğim: sorgu, firma sıralamaları, platform yanıtları, sektör bilgisi.

Bu verilerden 1500 kelimelik, SEO uyumlu, bilgilendirici ve ilgi çekici bir Türkçe blog yazısı üret.

FORMAT KURALLARI:
- Markdown formatında yaz
- H2 başlıklar kullan (## ile)
- En az 4-5 H2 bölüm olsun
- Paragraflar 3-4 cümle uzunluğunda
- Firma isimlerini kalın yaz (**FirmaAdı**)
- Listeleme gereken yerlerde madde işareti kullan
- Doğal, akıcı Türkçe — akademik değil, iş insanının anlayacağı dil
- "Yapay zeka", "AI görünürlük", "GEO" gibi anahtar kelimeleri doğal şekilde yerleştir

İÇERİK YAPISI:
1. Giriş: Sorgunun neden önemli olduğunu açıkla (2-3 paragraf)
2. Platform Analizi: Hangi AI platformları ne dedi, kim öne çıktı (en az 2 paragraf)
3. Sıralama Detayı: İlk 3 firmayı incele, neden bu sırada olduklarını yorumla
4. Sektörel Değerlendirme: Bu alandaki genel AI görünürlük durumu
5. Sonuç ve Öneriler: Bu sorgudan ne öğreniyoruz, ne yapılmalı

SON PARAGRAF: "Bu sıralama sürekli değişiyor. Kendi markanızın yapay zeka görünürlüğünü test etmek için GH7.ai ücretsiz analiz aracını kullanabilirsiniz." şeklinde CTA içersin.

ÖNEMLİ: Sadece markdown içerik dön. Başlık (H1) EKLEME — başlık ayrı alanda saklanacak.`;

// ── Types ──────────────────────────────────────────

export interface BlogGenerationInput {
  queryPageId: string;
  query: string;
  sector: string | null;
  queryType: string;
  firmRanking: Array<{
    firmName: string;
    platformCount: number;
    rankPosition: number;
  }>;
  platformResponses: Array<{
    platform: string;
    mentioned: boolean;
    response?: string;
  }>;
  summaryText: string | null;
  timesQueried: number;
  runDate?: Date;
  analysisType?: string;
  queryLanguage?: string;
}

export interface BlogGenerationResult {
  blogPostId: string;
  status: "published" | "queued";
}

// ── Helpers ────────────────────────────────────────

async function getTodayBlogCount(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return prisma.blogPost.count({
    where: {
      generatedAt: { gte: startOfDay },
      status: { in: ["draft", "published", "generating"] },
    },
  });
}

function getClient(): Anthropic {
  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

// ── Main Generator ─────────────────────────────────

export async function generateBlogFromAnalysis(
  input: BlogGenerationInput,
): Promise<BlogGenerationResult> {
  const slug = `blog-${generateQuerySlug(input.query)}`;
  const title = input.query;
  const ogImageUrl = `/api/og/${slug}`;
  const analysisType = input.analysisType ?? "firma";
  const queryLanguage = input.queryLanguage ?? "tr";

  // Top 3 rankings
  const top3 = (input.firmRanking ?? [])
    .sort((a, b) => (a.rankPosition ?? 99) - (b.rankPosition ?? 99))
    .slice(0, 3)
    .map((r) => ({
      name: r.firmName,
      position: r.rankPosition,
      platformCount: r.platformCount,
    }));

  // Platform list
  const platforms = (input.platformResponses ?? []).map((p) => ({
    platform: p.platform,
    mentioned: p.mentioned,
  }));

  // Check if BlogPost already exists for this QueryPage
  const existing = await prisma.blogPost.findUnique({
    where: { queryPageId: input.queryPageId },
  });

  // Check daily limit
  const todayCount = await getTodayBlogCount();
  if (todayCount >= DAILY_BLOG_LIMIT) {
    // Queue it for later
    if (existing) {
      await prisma.blogPost.update({
        where: { id: existing.id },
        data: { status: "queued", rankings: top3, platforms },
      });
      return { blogPostId: existing.id, status: "queued" };
    }
    const queued = await prisma.blogPost.create({
      data: {
        title,
        slug: await ensureUniqueSlug(slug),
        content: "",
        sectorTag: input.sector,
        analysisType,
        queryLanguage,
        rankings: top3,
        platforms,
        runCount: input.timesQueried,
        runDate: input.runDate ?? new Date(),
        ogImageUrl,
        status: "queued",
        queryPageId: input.queryPageId,
      },
    });
    console.log(`[blog-generator] Queued (daily limit): ${title.slice(0, 50)}`);
    return { blogPostId: queued.id, status: "queued" };
  }

  // Mark as generating
  const postId = existing?.id;
  if (postId) {
    await prisma.blogPost.update({
      where: { id: postId },
      data: { status: "generating" },
    });
  }

  try {
    const client = getClient();

    const userMessage = `Sorgu: "${input.query}"
Sektor: ${input.sector ?? "Genel"}
Sorgu Tipi: ${input.queryType}
Tekrar Sayisi: ${input.timesQueried}

Firma Siralamasi (AI yanitlarindan):
${top3.map((r, i) => `${i + 1}. ${r.name} — ${r.platformCount} platformda bahsediliyor`).join("\n")}

Platform Yanitlari:
${platforms.map((p) => `- ${p.platform}: ${p.mentioned ? "Marka bahsedildi" : "Marka bahsedilmedi"}`).join("\n")}

Ozet: ${input.summaryText ?? "Ozet mevcut degil."}`;

    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 6000,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: BLOG_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (!content || content.length < 200) {
      throw new Error("Generated content too short");
    }

    const metaDescription = (input.summaryText ?? input.query).slice(0, 155);
    const now = new Date();

    if (postId) {
      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          content,
          metaDescription,
          rankings: top3,
          platforms,
          runCount: input.timesQueried,
          runDate: input.runDate ?? now,
          ogImageUrl,
          status: "published",
          generatedAt: now,
          publishedAt: now,
        },
      });
      console.log(`[blog-generator] Updated: ${title.slice(0, 50)}`);
      return { blogPostId: postId, status: "published" };
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: await ensureUniqueSlug(slug),
        content,
        metaDescription,
        sectorTag: input.sector,
        analysisType,
        queryLanguage,
        rankings: top3,
        platforms,
        runCount: input.timesQueried,
        runDate: input.runDate ?? now,
        ogImageUrl,
        status: "published",
        generatedAt: now,
        publishedAt: now,
        queryPageId: input.queryPageId,
      },
    });

    console.log(`[blog-generator] Published: ${title.slice(0, 50)}`);
    return { blogPostId: post.id, status: "published" };
  } catch (error) {
    console.error("[blog-generator] Error:", error);
    // Revert to queued on failure
    if (postId) {
      await prisma.blogPost.update({
        where: { id: postId },
        data: { status: "queued" },
      });
    }
    throw error;
  }
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  const exists = await prisma.blogPost.findUnique({ where: { slug } });
  if (!exists) return slug;
  return `${slug}-${Date.now().toString(36)}`;
}
