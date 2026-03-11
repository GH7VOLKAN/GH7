import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed the database with initial ISITMAX brand data.
 * Run with: npx prisma db seed
 *
 * The profileId should be the Supabase auth user ID of the first registered user.
 * Pass it as SEED_USER_ID env variable, or it will use a placeholder.
 */
async function main() {
  const userId = process.env.SEED_USER_ID ?? "00000000-0000-0000-0000-000000000000";

  // 1. Profile
  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: "demo@gh7.ai",
      fullName: "Demo Kullanıcı",
    },
  });

  // 2. Brand
  const brand = await prisma.brand.upsert({
    where: { id: "brand_isitmax" },
    update: {},
    create: {
      id: "brand_isitmax",
      profileId: profile.id,
      name: "ISITMAX",
      domain: "isitmax.com",
      sector: "Yerden Isıtma",
      isDefault: true,
    },
  });

  const brandId = brand.id;

  // 3. Competitors
  const competitors = [
    { id: "comp_a", name: "Rakip A", domain: "rakipa.com", mentionScore: 68, readinessScore: 84, platforms: { chatgpt: 65, claude: 52, gemini: 58, perplexity: 61 } },
    { id: "comp_b", name: "Rakip B", domain: "rakipb.com", mentionScore: 31, readinessScore: 41, platforms: { chatgpt: 30, claude: 15, gemini: 40, perplexity: 22 } },
    { id: "comp_c", name: "Rakip C", domain: "rakipc.com", mentionScore: 52, readinessScore: 67, platforms: { chatgpt: 48, claude: 38, gemini: 42, perplexity: 45 } },
  ];

  for (const c of competitors) {
    await prisma.competitor.upsert({
      where: { id: c.id },
      update: { mentionScore: c.mentionScore, readinessScore: c.readinessScore, platforms: c.platforms },
      create: { ...c, brandId },
    });
  }

  // 4. Source Domains
  const sources = [
    { id: "src_isitmax", domain: "isitmax.com", type: "kurumsal", usagePercent: 28, avgCitations: 3.2, urls: ["/urunler/yerden-isitma", "/blog/yerden-isitma-rehberi", "/hakkimizda", "/"] },
    { id: "src_rakipa", domain: "rakipa.com", type: "kurumsal", usagePercent: 45, avgCitations: 5.1, urls: [] },
    { id: "src_google", domain: "google.com/business", type: "referans", usagePercent: 32, avgCitations: 2.4, urls: [] },
    { id: "src_insaat", domain: "insaat.org", type: "dizin", usagePercent: 18, avgCitations: 1.8, urls: [], actionNote: "Sizin kaydınız yok. Rakip A kayıtlı." },
    { id: "src_reddit", domain: "reddit.com/r/turkiye", type: "ugc", usagePercent: 12, avgCitations: 1.2, urls: [] },
    { id: "src_yapi", domain: "yapi.com.tr", type: "dizin", usagePercent: 8, avgCitations: 0.9, urls: [], actionNote: "Sizin kaydınız yok." },
    { id: "src_hurriyet", domain: "hurriyet.com.tr/emlak", type: "medya", usagePercent: 6, avgCitations: 0.7, urls: [] },
  ];

  for (const s of sources) {
    await prisma.sourceDomain.upsert({
      where: { id: s.id },
      update: { usagePercent: s.usagePercent, avgCitations: s.avgCitations, actionNote: s.actionNote ?? null },
      create: { ...s, brandId, actionNote: s.actionNote ?? null },
    });
  }

  // 5. Audit Categories & Checks
  const categories = [
    {
      id: "cat_structured",
      name: "Yapılandırılmış Veri",
      score: 15,
      checks: [
        { id: "chk_org", label: "Organization Schema", status: "pass", score: 100, detail: "Mevcut ve doğru.", recommendation: null, raasEligible: false },
        { id: "chk_product", label: "Product Schema", status: "fail", score: 0, detail: "Ürün sayfalarında bulunamadı.", recommendation: "Her ürün sayfasına Product schema ekleyin.", raasEligible: true },
        { id: "chk_faq", label: "FAQ Schema", status: "fail", score: 0, detail: "FAQ sayfası ve schema bulunamadı.", recommendation: "20 soruluk SSS sayfası + FAQPage schema.", raasEligible: true },
        { id: "chk_local", label: "LocalBusiness Schema", status: "partial", score: 50, detail: "Var ama adres ve telefon eksik.", recommendation: "Adres, telefon, çalışma saatleri ekleyin.", raasEligible: false },
      ],
    },
    {
      id: "cat_external",
      name: "Dış Platform",
      score: 8,
      checks: [
        { id: "chk_gbp", label: "Google Business Profili", status: "pass", score: 80, detail: "4.6 puan, 127 yorum. Güncel.", recommendation: "Hizmet alanı genişletin, fotoğraf ekleyin.", raasEligible: false },
        { id: "chk_dirs", label: "Sektörel Dizinler", status: "fail", score: 0, detail: "0/5 dizinde kayıt.", recommendation: "5 dizine kayıt olun.", raasEligible: true },
      ],
    },
    {
      id: "cat_content",
      name: "İçerik",
      score: 9,
      checks: [
        { id: "chk_about", label: "Hakkımızda Sayfası", status: "partial", score: 50, detail: "Sayfa var ama kuruluş yılı, ekip bilgisi eksik.", recommendation: "Firma geçmişi, ekip, sertifikalar ekleyin.", raasEligible: false },
        { id: "chk_freshness", label: "İçerik Güncelliği", status: "partial", score: 40, detail: "Son blog yazısı: 4 ay önce.", recommendation: "Ayda en az 2 blog yazısı yayınlayın.", raasEligible: false },
      ],
    },
    {
      id: "cat_technical",
      name: "Teknik",
      score: 20,
      checks: [
        { id: "chk_meta", label: "Meta Açıklamaları", status: "pass", score: 100, detail: "Mevcut ve uygun uzunlukta.", recommendation: null, raasEligible: false },
        { id: "chk_speed", label: "Sayfa Hızı", status: "pass", score: 100, detail: "Hızlı. LCP: 1.8s, CLS: 0.05.", recommendation: null, raasEligible: false },
      ],
    },
  ];

  for (const cat of categories) {
    await prisma.auditCategory.upsert({
      where: { id: cat.id },
      update: { score: cat.score },
      create: { id: cat.id, brandId, name: cat.name, score: cat.score },
    });

    for (const chk of cat.checks) {
      await prisma.auditCheck.upsert({
        where: { id: chk.id },
        update: { status: chk.status, score: chk.score },
        create: { ...chk, categoryId: cat.id },
      });
    }
  }

  // 6. Action Tasks
  const tasks = [
    { id: "task_1", priority: "high", title: "FAQ sayfası oluşturun", impact: "Hazırlık +10 puan", source: "Site Analizi → FAQ Schema", detail: "Sektörünüzdeki 20 sık sorulan soruyu yanıtlayan sayfa. FAQPage schema ile işaretleyin.", completed: false, raasEligible: true },
    { id: "task_2", priority: "high", title: "Product schema ekleyin", impact: "Hazırlık +10 puan", source: "Site Analizi → Product Schema", detail: "5 ana ürün sayfasına fiyat, marka, açıklama bilgisi.", completed: false, raasEligible: true },
    { id: "task_3", priority: "high", title: "Google Business güncelleyin", impact: "Hazırlık +2 puan (8→10)", source: "Site Analizi → Google Business", detail: "Çalışma saatleri ve hizmet alanı bilgilerini güncelleyin.", completed: true, raasEligible: false },
    { id: "task_4", priority: "medium", title: "Sektörel dizinlere kayıt olun", impact: "Hazırlık +10 puan", source: "Site Analizi → Sektörel Dizinler", detail: "insaat.org, isitma.org.tr, yapi.com.tr, sektorel.com, firmasec.com.tr", completed: false, raasEligible: true },
    { id: "task_5", priority: "medium", title: "\"Yerden ısıtma bakım rehberi\" yazın", impact: "2 yeni promptta bahsedilme potansiyeli", source: "Promptlar → bakım etiketli 2 promptta visibility %0", detail: "Bakım konusunda kapsamlı bir rehber yazısı oluşturun.", completed: false, raasEligible: true },
    { id: "task_6", priority: "medium", title: "LocalBusiness schema tamamlayın", impact: "Hazırlık +5 puan", source: "Site Analizi → LocalBusiness Schema", detail: "Adres, telefon ve çalışma saatleri bilgilerini ekleyin.", completed: false, raasEligible: false },
    { id: "task_7", priority: "low", title: "Hakkımızda sayfası zenginleştirin", impact: "Hazırlık +5 puan", source: "Site Analizi → Hakkımızda", detail: "Firma geçmişi, ekip bilgisi ve sertifikalar ekleyin.", completed: false, raasEligible: false },
    { id: "task_8", priority: "low", title: "Blog takvimi oluşturun", impact: "Hazırlık +6 puan (4→10)", source: "Site Analizi → İçerik Güncelliği", detail: "Ayda en az 2 blog yazısı yayınlama planı oluşturun.", completed: false, raasEligible: false },
  ];

  for (const t of tasks) {
    await prisma.actionTask.upsert({
      where: { id: t.id },
      update: { completed: t.completed },
      create: { ...t, brandId },
    });
  }

  // 7. Prompts
  const prompts = [
    { id: "prm_1", text: "En iyi yerden ısıtma firması hangisi?", tags: ["marka", "karşılaştırma"] },
    { id: "prm_2", text: "Yerden ısıtma fiyatları 2026", tags: ["fiyat"] },
    { id: "prm_3", text: "Elektrikli yerden ısıtma önerisi", tags: ["ürün", "teknik"] },
    { id: "prm_4", text: "Ankara yerden ısıtma firmaları", tags: ["yerel", "marka"] },
    { id: "prm_5", text: "Yerden ısıtma bakım nasıl yapılır", tags: ["bakım", "teknik"] },
    { id: "prm_6", text: "Yerden ısıtma sistemleri karşılaştırma", tags: ["karşılaştırma"] },
  ];

  for (const p of prompts) {
    await prisma.prompt.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, brandId, isActive: true },
    });
  }

  // 8. Suggested Prompts
  const suggested = [
    { id: "sug_1", text: "Yerden ısıtma mı klima mı daha ekonomik", volume: 4 },
    { id: "sug_2", text: "Yerden ısıtma hangi zeminlere uygun", volume: 3 },
    { id: "sug_3", text: "Sulu yerden ısıtma avantajları dezavantajları", volume: 3 },
    { id: "sug_4", text: "Yerden ısıtma kazan seçimi nasıl yapılır", volume: 2 },
  ];

  for (const s of suggested) {
    await prisma.suggestedPrompt.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, brandId },
    });
  }

  // 9. Scan + PromptResults (simulate one completed scan)
  const scan = await prisma.scan.upsert({
    where: { id: "scan_initial" },
    update: {},
    create: {
      id: "scan_initial",
      brandId,
      status: "completed",
      startedAt: new Date("2026-03-10T08:00:00Z"),
      completedAt: new Date("2026-03-10T08:05:00Z"),
    },
  });

  // Results per prompt per platform
  const results = [
    // Prompt 1: "En iyi yerden ısıtma firması hangisi?"
    { promptId: "prm_1", platform: "chatgpt", mentioned: true, position: "2. sıra", sentiment: "pozitif", excerpt: "...ISITMAX, Türkiye'nin önde gelen yerden ısıtma firmalarından biridir..." },
    { promptId: "prm_1", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_1", platform: "gemini", mentioned: true, position: "3. sıra", sentiment: "nötr", excerpt: "...Yerden ısıtma sektöründe ISITMAX da seçenekler arasında yer almaktadır..." },
    { promptId: "prm_1", platform: "perplexity", mentioned: true, position: "1. sıra", sentiment: "pozitif", excerpt: "...ISITMAX geniş ürün yelpazesi ve teknik destek ile bilinir..." },
    // Prompt 2: "Yerden ısıtma fiyatları 2026"
    { promptId: "prm_2", platform: "chatgpt", mentioned: true, position: "3. sıra", sentiment: "nötr", excerpt: "...Fiyatlar metrekareye göre değişmektedir. ISITMAX ve Rakip A gibi firmalar..." },
    { promptId: "prm_2", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_2", platform: "gemini", mentioned: true, position: "2. sıra", sentiment: "nötr", excerpt: "...ISITMAX fiyatları rekabetçi seviyededir..." },
    { promptId: "prm_2", platform: "perplexity", mentioned: false, position: null, sentiment: null, excerpt: null },
    // Prompt 3
    { promptId: "prm_3", platform: "chatgpt", mentioned: true, position: "bahsediliyor", sentiment: "nötr", excerpt: "...Elektrikli yerden ısıtma sistemleri arasında ISITMAX da yer almaktadır..." },
    { promptId: "prm_3", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_3", platform: "gemini", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_3", platform: "perplexity", mentioned: false, position: null, sentiment: null, excerpt: null },
    // Prompt 4
    { promptId: "prm_4", platform: "chatgpt", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_4", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_4", platform: "gemini", mentioned: true, position: "bahsediliyor", sentiment: "nötr", excerpt: "...Ankara bölgesinde ISITMAX da hizmet vermektedir..." },
    { promptId: "prm_4", platform: "perplexity", mentioned: false, position: null, sentiment: null, excerpt: null },
    // Prompt 5 — no mentions
    { promptId: "prm_5", platform: "chatgpt", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_5", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_5", platform: "gemini", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_5", platform: "perplexity", mentioned: false, position: null, sentiment: null, excerpt: null },
    // Prompt 6
    { promptId: "prm_6", platform: "chatgpt", mentioned: true, position: "2. sıra", sentiment: "pozitif", excerpt: "...ISITMAX kaliteli yerden ısıtma çözümleri sunmaktadır..." },
    { promptId: "prm_6", platform: "claude", mentioned: false, position: null, sentiment: null, excerpt: null },
    { promptId: "prm_6", platform: "gemini", mentioned: true, position: "1. sıra", sentiment: "pozitif", excerpt: "...ISITMAX bu alanda çeşitli çözümler sunmaktadır..." },
    { promptId: "prm_6", platform: "perplexity", mentioned: false, position: null, sentiment: null, excerpt: null },
  ];

  // Delete existing results for this scan, then recreate
  await prisma.promptResult.deleteMany({ where: { scanId: scan.id } });

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    await prisma.promptResult.create({
      data: {
        id: `res_${i + 1}`,
        scanId: scan.id,
        promptId: r.promptId,
        platform: r.platform,
        mentioned: r.mentioned,
        position: r.position,
        sentiment: r.sentiment,
        excerpt: r.excerpt,
        createdAt: new Date("2026-03-10T08:05:00Z"),
      },
    });
  }

  // 10. Score History (generate 90 days of data)
  const baseDate = new Date("2025-12-11");
  for (let i = 0; i < 90; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // Simulate gradual score improvement
    const mentionScore = Math.min(100, Math.round(20 + i * 0.16 + Math.sin(i / 7) * 3));
    const readinessScore = Math.min(100, Math.round(35 + i * 0.19 + Math.cos(i / 5) * 2));

    await prisma.scoreHistory.upsert({
      where: {
        brandId_date: { brandId, date },
      },
      update: { mentionScore, readinessScore },
      create: { brandId, date, mentionScore, readinessScore },
    });
  }

  console.log("✅ Seed tamamlandı!");
  console.log(`   Profile: ${profile.email}`);
  console.log(`   Brand: ${brand.name} (${brand.domain})`);
  console.log(`   Competitors: ${competitors.length}`);
  console.log(`   Sources: ${sources.length}`);
  console.log(`   Audit categories: ${categories.length}`);
  console.log(`   Action tasks: ${tasks.length}`);
  console.log(`   Prompts: ${prompts.length}`);
  console.log(`   Suggested prompts: ${suggested.length}`);
  console.log(`   Score history: 90 days`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
