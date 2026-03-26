import Link from "next/link";
import { notFound } from "next/navigation";
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

const ARTICLE_CONTENT: Record<string, string[]> = {
  "geo-nedir-seodan-farki-ne": [
    "Generative Engine Optimization (GEO), yapay zeka destekli arama motorlar\u0131n\u0131n ve sohbet botlar\u0131n\u0131n markan\u0131z\u0131 do\u011fru \u015fekilde tan\u0131mas\u0131n\u0131 ve \u00f6nermesini sa\u011flayan bir optimizasyon disiplinidir. Geleneksel SEO, Google gibi arama motorlar\u0131nda s\u0131ralama elde etmeye odaklan\u0131rken, GEO bunun bir ad\u0131m \u00f6tesine ge\u00e7er.",
    "ChatGPT, Claude, Gemini ve Perplexity gibi yapay zeka platformlar\u0131 art\u0131k kullan\u0131c\u0131lara do\u011frudan cevaplar \u00fcretiyor. Bu cevaplarda markan\u0131z\u0131n ge\u00e7ip ge\u00e7memesi, i\u015f sonu\u00e7lar\u0131n\u0131z\u0131 do\u011frudan etkiliyor. GEO, tam olarak bu noktada devreye giriyor.",
    "T\u00fcrkiye\u2019deki firmalar i\u00e7in GEO \u00f6zellikle kritik bir \u00f6neme sahip. Hen\u00fcz sekt\u00f6rde rekabet d\u00fc\u015f\u00fck oldu\u011fu i\u00e7in erken hareket edenler b\u00fcy\u00fck avantaj kazanacak. Yapay zeka platformlar\u0131n\u0131n T\u00fcrk\u00e7e i\u00e7erik havuzu hen\u00fcz s\u0131n\u0131rl\u0131 oldu\u011fundan, do\u011fru stratejilerle k\u0131sa s\u00fcrede g\u00f6r\u00fcn\u00fcrl\u00fck elde etmek m\u00fcmk\u00fcn.",
    "SEO ve GEO aras\u0131ndaki temel farklar \u015funlard\u0131r: SEO anahtar kelime odakl\u0131 \u00e7al\u0131\u015f\u0131rken, GEO anlam ve ba\u011flam odakl\u0131 \u00e7al\u0131\u015f\u0131r. SEO\u2019da ba\u011flant\u0131 profili \u00f6nemliyken, GEO\u2019da kaynak g\u00fcvenilirli\u011fi ve yap\u0131land\u0131r\u0131lm\u0131\u015f veri \u00f6n plana \u00e7\u0131kar. SEO sonucunda web sitenize trafik gelirken, GEO sonucunda markan\u0131z do\u011frudan yapay zeka yan\u0131tlar\u0131nda yer al\u0131r.",
    "GEO stratejinizi olu\u015ftururken dikkat etmeniz gereken \u00fc\u00e7 temel alan var: \u0130\u00e7erik kalitesi ve derinli\u011fi, teknik altyap\u0131 (schema markup, llms.txt) ve \u00e7oklu platform varl\u0131\u011f\u0131. Bu \u00fc\u00e7 alan\u0131 birlikte ele ald\u0131\u011f\u0131n\u0131zda, yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fczde ciddi bir art\u0131\u015f g\u00f6receksiniz.",
  ],
  "isitma-sektoru-ai-gorunurluk-raporu": [
    "ISITMAX projesi kapsam\u0131nda toplanan veriler, \u0131s\u0131tma sekt\u00f6r\u00fcn\u00fcn yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fck durumunu detayl\u0131 bir \u015fekilde ortaya koyuyor. Sekt\u00f6rdeki firmalar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu hen\u00fcz GEO stratejisi geli\u015ftirmemi\u015f durumda.",
    "Ara\u015ft\u0131rmam\u0131za g\u00f6re, \u0131s\u0131tma sekt\u00f6r\u00fcndeki firmalar\u0131n yaln\u0131zca y\u00fczde on ikisi yapay zeka platformlar\u0131nda d\u00fczg\u00fcn bir \u015fekilde temsil ediliyor. Bu, sekt\u00f6rde erken hareket eden firmalar i\u00e7in b\u00fcy\u00fck bir f\u0131rsat anlam\u0131na geliyor.",
    "Kombi, radyat\u00f6r ve klima kategorilerinde yap\u0131lan sorgulamalarda, yapay zeka platformlar\u0131n\u0131n genellikle global markalar\u0131 \u00f6ne \u00e7\u0131kard\u0131\u011f\u0131 g\u00f6r\u00fcl\u00fcyor. T\u00fcrk markalar\u0131n\u0131n bu alanda g\u00f6r\u00fcn\u00fcrl\u00fck kazanmas\u0131 i\u00e7in hedefli bir GEO \u00e7al\u0131\u015fmas\u0131 \u015fart.",
    "Raporun \u00f6ne \u00e7\u0131kan bulgular\u0131 aras\u0131nda, yap\u0131land\u0131r\u0131lm\u0131\u015f veri kullanan firmalar\u0131n g\u00f6r\u00fcn\u00fcrl\u00fck skorlar\u0131n\u0131n belirgin \u015fekilde y\u00fcksek olmas\u0131 dikkat \u00e7ekiyor. Schema markup, \u00fcr\u00fcn sayfalar\u0131 ve m\u00fc\u015fteri yorumlar\u0131 gibi sinyaller, yapay zeka algoritmalar\u0131n\u0131n karar verme s\u00fcrecinde kritik rol oynuyor.",
  ],
  "saglik-turizmi-ve-ai": [
    "T\u00fcrkiye, d\u00fcnyan\u0131n en \u00f6nemli sa\u011fl\u0131k turizmi destinasyonlar\u0131ndan biri. Ancak yabanc\u0131 hastalar art\u0131k sadece Google\u2019da aramak yerine, yapay zeka asistanlar\u0131na da dan\u0131\u015f\u0131yor. Klini\u011finiz bu platformlarda g\u00f6r\u00fcn\u00fcyor mu?",
    "Export analizi verileri g\u00f6steriyor ki, \u0130ngilizce sorgularda T\u00fcrk klinikleri g\u00f6r\u00fcn\u00fcrl\u00fck a\u00e7\u0131s\u0131ndan ciddi dezavantajda. \u00d6zellikle di\u015f, sa\u00e7 ekimi ve estetik cerrahi alanlar\u0131nda rekabet \u00e7ok yo\u011fun ve Tayland, G\u00fcney Kore gibi \u00fclkelerin klinikleri yapay zeka yan\u0131tlar\u0131nda daha s\u0131k yer al\u0131yor.",
    "Sa\u011fl\u0131k turizmi klinikleri i\u00e7in GEO stratejisi olu\u015ftururken \u00f6ncelikle \u00e7ok dilli i\u00e7erik \u00fcretimi, uluslararas\u0131 sa\u011fl\u0131k platformlar\u0131nda varl\u0131k ve hasta deneyimi verilerinin yap\u0131land\u0131r\u0131lm\u0131\u015f formatta sunulmas\u0131 gerekiyor.",
    "GH7.ai Export Analizi mod\u00fcl\u00fc, klini\u011finizin farkl\u0131 dillerde ve \u00fclkelerde yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fc \u00f6l\u00e7menize yard\u0131mc\u0131 oluyor. Hangi pazarlarda g\u00f6r\u00fcn\u00fcr oldu\u011funuzu, hangi rakiplerinizin \u00f6ne \u00e7\u0131kt\u0131\u011f\u0131n\u0131 ve ne t\u00fcr iyile\u015ftirmeler yapman\u0131z gerekti\u011fini net bir \u015fekilde g\u00f6rebilirsiniz.",
  ],
  "schema-markup-rehberi": [
    "Yap\u0131land\u0131r\u0131lm\u0131\u015f veri (structured data), web sitenizin i\u00e7eri\u011fini makinelerin anlayabilece\u011fi bir formatta sunman\u0131z\u0131 sa\u011flar. Schema.org standartlar\u0131 kullanarak olu\u015fturdu\u011funuz markup, hem arama motorlar\u0131 hem de yapay zeka platformlar\u0131 taraf\u0131ndan okunur.",
    "GEO a\u00e7\u0131s\u0131ndan en \u00f6nemli schema t\u00fcrleri \u015funlard\u0131r: Organization (firma bilgileri), LocalBusiness (yerel i\u015fletme), Product (\u00fcr\u00fcn), Service (hizmet), FAQPage (s\u0131k sorulan sorular) ve Review (m\u00fc\u015fteri yorumlar\u0131). Bu schema t\u00fcrlerini do\u011fru bir \u015fekilde uygulamak, yapay zekan\u0131n firman\u0131z\u0131 daha iyi anlamas\u0131n\u0131 sa\u011flar.",
    "Schema markup uygularken dikkat edilmesi gereken noktalar vard\u0131r: Verilerinizin tutarl\u0131 olmas\u0131, JSON-LD format\u0131n\u0131 tercih etmeniz, Google\u2019\u0131n Rich Results Test arac\u0131yla do\u011frulama yapman\u0131z ve d\u00fczenli olarak g\u00fcncellemeniz \u00f6nerilir.",
    "GH7.ai\u2019\u0131n teknik analiz mod\u00fcl\u00fc, web sitenizin schema markup durumunu otomatik olarak tarar ve eksiklikleri raporlar. Hangi sayfalar\u0131n\u0131zda yap\u0131land\u0131r\u0131lm\u0131\u015f veri bulundu\u011funu, hangi t\u00fcrlerinin kullan\u0131ld\u0131\u011f\u0131n\u0131 ve iyile\u015ftirme \u00f6nerilerini tek bir panelden g\u00f6rebilirsiniz.",
  ],
  "chatgpt-vs-gemini-karsilastirma": [
    "Yapay zeka platformlar\u0131 farkl\u0131 algoritmalar ve veri kaynaklar\u0131 kulland\u0131\u011f\u0131 i\u00e7in, ayn\u0131 soruya farkl\u0131 yan\u0131tlar \u00fcretebilir. Firman\u0131z ChatGPT\u2019de \u00f6nerilirken, Gemini\u2019de hi\u00e7 ge\u00e7miyor olabilir ya da tam tersi.",
    "Yapt\u0131\u011f\u0131m\u0131z kar\u015f\u0131la\u015ft\u0131rmal\u0131 analizde, ChatGPT\u2019nin daha g\u00fcncel web verilerine eri\u015febildi\u011fi ve \u00f6zellikle i\u00e7erik pazarlamas\u0131 g\u00fc\u00e7l\u00fc olan firmalar\u0131 \u00f6ne \u00e7\u0131kard\u0131\u011f\u0131 g\u00f6r\u00fcld\u00fc. Gemini ise Google ekosistemindeki verilere a\u011f\u0131rl\u0131k veriyor ve Google Business Profile bilgilerini daha aktif kullan\u0131yor.",
    "Her iki platform da firma \u00f6nerirken farkl\u0131 sinyallere \u00f6nem veriyor. ChatGPT i\u00e7in blog i\u00e7erikleri, bak\u0131\u015f a\u00e7\u0131s\u0131 yaz\u0131lar\u0131 ve sekt\u00f6rel analizler \u00f6nemliyken, Gemini i\u00e7in Google Haritalar yorumlar\u0131, i\u015fletme bilgileri ve web sitesi teknik altyap\u0131s\u0131 daha a\u011f\u0131r bas\u0131yor.",
    "Sonu\u00e7 olarak, ba\u015far\u0131l\u0131 bir GEO stratejisi tek bir platforma odaklanmak yerine, t\u00fcm b\u00fcy\u00fck yapay zeka platformlar\u0131nda tutarl\u0131 bir g\u00f6r\u00fcn\u00fcrl\u00fck hedeflemelidir. GH7.ai, bu platformlar\u0131 ayn\u0131 anda takip etmenize ve kar\u015f\u0131la\u015ft\u0131rmal\u0131 analiz yapman\u0131za olanak tan\u0131r.",
  ],
  "llms-txt-nedir": [
    "llms.txt, web sitenizin k\u00f6k dizinine yerle\u015ftirilen ve yapay zeka botlar\u0131na siteniz hakk\u0131nda bilgi veren yeni bir standart dosya format\u0131d\u0131r. T\u0131pk\u0131 robots.txt\u2019in arama motorlar\u0131 i\u00e7in yapt\u0131\u011f\u0131 gibi, llms.txt de yapay zeka modelleri i\u00e7in bir rehber g\u00f6revi g\u00f6r\u00fcr.",
    "Bu dosya, firman\u0131z\u0131n ne yapt\u0131\u011f\u0131n\u0131, hangi hizmetleri sundu\u011funu, hedef kitlenizi ve \u00f6ne \u00e7\u0131kan \u00f6zelliklerinizi yapay zeka modellerinin anlayabilece\u011fi bir formatta sunar. Do\u011fru bir llms.txt dosyas\u0131, yapay zekan\u0131n firman\u0131z\u0131 do\u011fru ba\u011flamlarda \u00f6nermesini sa\u011flar.",
    "llms.txt dosyas\u0131 olu\u015ftururken dikkat edilmesi gerekenler: A\u00e7\u0131k ve \u00f6z bir dil kullan\u0131n, firman\u0131z\u0131n farkl\u0131la\u015ft\u0131r\u0131c\u0131 \u00f6zelliklerini vurgulay\u0131n, hedef kitlenizi ve co\u011frafi kapsam\u0131n\u0131z\u0131 belirtin ve d\u00fczenli olarak g\u00fcncelleyin.",
    "GH7.ai, web siteniz i\u00e7in otomatik llms.txt \u00f6nerisi \u00fcretebilir. Analiz sonu\u00e7lar\u0131na ve sekt\u00f6r verilerine dayanarak, yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fczü art\u0131racak optimize bir dosya i\u00e7eri\u011fi haz\u0131rlar.",
  ],
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <NavSection />
        <main className="pt-[60px]">
          <div className="max-w-3xl mx-auto px-5 sm:px-10 py-20 text-center">
            <h1 className="text-2xl font-extrabold mb-4">
              Yaz\u0131 Bulunamad\u0131
            </h1>
            <p className="text-zinc-500 mb-8">
              Arad\u0131\u011f\u0131n\u0131z blog yaz\u0131s\u0131 mevcut de\u011fil veya kald\u0131r\u0131lm\u0131\u015f olabilir.
            </p>
            <Link
              href="/blog"
              className="inline-block bg-[#09090B] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold no-underline"
            >
              Blog&apos;a D\u00f6n
            </Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  const paragraphs = ARTICLE_CONTENT[post.slug] || [];
  const relatedPosts = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <NavSection />

      <main className="pt-[60px]">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-5 sm:px-10 pt-10">
          <nav className="flex items-center gap-2 text-[12px] text-zinc-400">
            <Link
              href="/blog"
              className="hover:text-[#09090B] no-underline transition-colors"
            >
              Blog
            </Link>
            <span>\u2192</span>
            <span className="text-zinc-600 truncate">{post.title}</span>
          </nav>
        </div>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 pb-6">
          <div className="inline-block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] bg-zinc-100 px-2.5 py-1 rounded-md mb-4">
            {post.tag}
          </div>
          <h1
            className="font-extrabold leading-[1.1] mb-4"
            style={{
              fontSize: "clamp(26px, 3.8vw, 40px)",
              letterSpacing: "-0.035em",
            }}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-zinc-400">
            <span>{post.date}</span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
            <span>5 dakika okuma</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-3xl mx-auto px-5 sm:px-10 pb-12">
          <div className="prose-none">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="text-[15px] text-zinc-600 leading-[1.8] mb-5"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Author note */}
          <div className="mt-10 pt-6 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400 italic">
              Bu yaz\u0131 GH7.ai Opus modeli taraf\u0131ndan \u00fcretilmi\u015ftir.
            </p>
          </div>
        </article>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-5 sm:px-10 pb-16">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center">
            <h3
              className="font-extrabold text-xl mb-2"
              style={{ letterSpacing: "-0.02em" }}
            >
              Yapay zeka g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fczü test edin
            </h3>
            <p className="text-[13px] text-zinc-500 mb-5">
              Firman\u0131z\u0131n ChatGPT, Claude ve Gemini\u2019deki g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fcn\u00fc
              \u00f6\u011frenin.
            </p>
            <Link
              href="/analiz"
              className="inline-block bg-[#09090B] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold no-underline hover:bg-zinc-800 transition-colors"
            >
              \u00dccretsiz Analiz \u2192
            </Link>
          </div>
        </section>

        {/* Related Posts */}
        <section className="px-5 sm:px-10 pb-20">
          <div className="max-w-[1120px] mx-auto">
            <h3
              className="font-extrabold text-lg mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              Di\u011fer Yaz\u0131lar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="border border-zinc-200 rounded-xl overflow-hidden transition-colors hover:border-zinc-400 bg-white no-underline group"
                >
                  <div className="h-[120px] bg-zinc-100 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-[0.08em]">
                      {rp.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
                      {rp.tag}
                    </div>
                    <div
                      className="text-[14px] font-bold mb-1.5 leading-[1.3] text-[#09090B] group-hover:text-zinc-700"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {rp.title}
                    </div>
                    <div className="text-[12px] text-zinc-500 leading-[1.5]">
                      {rp.excerpt}
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
