import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { NavSection } from "@/components/landing/nav-section";
import { FooterSection } from "@/components/landing/footer-section";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogFooterCTA } from "@/components/blog/blog-footer-cta";
import { marked } from "marked";

// Legacy static content for posts that predate the DB system
const LEGACY_POSTS: Record<string, { title: string; tag: string; date: string; paragraphs: string[] }> = {
  "geo-nedir-seodan-farki-ne": {
    title: "GEO Nedir? SEO\u2019dan Fark\u0131 Ne?",
    tag: "GEO Temelleri",
    date: "15 Mart 2026",
    paragraphs: [
      "Generative Engine Optimization (GEO), yapay zeka destekli arama motorlar\u0131n\u0131n ve sohbet botlar\u0131n\u0131n markan\u0131z\u0131 do\u011fru \u015fekilde tan\u0131mas\u0131n\u0131 ve \u00f6nermesini sa\u011flayan bir optimizasyon disiplinidir.",
      "ChatGPT, Claude, Gemini ve Perplexity gibi yapay zeka platformlar\u0131 art\u0131k kullan\u0131c\u0131lara do\u011frudan cevaplar \u00fcretiyor. Bu cevaplarda markan\u0131z\u0131n ge\u00e7ip ge\u00e7memesi, i\u015f sonu\u00e7lar\u0131n\u0131z\u0131 do\u011frudan etkiliyor.",
      "T\u00fcrkiye\u2019deki firmalar i\u00e7in GEO \u00f6zellikle kritik. Hen\u00fcz sekt\u00f6rde rekabet d\u00fc\u015f\u00fck oldu\u011fu i\u00e7in erken hareket edenler avantaj kazanacak.",
      "SEO ve GEO aras\u0131ndaki temel farklar: SEO anahtar kelime odakl\u0131, GEO anlam ve ba\u011flam odakl\u0131. SEO\u2019da ba\u011flant\u0131 profili \u00f6nemliyken, GEO\u2019da kaynak g\u00fcvenilirli\u011fi \u00f6n plana \u00e7\u0131kar.",
      "GEO stratejinizi olu\u015ftururken \u00fc\u00e7 temel alana dikkat edin: i\u00e7erik kalitesi, teknik altyap\u0131 (schema markup, llms.txt) ve \u00e7oklu platform varl\u0131\u011f\u0131.",
    ],
  },
  "isitma-sektoru-ai-gorunurluk-raporu": {
    title: "Is\u0131tma Sekt\u00f6r\u00fc AI G\u00f6r\u00fcn\u00fcrl\u00fck Raporu",
    tag: "Sektor Analizi",
    date: "10 Mart 2026",
    paragraphs: [
      "ISITMAX projesi kapsam\u0131nda toplanan veriler, \u0131s\u0131tma sekt\u00f6r\u00fcn\u00fcn yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fck durumunu ortaya koyuyor.",
      "Sekt\u00f6rdeki firmalar\u0131n yaln\u0131zca %12\u2019si yapay zeka platformlar\u0131nda d\u00fczg\u00fcn temsil ediliyor. Bu erken hareket edenler i\u00e7in f\u0131rsat.",
      "Yapay zeka platformlar\u0131 genellikle global markalar\u0131 \u00f6ne \u00e7\u0131kar\u0131yor. T\u00fcrk markalar\u0131 hedefli GEO \u00e7al\u0131\u015fmas\u0131yla fark yaratabilir.",
      "Yap\u0131land\u0131r\u0131lm\u0131\u015f veri kullanan firmalar\u0131n g\u00f6r\u00fcn\u00fcrl\u00fck skorlar\u0131 belirgin \u015fekilde y\u00fcksek.",
    ],
  },
  "saglik-turizmi-ve-ai": {
    title: "Sa\u011fl\u0131k Turizmi ve AI: Yabanc\u0131 Hastalar Sizi Buluyor mu?",
    tag: "Rehber",
    date: "5 Mart 2026",
    paragraphs: [
      "T\u00fcrkiye d\u00fcnyan\u0131n en \u00f6nemli sa\u011fl\u0131k turizmi destinasyonlar\u0131ndan biri. Ama yabanc\u0131 hastalar yapay zeka asistanlar\u0131na dan\u0131\u015f\u0131yor.",
      "\u0130ngilizce sorgularda T\u00fcrk klinikleri ciddi dezavantajda. Tayland ve G\u00fcney Kore klinikleri \u00f6nde.",
      "\u00c7ok dilli i\u00e7erik, uluslararas\u0131 platformlarda varl\u0131k ve hasta verilerinin yap\u0131land\u0131r\u0131lm\u0131\u015f sunumu kritik.",
      "GH7.ai Export mod\u00fcl\u00fc farkl\u0131 dillerde g\u00f6r\u00fcn\u00fcrl\u00fck \u00f6l\u00e7menize yard\u0131mc\u0131 oluyor.",
    ],
  },
  "schema-markup-rehberi": {
    title: "Schema Markup Rehberi: AI Botlar\u0131n\u0131n Dilinden Konu\u015fun",
    tag: "Teknik",
    date: "1 Mart 2026",
    paragraphs: [
      "Yap\u0131land\u0131r\u0131lm\u0131\u015f veri, web sitenizin i\u00e7eri\u011fini makinelerin anlayabilece\u011fi formatta sunar.",
      "En \u00f6nemli schema t\u00fcrleri: Organization, LocalBusiness, Product, FAQPage ve Review.",
      "JSON-LD format\u0131n\u0131 tercih edin, Google Rich Results Test ile do\u011frulama yap\u0131n.",
      "GH7.ai teknik analiz mod\u00fcl\u00fc schema markup durumunuzu otomatik tarar.",
    ],
  },
  "chatgpt-vs-gemini-karsilastirma": {
    title: "ChatGPT vs Gemini: Hangi AI Firman\u0131z\u0131 Daha \u00c7ok \u00d6neriyor?",
    tag: "Karsilastirma",
    date: "25 Subat 2026",
    paragraphs: [
      "Yapay zeka platformlar\u0131 farkl\u0131 algoritmalar kulland\u0131\u011f\u0131 i\u00e7in ayn\u0131 soruya farkl\u0131 yan\u0131tlar \u00fcretebilir.",
      "ChatGPT g\u00fcncel web verilerine eri\u015fiyor ve i\u00e7erik pazarlamas\u0131 g\u00fc\u00e7l\u00fc firmalar\u0131 \u00f6ne \u00e7\u0131kar\u0131yor. Gemini Google ekosistem verileriyle \u00e7al\u0131\u015f\u0131yor.",
      "ChatGPT i\u00e7in blog i\u00e7erikleri \u00f6nemliyken, Gemini i\u00e7in Google Haritalar yorumlar\u0131 ve i\u015fletme bilgileri a\u011f\u0131r bas\u0131yor.",
      "Ba\u015far\u0131l\u0131 GEO stratejisi t\u00fcm platformlarda tutarl\u0131 g\u00f6r\u00fcn\u00fcrl\u00fck hedeflemeli.",
    ],
  },
  "llms-txt-nedir": {
    title: "llms.txt Nedir ve Neden Her Sitenin Buna \u0130htiyac\u0131 Var?",
    tag: "Teknik",
    date: "20 Subat 2026",
    paragraphs: [
      "llms.txt, web sitenizin k\u00f6k dizinine yerle\u015ftirilen ve yapay zeka botlar\u0131na bilgi veren yeni bir standart dosya format\u0131d\u0131r.",
      "Firman\u0131z\u0131n ne yapt\u0131\u011f\u0131n\u0131, hizmetlerinizi ve hedef kitlenizi yapay zeka modellerinin anlayabilece\u011fi formatta sunar.",
      "A\u00e7\u0131k dil kullan\u0131n, farkl\u0131la\u015ft\u0131r\u0131c\u0131 \u00f6zelliklerinizi vurgulay\u0131n, co\u011frafi kapsam\u0131 belirtin.",
      "GH7.ai web siteniz i\u00e7in otomatik llms.txt \u00f6nerisi \u00fcretebilir.",
    ],
  },
};

