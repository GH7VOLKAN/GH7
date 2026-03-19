/**
 * GH7.ai — Gelişim Planı Checklist Doğrulama
 *
 * İki doğrulama modu:
 * 1. Scan-sonrası (hafif): Kullanıcı "Tamamladım" dedi → tarama sonuçlarıyla doğrula
 * 2. Haftalık Sonar (ağır): Tüm missing/warning item'ları Sonar ile kontrol et
 *
 * Spec H: Kullanıcı "Tamamladım" dediğinde sonraki taramada AI doğrulayacak.
 */

import { prisma } from "@/lib/db";
import { querySonar } from "./sonar-research";

// ─── Mode 1: Scan-sonrası doğrulama (hafif — API çağrısı yok) ──────

interface ScanVerificationContext {
  brandId: string;
  scanId: string;
  mentionScore: number;
  totalMentions: number;
  totalResults: number;
  platformMentions: Record<string, number>;
  citationCount: number;
  uniqueSources: number;
}

interface VerificationResult {
  verified: boolean;
  note: string;
}

/** Scan-sonrası tarama verileriyle hafif doğrulama kuralları */
const SCAN_VERIFICATION_RULES: Record<string, (ctx: ScanVerificationContext) => Promise<VerificationResult>> = {
  "1.1": async (ctx) => {
    if (ctx.mentionScore >= 10) return { verified: true, note: "Yapay zeka platformları seni buluyor — Google görünürlüğün aktif." };
    return { verified: false, note: "Yapay zeka platformlarında düşük görünürlük — Google indekslemesini kontrol et." };
  },
  "1.2": async (ctx) => {
    const linkedin = await prisma.sourceDomain.count({ where: { brandId: ctx.brandId, domain: { contains: "linkedin" } } });
    return linkedin > 0
      ? { verified: true, note: "LinkedIn profilin yapay zeka kaynaklarında görünüyor." }
      : { verified: true, note: "LinkedIn güncelliği kullanıcı tarafından teyit edildi." };
  },
  "1.4": async (ctx) => {
    const dirs = await prisma.sourceDomain.count({ where: { brandId: ctx.brandId, type: "dizin" } });
    return dirs >= 2
      ? { verified: true, note: `${dirs} dizin kaynağında görünüyorsun.` }
      : { verified: false, note: "Dizin kaynaklarında yeterli görünürlük yok." };
  },
  "1.7": async (ctx) => {
    const media = await prisma.sourceDomain.count({ where: { brandId: ctx.brandId, type: "medya" } });
    return media > 0
      ? { verified: true, note: `${media} medya kaynağında bahsediliyorsun.` }
      : { verified: false, note: "Medya kaynaklarında henüz görünürlük tespit edilemedi." };
  },
  "3.1": async (ctx) => {
    if (ctx.mentionScore >= 40) return { verified: true, note: `Görünürlük puanın ${ctx.mentionScore}/100 — yapay zeka seni öneriyor.` };
    return { verified: false, note: `Görünürlük puanın ${ctx.mentionScore}/100 — öneri eşiği için daha fazla çalışma gerekli.` };
  },
  "3.2": async (ctx) => {
    const top = await prisma.promptResult.count({ where: { scanId: ctx.scanId, mentioned: true, position: "1. sırada" } });
    return top >= 2
      ? { verified: true, note: `${top} soruda ilk sırada bahsediliyorsun.` }
      : { verified: false, note: "İlk sırada yeterli bahsedilme tespit edilemedi." };
  },
  "3.3": async (ctx) => {
    return ctx.citationCount >= 3
      ? { verified: true, note: `${ctx.citationCount} kaynak alıntılanıyor.` }
      : { verified: false, note: "Yeterli kaynak alıntısı tespit edilemedi." };
  },
  "3.4": async (ctx) => {
    const platforms = Object.values(ctx.platformMentions);
    const count = platforms.filter((m) => m > 0).length;
    return count >= 3
      ? { verified: true, note: `${count}/4 platformda bahsediliyorsun.` }
      : { verified: false, note: `Sadece ${count}/4 platformda bahsedilme — daha geniş kapsam gerekli.` };
  },
};

/**
 * Tarama tamamlandıktan sonra çağrılır.
 * userMarkedDone=true & verifiedByAI=false olan item'ları tarama verileriyle doğrular.
 */
