import Link from "next/link";
import { NavSection } from "@/components/landing/nav-section";
import { FooterSection } from "@/components/landing/footer-section";

const POSTS = [
  {
    title: "GEO Nedir? SEO\u2019dan Fark\u0131 Ne?",
    tag: "GEO Temelleri",
    excerpt:
      "Generative Engine Optimization kavram\u0131, neden \u00f6nemli oldu\u011fu ve T\u00fcrkiye\u2019deki firmalar\u0131n yapmas\u0131 gerekenler.",
    slug: "geo-nedir-seodan-farki-ne",
    date: "15 Mart 2026",
  },
  {
    title: "Is\u0131tma Sekt\u00f6r\u00fc AI G\u00f6r\u00fcn\u00fcrl\u00fck Raporu",
    tag: "Sekt\u00f6r Analizi",
    excerpt:
      "ISITMAX verilerinden derlenen sekt\u00f6rel AI g\u00f6r\u00fcn\u00fcrl\u00fck analizi.",
    slug: "isitma-sektoru-ai-gorunurluk-raporu",
    date: "10 Mart 2026",
  },
  {
    title:
      "Sa\u011fl\u0131k Turizmi ve AI: Yabanc\u0131 Hastalar Sizi Buluyor mu?",
    tag: "Rehber",
    excerpt:
      "T\u00fcrk sa\u011fl\u0131k turizmi klinikleri i\u00e7in AI g\u00f6r\u00fcn\u00fcrl\u00fck rehberi.",
    slug: "saglik-turizmi-ve-ai",
    date: "5 Mart 2026",
  },
  {
    title: "Schema Markup Rehberi: AI Botlar\u0131n\u0131n Dilinden Konu\u015fun",
    tag: "Teknik",
    excerpt:
      "Web sitenize yap\u0131land\u0131r\u0131lm\u0131\u015f veri ekleyerek AI g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fczü art\u0131r\u0131n.",
    slug: "schema-markup-rehberi",
    date: "1 Mart 2026",
  },
  {
    title:
      "ChatGPT vs Gemini: Hangi AI Firman\u0131z\u0131 Daha \u00c7ok \u00d6neriyor?",
    tag: "Kar\u015f\u0131la\u015ft\u0131rma",
    excerpt:
      "\u0130ki b\u00fcy\u00fck AI platformunun firma \u00f6nerme davran\u0131\u015flar\u0131n\u0131 kar\u015f\u0131la\u015ft\u0131rd\u0131k.",
    slug: "chatgpt-vs-gemini-karsilastirma",
    date: "25 \u015eubat 2026",
  },
  {
    title:
      "llms.txt Nedir ve Neden Her Sitenin Buna \u0130htiyac\u0131 Var?",
    tag: "Teknik",
    excerpt:
      "AI botlar\u0131na sitenizi tan\u0131tan yeni standart dosya format\u0131.",
    slug: "llms-txt-nedir",
    date: "20 \u015eubat 2026",
  },
];

export default function BlogPage() {
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
              style={{
                fontSize: "clamp(28px, 4.2vw, 46px)",
                letterSpacing: "-0.035em",
              }}
            >
              GEO Rehberi &amp; İçgörüler
            </h1>
            <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
              Yapay zeka görünürlüğü hakkında Türkçe kaynaklar
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="px-5 sm:px-10 pb-20">
          <div className="max-w-[1120px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="border border-zinc-200 rounded-xl overflow-hidden transition-colors hover:border-zinc-400 bg-white no-underline group"
                >
                  {/* Image placeholder */}
                  <div className="h-[140px] bg-zinc-100 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-[0.08em]">
                      {post.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
                      {post.tag}
                    </div>
                    <div
                      className="text-[14px] font-bold mb-1.5 leading-[1.3] text-[#09090B] group-hover:text-zinc-700"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {post.title}
                    </div>
                    <div className="text-[12px] text-zinc-500 leading-[1.5] mb-3">
                      {post.excerpt}
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      {post.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
