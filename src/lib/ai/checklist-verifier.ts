/**
 * Gelişim Planı — Haftalık Otomatik Doğrulama
 *
 * Sonar ile kontrol ederek checklist maddelerinin durumunu günceller.
 * Örn: "Google'da görünüyor musun?" → Sonar'a sor, sonuca göre status güncelle.
 */

import { prisma } from "@/lib/db";

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

interface VerificationResult {
  itemId: string;
  itemNumber: string;
  previousStatus: string;
  newStatus: string;
  changed: boolean;
}

async function querySonar(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("Perplexity API key not configured");

  const res = await fetch(PERPLEXITY_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.3, // Düşük temperature — doğrulama amacıyla
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Brand'in gelişim planı maddelerini Sonar ile doğrula
 */
export async function verifyChecklistItems(
  brandId: string,
): Promise<{ verified: number; changed: number; results: VerificationResult[] }> {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return { verified: 0, changed: 0, results: [] };

  // Sadece "missing" veya "warning" durumundaki maddeleri kontrol et
  // (complete olanları tekrar kontrol etmeye gerek yok)
  const items = await prisma.checklistItem.findMany({
    where: {
      brandId,
      status: { in: ["missing", "warning"] },
      userMarkedDone: false, // kullanıcı manuel tamamladıysa dokunma
    },
    orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
  });

  if (items.length === 0) return { verified: 0, changed: 0, results: [] };

  // Batch verification — her madde için Sonar'a sor
  const results: VerificationResult[] = [];
  const verifiableItems = items.slice(0, 10); // Max 10 madde/hafta

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

      // Basit analiz: Sonar yanıtında olumlu/olumsuz sinyaller
      const positiveSignals = [
        "evet", "bulunuyor", "mevcut", "gorunuyor", "gorünüyor",
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
      // Eğer hala negatifse mevcut durumu koru

      const changed = newStatus !== item.status;
      if (changed) {
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: {
            status: newStatus,
            verifiedByAI: true,
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

  // Her madde için özel doğrulama sorusu (V3: 22 madde)
  const verificationQuestions: Record<string, string> = {
    // Layer 1: Buluyor mu?
    "1.1": `"${entity}" Google'da aratınca ilk sayfada çıkıyor mu? Web sitesi, sosyal medya profilleri görünüyor mu?`,
    "1.2": `"${entity}" LinkedIn'de aktif bir profili/sayfası var mı? Düzenli paylaşım yapılıyor mu?`,
    "1.3": `"${domain}" web sitesi mevcut mu, aktif mi ve güncel mi?`,
    "1.4": `"${entity}" Google Business Profile'da kayıtlı mı? Profil bilgileri tam mı?`,
    "1.5": `"${entity}" sektörel dizinlerde (sektörel rehberler, dizinler) kayıtlı mı?`,
    "1.6": `"${domain}" web sitesinde yapılandırılmış veri (Schema.org markup, JSON-LD) kullanılıyor mu?`,
    "1.7": `"${domain}" web sitesinde blog veya içerik bölümü var mı? Son 3 ayda yeni içerik yayınlanmış mı?`,
    // Layer 2: Güveniyor mu?
    "2.1": `"${entity}" hakkında haber, blog yazısı, röportaj gibi üçüncü parti içerikler var mı?`,
    "2.2": `"${entity}" sektöründe özgün istatistik, rapor veya veri yayınlamış mı?`,
    "2.3": `"${domain}" web sitesindeki içerikler güncel mi? Son 6 ayda güncelleme yapılmış mı?`,
    "2.4": `"${domain}" web sitesinde FAQ veya soru-cevap formatında içerikler var mı?`,
    "2.5": `"${domain}" web sitesi yapay zeka botları (GPTBot, ClaudeBot) tarafından erişilebilir mi? robots.txt izin veriyor mu?`,
    "2.6": `"${entity}" hakkında müşteri yorumları var mı? Google Reviews, Trustpilot vb.`,
    "2.7": `"${domain}" web sitesinde güvenilirlik işaretleri (hakkımızda, iletişim, sertifikalar) var mı?`,
    "2.8": `"${entity}" hakkında güvenilir kaynaklarda (haber, sektörel yayın) bahsediliyor mu?`,
    // Layer 3: Öneriyor mu?
    "3.1": `"${entity}" ChatGPT, Claude, Gemini ve Perplexity'de sorgulandığında bahsediliyor mu?`,
    "3.2": `"${entity}" rakiplerine kıyasla daha çok mu kaynağı var?`,
    "3.3": `"${entity}" yapay zeka cevaplarında kaynak olarak gösteriliyor mu (citation)?`,
    "3.4": `"${entity}" sektöründe otorite/uzman olarak kabul ediliyor mu?`,
    "3.5": `"${entity}" farklı soru tiplerinde (tavsiye, karşılaştırma, fiyat, lokasyon) yapay zekada çıkıyor mu?`,
    "3.6": `"${domain}" web sitesinde llms.txt dosyası var mı?`,
    "3.7": `"${entity}" rakiplerine kıyasla yapay zekada daha sık mı bahsediliyor?`,
  };

  const question =
    verificationQuestions[itemNumber] ??
    `"${entity}" için şu durum geçerli mi: ${simpleTitle}`;

  return `${question}\n\nKısa ve net cevap ver. Somut bulgularını belirt.`;
}