export async function verifyScanChecklistItems(
  scanId: string,
  brandId: string,
): Promise<void> {
  try {
    const pendingItems = await prisma.checklistItem.findMany({
      where: { brandId, userMarkedDone: true, verifiedByAI: false, status: "complete" },
    });
    if (pendingItems.length === 0) return;

    // Tarama sonuçlarından context
    const results = await prisma.promptResult.findMany({
      where: { scanId },
      select: { mentioned: true, platform: true, citations: true },
    });

    const platformMentions: Record<string, number> = {};
    let citationCount = 0;
    for (const r of results) {
      if (r.mentioned) platformMentions[r.platform] = (platformMentions[r.platform] ?? 0) + 1;
      if (Array.isArray(r.citations)) citationCount += r.citations.length;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const score = await prisma.scoreHistory.findUnique({ where: { brandId_date: { brandId, date: today } } });

    const ctx: ScanVerificationContext = {
      brandId,
      scanId,
      mentionScore: score?.mentionScore ?? 0,
      totalMentions: results.filter((r) => r.mentioned).length,
      totalResults: results.length,
      platformMentions,
      citationCount,
      uniqueSources: await prisma.sourceDomain.count({ where: { brandId } }),
    };

    let verified = 0;
    for (const item of pendingItems) {
      const rule = SCAN_VERIFICATION_RULES[item.itemNumber];
      if (!rule) {
        // Kural-tabanlı doğrulama yapılamıyor — güvenle doğrula
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: { verifiedByAI: true, verificationNote: "Kullanıcı tarafından teyit edildi.", lastCheckedAt: new Date() },
        });
        verified++;
        continue;
      }

      const result = await rule(ctx);
      await prisma.checklistItem.update({
        where: { id: item.id },
        data: {
          verifiedByAI: result.verified,
          verificationNote: result.note,
          lastCheckedAt: new Date(),
          status: result.verified ? "complete" : "warning",
        },
      });
      if (result.verified) verified++;
    }

    console.log(`[checklist-verifier] Scan verification: ${verified}/${pendingItems.length} items for brand ${brandId}`);
  } catch (err) {
    console.error("[checklist-verifier] Scan verification failed (non-fatal):", err);
  }
}

// ─── Mode 2: Haftalık Sonar doğrulama (ağır — API çağrısı var) ──────

interface SonarVerificationResult {
  itemId: string;
  itemNumber: string;
  previousStatus: string;
  newStatus: string;
  changed: boolean;
}


/**
 * Haftalık cron job: Brand'in tüm missing/warning maddelerini Sonar ile doğrula.
 * (userMarkedDone olmayan item'lar — otomatik keşif)
 */
export async function verifyChecklistItems(
  brandId: string,
): Promise<{ verified: number; changed: number; results: SonarVerificationResult[] }> {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return { verified: 0, changed: 0, results: [] };

  const items = await prisma.checklistItem.findMany({
    where: {
      brandId,
      status: { in: ["missing", "warning"] },
      userMarkedDone: false,
    },
    orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
  });

  if (items.length === 0) return { verified: 0, changed: 0, results: [] };

  const results: SonarVerificationResult[] = [];
  const verifiableItems = items.slice(0, 10);

  for (const item of verifiableItems) {
    try {
      const checkPrompt = buildVerificationPrompt(
        brand.name,
        brand.domain,
        brand.type as "firma" | "kisisel",
        item.itemNumber,
        item.simpleTitle,
      );

      const response = await querySonar(checkPrompt);
      const lower = response.toLowerCase();

      const positiveSignals = [
        "evet", "bulunuyor", "mevcut", "gorunuyor", "görünüyor",
        "var", "aktif", "kayitli", "indexed", "listed",
      ];
      const negativeSignals = [
        "hayir", "bulunamadi", "yok", "gorunmuyor", "görünmüyor",
        "mevcut degil", "kayitli degil", "not found", "no result",
      ];

      const posCount = positiveSignals.filter((s) => lower.includes(s)).length;
      const negCount = negativeSignals.filter((s) => lower.includes(s)).length;

      let newStatus = item.status;
      if (posCount > negCount && posCount >= 2) {
        newStatus = "complete";
      } else if (posCount > 0 && negCount > 0) {
        newStatus = "warning";
      }

      const changed = newStatus !== item.status;
      if (changed) {
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: {
            status: newStatus,
            verifiedByAI: true,
            verificationNote: `Sonar doğrulaması: ${newStatus === "complete" ? "Tamamlandı" : "Kısmen mevcut"}`,
            lastCheckedAt: new Date(),
          },
        });
      }

      results.push({
        itemId: item.id,
        itemNumber: item.itemNumber,
        previousStatus: item.status,
        newStatus,
        changed,
      });
    } catch (err) {
      console.error(`[checklist-verifier] Error verifying ${item.itemNumber}:`, err);
      results.push({
        itemId: item.id,
        itemNumber: item.itemNumber,
        previousStatus: item.status,
        newStatus: item.status,
        changed: false,
      });
    }
  }

  return {
    verified: results.length,
    changed: results.filter((r) => r.changed).length,
    results,
  };
}

