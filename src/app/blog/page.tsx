import Link from "next/link";
import { prisma } from "@/lib/db";
import { NavSection } from "@/components/landing/nav-section";
import { FooterSection } from "@/components/landing/footer-section";

// Legacy static posts as fallback when DB is empty
const LEGACY_POSTS = [
  { title: "GEO Nedir? SEO\u2019dan Fark\u0131 Ne?", tag: "GEO Temelleri", excerpt: "Generative Engine Optimization kavram\u0131, neden \u00f6nemli oldu\u011fu ve T\u00fcrkiye\u2019deki firmalar\u0131n yapmas\u0131 gerekenler.", slug: "geo-nedir-seodan-farki-ne", date: "15 Mart 2026" },
  { title: "Is\u0131tma Sekt\u00f6r\u00fc AI G\u00f6r\u00fcn\u00fcrl\u00fck Raporu", tag: "Sektor Analizi", excerpt: "ISITMAX verilerinden derlenen sekt\u00f6rel AI g\u00f6r\u00fcn\u00fcrl\u00fck analizi.", slug: "isitma-sektoru-ai-gorunurluk-raporu", date: "10 Mart 2026" },
  { title: "Sa\u011fl\u0131k Turizmi ve AI: Yabanc\u0131 Hastalar Sizi Buluyor mu?", tag: "Rehber", excerpt: "T\u00fcrk sa\u011fl\u0131k turizmi klinikleri i\u00e7in AI g\u00f6r\u00fcn\u00fcrl\u00fck rehberi.", slug: "saglik-turizmi-ve-ai", date: "5 Mart 2026" },
  { title: "Schema Markup Rehberi: AI Botlar\u0131n\u0131n Dilinden Konu\u015fun", tag: "Teknik", excerpt: "Web sitenize yap\u0131land\u0131r\u0131lm\u0131\u015f veri ekleyerek AI g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fczü art\u0131r\u0131n.", slug: "schema-markup-rehberi", date: "1 Mart 2026" },
  { title: "ChatGPT vs Gemini: Hangi AI Firman\u0131z\u0131 Daha \u00c7ok \u00d6neriyor?", tag: "Karsilastirma", excerpt: "\u0130ki b\u00fcy\u00fck AI platformunun firma \u00f6nerme davran\u0131\u015flar\u0131n\u0131 kar\u015f\u0131la\u015ft\u0131rd\u0131k.", slug: "chatgpt-vs-gemini-karsilastirma", date: "25 Subat 2026" },
  { title: "llms.txt Nedir ve Neden Her Sitenin Buna \u0130htiyac\u0131 Var?", tag: "Teknik", excerpt: "AI botlar\u0131na sitenizi tan\u0131tan yeni standart dosya format\u0131.", slug: "llms-txt-nedir", date: "20 Subat 2026" },
];

const TYPE_LABELS: Record<string, string> = {
  firma: "Firma",
  kisi: "Kisi",
  eticaret: "E-Ticaret",
  export: "Export",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; type?: string }>;
}) {
  const { sector, type } = await searchParams;

  // Try DB first
  let dbPosts: Array<{
    title: string;
    slug: string;
    metaDescription: string | null;
    sectorTag: string | null;
    analysisType: string;
    ogImageUrl: string | null;
    publishedAt: Date | null;
    isLegacy: boolean;
    rankings: unknown;
  }> = [];

  try {
    const where: Record<string, unknown> = { status: "published" };
    if (sector) where.sectorTag = sector;
    if (type) where.analysisType = type;

    dbPosts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        title: true,
        slug: true,
        metaDescription: true,
        sectorTag: true,
        analysisType: true,
        ogImageUrl: true,
        publishedAt: true,
        isLegacy: true,
        rankings: true,
      },
    });
  } catch {
    // DB not available — use legacy
  }

  // If no DB posts, fall back to legacy static
  const useLegacy = dbPosts.length === 0 && !sector && !type;

  // Collect unique sectors and types for filter
  const allSectors = [...new Set(dbPosts.map((p) => p.sectorTag).filter(Boolean))] as string[];
  const allTypes = [...new Set(dbPosts.map((p) => p.analysisType).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white">
      <NavSection />

      <main className="pt-[60px]">
        {/* Header */}
        <section className="px-5 sm:px-10 pt-16 pb-10">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
              Blog
            </div>
            <h1
              className="font-extrabold leading-[1.1] mb-3.5"
              style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
            >
              GEO Rehberi &amp; Icgoruler
            </h1>
            <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
              Yapay zeka gorunurlugunuz hakkinda analiz raporlari, rehberler ve sektorel icgoruler.
            </p>

            {/* Filters */}
            {(allSectors.length > 0 || allTypes.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-6">
                <Link
                  href="/blog"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    !sector && !type ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tumu
                </Link>
                {allTypes.map((t) => (
                  <Link
                    key={t}
                    href={`/blog?type=${t}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      type === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {TYPE_LABELS[t] ?? t}
                  </Link>
                ))}
                {allSectors.map((s) => (
                  <Link
                    key={s}
                    href={`/blog?sector=${s}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      sector === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Posts Grid */}
        <section className="px-5 sm:px-10 pb-20">
          <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* DB posts */}
            {dbPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* OG thumbnail */}
                {post.ogImageUrl && !post.isLegacy && (
                  <div className="aspect-[1200/630] bg-[#212121] overflow-hidden">
                    <img
                      src={post.ogImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {post.sectorTag && (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {post.sectorTag}
                      </span>
                    )}
                    {!post.isLegacy && (
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        {TYPE_LABELS[post.analysisType] ?? post.analysisType}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-snug mb-2">
                    {post.title}
                  </h2>
                  {post.metaDescription && (
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                      {post.metaDescription}
                    </p>
                  )}
                  {post.publishedAt && (
                    <div className="text-xs text-zinc-400 mt-3">
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {/* Legacy fallback */}
            {useLegacy &&
              LEGACY_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {post.tag}
                    </span>
                    <h2 className="text-base font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-snug mt-2 mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="text-xs text-zinc-400 mt-3">{post.date}</div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