interface Ranking {
  name: string;
  position: number;
  platformCount: number;
}

interface Platform {
  platform: string;
  mentioned: boolean;
}

// Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { title: true, metaDescription: true, ogImageUrl: true },
    });
    if (post) {
      return {
        title: `${post.title} | GH7.ai Blog`,
        description: post.metaDescription ?? undefined,
        openGraph: {
          images: [{ url: post.ogImageUrl ?? `/api/og/${slug}`, width: 1200, height: 630 }],
        },
      };
    }
  } catch {
    // fallback
  }

  const legacy = LEGACY_POSTS[slug];
  if (legacy) {
    return { title: `${legacy.title} | GH7.ai Blog` };
  }
  return { title: "Blog | GH7.ai" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try DB first
  let dbPost: {
    title: string;
    content: string;
    sectorTag: string | null;
    analysisType: string;
    queryLanguage: string;
    rankings: unknown;
    platforms: unknown;
    runCount: number;
    runDate: Date | null;
    publishedAt: Date | null;
    isLegacy: boolean;
  } | null = null;

  try {
    dbPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        title: true,
        content: true,
        sectorTag: true,
        analysisType: true,
        queryLanguage: true,
        rankings: true,
        platforms: true,
        runCount: true,
        runDate: true,
        publishedAt: true,
        isLegacy: true,
      },
    });
  } catch {
    // DB not available
  }

  // DB post found
  if (dbPost && !dbPost.isLegacy) {
    const rankings = (dbPost.rankings as Ranking[]) ?? [];
    const platforms = (dbPost.platforms as Platform[]) ?? [];
    const htmlContent = await marked(dbPost.content);

    const related = await prisma.blogPost.findMany({
      where: { status: "published", slug: { not: slug }, sectorTag: dbPost.sectorTag },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, sectorTag: true, publishedAt: true },
    });

    return (
      <div className="min-h-screen bg-white">
        <NavSection />
        <main className="pt-[60px]">
          {/* Breadcrumb */}
          <div className="max-w-3xl mx-auto px-5 sm:px-10 pt-10">
            <nav className="flex items-center gap-2 text-[12px] text-zinc-400">
              <Link href="/blog" className="hover:text-[#09090B] no-underline transition-colors">Blog</Link>
              <span>&rarr;</span>
              <span className="text-zinc-600 truncate">{dbPost.title}</span>
            </nav>
          </div>

          {/* Blog Hero */}
          <div className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 pb-6">
            <BlogHero
              query={dbPost.title}
              rankings={rankings}
              platforms={platforms}
              runCount={dbPost.runCount}
              runDate={dbPost.runDate?.toISOString() ?? new Date().toISOString()}
              sectorTag={dbPost.sectorTag}
              queryLanguage={dbPost.queryLanguage}
            />
          </div>

          {/* Article Body */}
          <article className="max-w-3xl mx-auto px-5 sm:px-10 pb-12">
            <div
              className="prose prose-zinc prose-headings:font-extrabold prose-headings:tracking-tight prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-zinc-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            <div className="mt-10 pt-6 border-t border-zinc-100">
              <p className="text-[11px] text-zinc-400 italic">
                Bu yazi GH7.ai tarafindan otomatik uretilmistir. Veriler {dbPost.runCount} tekrar analiz sonucuna dayanmaktadir.
              </p>
            </div>
          </article>

          {/* Footer CTA */}
          <div className="max-w-3xl mx-auto px-5 sm:px-10 pb-16">
            <BlogFooterCTA />
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <section className="px-5 sm:px-10 pb-20">
              <div className="max-w-[1120px] mx-auto">
                <h3 className="font-extrabold text-lg mb-6" style={{ letterSpacing: "-0.02em" }}>
                  Ilgili Yazilar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow no-underline"
                    >
                      <h4 className="text-sm font-bold text-zinc-900 leading-snug">{r.title}</h4>
                      {r.publishedAt && (
                        <div className="text-xs text-zinc-400 mt-2">
                          {new Date(r.publishedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
        <FooterSection />
      </div>
    );
  }

  // Legacy fallback
  const legacy = LEGACY_POSTS[slug];
  if (!legacy) return notFound();

  return (
    <div className="min-h-screen bg-white">
      <NavSection />
      <main className="pt-[60px]">
        <div className="max-w-3xl mx-auto px-5 sm:px-10 pt-10">
          <nav className="flex items-center gap-2 text-[12px] text-zinc-400">
            <Link href="/blog" className="hover:text-[#09090B] no-underline transition-colors">Blog</Link>
            <span>&rarr;</span>
            <span className="text-zinc-600 truncate">{legacy.title}</span>
          </nav>
        </div>
        <header className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 pb-6">
          <div className="inline-block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] bg-zinc-100 px-2.5 py-1 rounded-md mb-4">
            {legacy.tag}
          </div>
          <h1 className="font-extrabold leading-[1.1] mb-4" style={{ fontSize: "clamp(26px, 3.8vw, 40px)", letterSpacing: "-0.035em" }}>
            {legacy.title}
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-zinc-400">
            <span>{legacy.date}</span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
            <span>5 dakika okuma</span>
          </div>
        </header>
        <article className="max-w-3xl mx-auto px-5 sm:px-10 pb-12">
          {legacy.paragraphs.map((para, idx) => (
            <p key={idx} className="text-[15px] text-zinc-600 leading-[1.8] mb-5">{para}</p>
          ))}
          <div className="mt-10 pt-6 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400 italic">Bu yazi GH7.ai tarafindan uretilmistir.</p>
          </div>
        </article>
        <div className="max-w-3xl mx-auto px-5 sm:px-10 pb-16">
          <BlogFooterCTA />
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
