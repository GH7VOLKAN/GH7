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
  const apiKey = process.env.ANTHROPIC_API_KEY;
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

GOREV:
Yukaridaki verileri analiz ederek yapay zeka gorunurlugunu artirmak icin en etkili aksiyonlari belirle.

KURALLAR:
1. Maksimum 15 aksiyon uret
2. Her aksiyonu oncelik, zorluk ve etki bazinda degerlendir
3. "canWeDoIt" = GH7.ai ekibinin bu isi musteri adina RaaS (Result as a Service) olarak yapip yapamayacagi
4. "selfServiceSteps" = Musterinin kendisi yapmak isterse adim adim talimatlar
5. "raasEligible" = RaaS kapsaminda sunulabilir mi
6. Aksiyonlari oncelik sirasina gore sirala (high > medium > low)
7. Her aksiyonun gercekci bir tahmini suresi olsun
8. Fail olan audit check'lerine ozel aksiyonlar uret
9. Mention score dusukse gorunurluk artirici aksiyonlar ekle

ZORLUK SEVIYELERI:
- EASY: Kullanici tek basina 30 dk icinde yapabilir
- MEDIUM: 1-3 saat arasi, teknik bilgi gerektirebilir
- HARD: 1+ gun, profesyonel destek onerilen

JSON formatinda dondur — baska hicbir sey yazma:
[
  {
    "title": "Kisa ve net baslik",
    "description": "Detayli aciklama (ne yapilacak, neden onemli)",
    "priority": "high|medium|low",
    "impact": "Bu aksiyonun beklenen etkisi (1 cumle)",
    "difficulty": "EASY|MEDIUM|HARD",
    "estimatedTime": "30 dakika|1 saat|2-3 saat|1 gun|1 hafta",
    "canWeDoIt": true/false,
    "selfServiceSteps": ["Adim 1", "Adim 2", "Adim 3"],
    "raasEligible": true/false
  }
]`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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
        data: actions.slice(0, 15).map((a) => ({
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
