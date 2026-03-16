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

  // Her madde için özel doğrulama sorusu
  const verificationQuestions: Record<string, string> = {
    "1.1": `"${entity}" Google'da aratınca ilk sayfada çıkıyor mu? Web sitesi, sosyal medya profilleri görünüyor mu?`,
    "1.2": `"${domain}" web sitesinde yapılandırılmış veri (Schema.org markup, JSON-LD) kullanılıyor mu?`,
    "1.3": `"${entity}" LinkedIn'de aktif bir profili/sayfası var mı? Düzenli paylaşım yapılıyor mu?`,
    "1.4": `"${domain}" web sitesinde blog veya içerik bölümü var mı? Son 3 ayda yeni içerik yayınlanmış mı?`,
    "1.5": `"${entity}" sektörel dizinlerde (sektörel rehberler, dizinler) kayıtlı mı?`,
    "2.1": `"${domain}" web sitesinde SSL sertifikası, hızlı yüklenme süresi ve mobil uyumluluk mevcut mu?`,
    "2.2": `"${entity}" hakkında müşteri yorumları, değerlendirmeler var mı? Google Reviews, Trustpilot vb.`,
    "2.3": `"${entity}" sektöründe otorite gösteren içerikler (araştırma, vaka çalışması, whitepaper) yayınlanmış mı?`,
    "2.4": `"${domain}" web sitesinde güvenilirlik işaretleri (hakkımızda sayfası, iletişim bilgileri, sertifikalar) var mı?`,
    "2.5": `"${entity}" hakkında diğer güvenilir kaynaklarda (haber siteleri, sektörel yayınlar) bahsediliyor mu?`,
    "3.1": `"${entity}" rakiplerine kıyasla daha fazla mı yoksa daha az mı bahsediliyor online ortamda?`,
    "3.2": `"${domain}" web sitesinde llms.txt dosyası veya yapay zeka botlarına özel erişim ayarları var mı?`,
    "3.3": `"${entity}" sosyal medyada ve online platformlarda düzenli olarak sektörel içerik paylaşıyor mu?`,
    "3.4": `"${entity}" sektöründe öncü olarak kabul ediliyor mu? Etkinliklerde konuşmacı, panelist olarak yer alıyor mu?`,
    "3.5": `"${entity}" markalı içerik ve düşünce liderliği stratejisi uyguluyor mu?`,
  };

  const question =
    verificationQuestions[itemNumber] ??
    `"${entity}" için şu durum geçerli mi: ${simpleTitle}`;

  return `${question}\n\nKısa ve net cevap ver. Somut bulgularını belirt.`;
}
