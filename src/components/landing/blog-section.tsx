"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const POSTS = [
  {
    tag: "GEO Temelleri",
    title: "GEO Nedir? SEO\u2019dan Farkı Ne?",
    desc: "Generative Engine Optimization kavramı, neden önemli olduğu ve Türkiye\u2019deki firmaların yapması gerekenler.",
  },
  {
    tag: "Sektör Analizi",
    title: "Isıtma Sektörü AI Görünürlük Raporu",
    desc: "ISITMAX verilerinden derlenen sektörel AI görünürlük analizi. Kim önde, neden önde, fırsatlar nerede.",
  },
  {
    tag: "Rehber",
    title: "Sağlık Turizmi ve AI: Yabancı Hastalar Sizi Buluyor mu?",
    desc: "Türk sağlık turizmi klinikleri için AI görünürlük rehberi. Export analizi ile hasta kaybetmeyin.",
  },
];

export function BlogSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#FAFAFA] border-t border-b border-zinc-100 py-[72px] sm:py-[100px] px-5 sm:px-10"
      id="blog"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Blog
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          GEO Rehberi &amp; İçgörüler
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
          Yapay zeka görünürlüğü hakkında Türkçe kaynaklar. Her analiz sonrası Opus ile otomatik üretilen, SEO uyumlu içerikler.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {POSTS.map((post) => (
            <div
              key={post.title}
              className="border border-zinc-200 rounded-xl overflow-hidden transition-colors hover:border-zinc-400 bg-white"
            >
              <div className="h-[140px] bg-zinc-100 flex items-center justify-center text-[11px] text-zinc-300">
                Görsel Alanı
              </div>
              <div className="p-5">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
                  {post.tag}
                </div>
                <div className="text-[14px] font-bold mb-1.5 leading-[1.3]" style={{ letterSpacing: "-0.01em" }}>
                  {post.title}
                </div>
                <div className="text-[12px] text-zinc-500 leading-[1.5]">
                  {post.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