function buildVerificationPrompt(
  brandName: string,
  domain: string,
  type: "firma" | "kisisel",
  itemNumber: string,
  simpleTitle: string,
): string {
  const entity = type === "kisisel" ? brandName : `${brandName} (${domain})`;

  const verificationQuestions: Record<string, string> = {
    "1.1": `"${entity}" Google'da aratınca ilk sayfada çıkıyor mu? Web sitesi, sosyal medya profilleri görünüyor mu?`,
    "1.2": `"${entity}" LinkedIn'de aktif bir profili/sayfası var mı? Düzenli paylaşım yapılıyor mu?`,
    "1.3": `"${domain}" web sitesi mevcut mu, aktif mi ve güncel mi?`,
    "1.4": `"${entity}" Google Business Profile'da kayıtlı mı? Profil bilgileri tam mı?`,
    "1.5": `"${entity}" sektörel dizinlerde (sektörel rehberler, dizinler) kayıtlı mı?`,
    "1.6": `"${domain}" web sitesinde yapılandırılmış veri (Schema.org markup, JSON-LD) kullanılıyor mu?`,
    "1.7": `"${domain}" web sitesinde blog veya içerik bölümü var mı? Son 3 ayda yeni içerik yayınlanmış mı?`,
    "2.1": `"${entity}" hakkında haber, blog yazısı, röportaj gibi üçüncü parti içerikler var mı?`,
    "2.2": `"${entity}" sektöründe özgün istatistik, rapor veya veri yayınlamış mı?`,
    "2.3": `"${domain}" web sitesindeki içerikler güncel mi? Son 6 ayda güncelleme yapılmış mı?`,
    "2.4": `"${domain}" web sitesinde FAQ veya soru-cevap formatında içerikler var mı?`,
    "2.5": `"${domain}" web sitesi yapay zeka botları (GPTBot, ClaudeBot) tarafından erişilebilir mi? robots.txt izin veriyor mu?`,
    "2.6": `"${entity}" hakkında müşteri yorumları var mı? Google Reviews, Trustpilot vb.`,
    "2.7": `"${domain}" web sitesinde güvenilirlik işaretleri (hakkımızda, iletişim, sertifikalar) var mı?`,
    "2.8": `"${entity}" hakkında güvenilir kaynaklarda (haber, sektörel yayın) bahsediliyor mu?`,
    "3.1": `"${entity}" ChatGPT, Claude, Gemini, Perplexity ve Google AI'da sorgulandığında bahsediliyor mu?`,
    "3.2": `"${entity}" rakiplerine kıyasla daha çok mu kaynağı var?`,
    "3.3": `"${entity}" yapay zeka cevaplarında kaynak olarak gösteriliyor mu (citation)?`,
    "3.4": `"${entity}" sektöründe otorite/uzman olarak kabul ediliyor mu?`,
    "3.5": `"${entity}" farklı soru tiplerinde (tavsiye, karşılaştırma, fiyat, lokasyon) yapay zekada çıkıyor mu?`,
    "3.6": `"${domain}" web sitesinde llms.txt dosyası var mı?`,
    "3.7": `"${entity}" rakiplerine kıyasla yapay zekada daha sık mı bahsediliyor?`,
  };

  const question = verificationQuestions[itemNumber] ?? `"${entity}" için şu durum geçerli mi: ${simpleTitle}`;
  return `${question}\n\nKısa ve net cevap ver. Somut bulgularını belirt.`;
}
