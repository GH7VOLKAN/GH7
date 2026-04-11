/**
 * GH7.ai — AI Aksiyon Plani Generator
 *
 * Claude Opus ile detayli aksiyon plani uretir.
 * Audit sonuclari + gorunurluk skorlari baz alinarak
 * oncelikli gorev listesi olusturur.
 *
 * Output: ActionTask kayitlari (source: "ai_action_plan")
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import type { AuditResult } from "./site-auditor";

// ─── Types ─────────────────────────────────────────────

interface BrandContext {
  id: string;
  name: string;
  domain: string;
  type: "firma" | "kisisel";
  sector: string | null;
  city: string | null;
  profession: string | null;
  specialties: string[];
}

interface GeneratedAction {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  estimatedTime: string;
  canWeDoIt: boolean;
  selfServiceSteps: string[];
  raasEligible: boolean;
}

// ─── Main Generator ────────────────────────────────────

/**
 * Claude Opus ile AI aksiyon plani uret ve DB'ye kaydet.
 * Mevcut ai_action_plan task'lari silinip yenileri yazilir.
 */
export async function generateActionPlan(
  brand: BrandContext,
  auditResult: AuditResult,
  mentionScore: number,
): Promise<{ generated: number }> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey });

  // Audit sonuclarini ozetle
  const auditSummary = auditResult.categories
    .map((cat) => {
      const checks = cat.checks
        .map((c) => `  - ${c.label}: ${c.status} (${c.score}/10) — ${c.detail}`)
        .join("\n");
      return `${cat.name}:\n${checks}`;
    })
    .join("\n\n");

  // Toplam skor
  const totalEarned = auditResult.categories.reduce(
    (sum, cat) => sum + cat.checks.reduce((s, c) => s + c.score, 0),
    0,
  );
  const totalMax = auditResult.categories.reduce(
    (sum, cat) => sum + cat.checks.length * 10,
    0,
  );
  const readinessScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

  const brandDesc = brand.type === "firma"
    ? `Firma: ${brand.name} | Sektor: ${brand.sector ?? "belirtilmedi"} | Sehir: ${brand.city ?? "belirtilmedi"} | Domain: ${brand.domain}`
    : `Kisi: ${brand.name} | Meslek: ${brand.profession ?? "belirtilmedi"} | Sehir: ${brand.city ?? "belirtilmedi"} | Uzmanliklar: ${brand.specialties.join(", ") || "belirtilmedi"} | Domain: ${brand.domain}`;

  const prompt = `Sen GH7.ai'nin AI aksiyon planlama motorusun. Bir ${brand.type === "firma" ? "firmanin" : "bireyin"} yapay zeka gorunurligunu artirmak icin detayli aksiyon plani olusturacaksin.

${brandDesc}

MEVCUT SKORLAR:
- AI Bahsedilme Skoru: ${mentionScore}/100
- AI Hazirlik Skoru: ${readinessScore}/100

AUDIT SONUCLARI:
${auditSummary}

GEO SINYAL AGIRLIKLARI (ONCELIK SIRASI):
1. Capraz Platform Dogrulama (en yuksek oncelik) — Ayni bilginin 3+ bagimsiz kaynakta tutarli olmasi %72 daha fazla guven saglar
2. Yapilandirilmis Veri / Schema (cok yuksek) — JSON-LD kullanan siteler citation 2.7x daha yuksek
3. Icerik Kalitesi / Chunk Yapisi (yuksek) — 40-80 kelimelik dogrudan yanit bloklari olusturmak kritik
4. Varlik Tanima / Entity (yuksek) — Knowledge Graph'ta net tanimlama
5. Konu Otoritesi (yuksek) — Derinlemesine, guncel, orijinal icerik
6. Yorum Hacmi & Duygu (orta) — Cok platformlu, guncel, pozitif geri bildirim

PLATFORM-SPESIFIK TERCIHLER (her platform farkli kaynaklari onceliklendirir):
- ChatGPT: Wikipedia, akademik kaynaklar, earned media tercih eder
- Perplexity: Guncel web, Q&A formati, YouTube, e-ticaret siteleri tercih eder
- Claude: Uzun form icerik, arastirma, detayli analiz tercih eder
- Gemini: Google ekosistemi (GBP, YouTube, Scholar) tercih eder

KRITIK ARASTIRMA VERILERI:
- 3+ bagimsiz kaynaktan dogrulama = %72 daha fazla guven
- Istatistik iceren sayfalar = citation olasiligi 5.3x daha yuksek
- FAQ Schema = direct answer kaynagi 3.8x daha yuksek
- 6 aydan eski icerikler %45 gerileme gosteriyor
- %70+ pozitif kaynak = %91 varsayilan oneri
- 5 farkli kaynak turu, 20 tek tur kaynaktan %44 daha etkili
- First-mover avantaji: bos alan sorgularinda ilk giren %85 varsayilan kaynak

GOREV:
Yukaridaki verileri VE GEO sinyal agirliklarini kullanarak en etkili aksiyonlari belirle.

KURALLAR:
1. Tam olarak 28 aksiyon uret — 3 katmana dagit:
   - Katman 1: BULUYOR MU? (9 aksiyon) — AI'nin markayi bulabilmesi icin temel adimlar (Google, LinkedIn, site, GBP, dizinler, bot erisimi, llms.txt, chunk yapisi, capraz platform)
   - Katman 2: GUVENIYOR MU? (10 aksiyon) — AI'nin markaya guven duymasi icin adimlar (medya, veri, guncellik, FAQ, site saglik, schema, tutarlilik, referanslar, entity, akademik kaynak)
   - Katman 3: ONERIYOR MU? (9 aksiyon) — AI'nin markayi aktif olarak onermesi icin adimlar (coklu platform, citation, kaynak ustunlugu, otorite, soru cesitliligi, sentiment, bos alanlar, platform-spesifik strateji, itibar yonetimi)
2. Her aksiyonu oncelik, zorluk ve etki bazinda degerlendir
3. Capraz Platform Dogrulama aksiyonlarina EN YUKSEK oncelik ver
4. Chunk-level icerik yapisi olusturma aksiyonlari dahil et
5. Her platform icin spesifik optimizasyon oner (ChatGPT vs Perplexity vs Claude vs Gemini)
6. Istatistik/veri paylasimi aksiyonlarini ust siralara koy (5.3x citation artisi)
7. Negatif duygu kaynaklari varsa "reputation management" aksiyonu ekle
8. "canWeDoIt" = GH7.ai ekibinin RaaS olarak yapip yapamayacagi
9. "selfServiceSteps" = Musterinin kendisi yapmak isterse adim adim talimatlar
10. "raasEligible" = RaaS kapsaminda sunulabilir mi
11. Katman 1 once, sonra Katman 2, sonra Katman 3 gelsin
12. Her aksiyonun gercekci tahmini suresi olsun
13. Fail olan audit check'lerine ozel aksiyonlar uret
14. Mention score dusukse gorunurluk artirici aksiyonlar ekle
15. Her aksiyonun hangi katmana ait oldugunu title basinda belirt: "[K1] ...", "[K2] ...", "[K3] ..."

ZORLUK SEVIYELERI:
- EASY: Kullanici tek basina 30 dk icinde yapabilir
- MEDIUM: 1-3 saat arasi, teknik bilgi gerektirebilir
- HARD: 1+ gun, profesyonel destek onerilen

JSON formatinda dondur — baska hicbir sey yazma:
[
  {
    "title": "Kisa ve net baslik",
    "description": "Detayli aciklama (ne yapilacak, neden onemli, hangi arastirma destekliyor)",
    "priority": "high|medium|low",
    "impact": "Bu aksiyonun beklenen etkisi + ilgili istatistik (1 cumle)",
    "difficulty": "EASY|MEDIUM|HARD",
    "estimatedTime": "30 dakika|1 saat|2-3 saat|1 gun|1 hafta",
    "canWeDoIt": true/false,
    "selfServiceSteps": ["Adim 1", "Adim 2", "Adim 3"],
    "raasEligible": true/false
  }
]`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 6000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const actions: GeneratedAction[] = JSON.parse(jsonStr);

    // Mevcut ai_action_plan task'lari sil
    await prisma.actionTask.deleteMany({
      where: { brandId: brand.id, source: "ai_action_plan" },
    });

    // Yeni task'lari kaydet
    if (actions.length > 0) {
      await prisma.actionTask.createMany({
        data: actions.slice(0, 22).map((a) => ({
          brandId: brand.id,
          title: a.title,
          description: a.description,
          priority: a.priority,
          impact: a.impact,
          source: "ai_action_plan",
          difficulty: a.difficulty,
          estimatedTime: a.estimatedTime,
          canWeDoIt: a.canWeDoIt,
          selfServiceSteps: a.selfServiceSteps,
          raasEligible: a.raasEligible,
        })),
      });
    }

    console.log(`[action-plan] Generated ${actions.length} actions for brand ${brand.id}`);
    return { generated: actions.length };
  } catch (err) {
    console.error("[action-plan] Generation failed:", err);
    return { generated: 0 };
  }
}
