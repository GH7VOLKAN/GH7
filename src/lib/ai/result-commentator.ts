/**
 * Sonuç yorumlayıcı — Opus analiz çıktısını okur, kullanıcı için
 * kişiselleştirilmiş yorum yazar. Sonuç sayfasında "Claude'un Analizi"
 * bölümünde gösterilir.
 *
 * Mesajın 3 bileşeni:
 *   1. Skor durumu değerlendirmesi
 *   2. Rakip durumu analizi (en güçlü 1-2 rakibe yorum)
 *   3. GEO/Pro'ya yumuşak geçiş + aksiyon önerisi
 *
 * Ton: dürüst, keskin, "Shazam anı" hissi veren, korku değil merak uyandıran.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  CandidateCompetitor,
  FirmProfile,
} from "@/lib/analiz/types";

const MODEL = "claude-sonnet-4-20250514";

export async function generateResultCommentary(
  profile: FirmProfile,
  userMentions: number,
  totalPossible: number,
  candidates: CandidateCompetitor[],
  healingAttempted: boolean,
): Promise<string> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const topCompetitors = candidates.slice(0, 5);
  const scoreRatio = totalPossible > 0 ? userMentions / totalPossible : 0;

  let scoreCategory: "strong" | "medium" | "weak";
  if (scoreRatio >= 0.6) scoreCategory = "strong";
  else if (scoreRatio >= 0.25) scoreCategory = "medium";
  else scoreCategory = "weak";

  const prompt = `Sen GH7.ai'nin analiz yorumcususun. Bir firmanın AI görünürlük analizi tamamlandı, sonuçları sen yorumluyorsun. Kullanıcı senin yorumunu raporun en etkileyici kısmı olarak görecek.

FİRMA:
- İsim: ${profile.name}
- Sektör: ${profile.sector}
- Konum: ${[profile.location.district, profile.location.city, profile.location.country].filter(Boolean).join(", ") || "belirtilmedi"}
- Ayırt edici özellikler: ${profile.distinctives.join(", ") || "yok"}
- Ürünler: ${profile.products.join(", ") || "yok"}

ANALİZ SONUCU:
- AI görünürlük skoru: ${userMentions}/${totalPossible} (${Math.round(scoreRatio * 100)}%)
- Durum: ${scoreCategory === "strong" ? "GÜÇLÜ" : scoreCategory === "medium" ? "ORTA" : "ZAYIF"}
- Self-heal tetiklendi mi: ${healingAttempted ? "Evet (ilk sorgularda çıkamadı)" : "Hayır"}
- En çok anılan rakipler: ${topCompetitors.map((c) => `${c.name} (${c.mentionCount})`).join(", ")}

GÖREV: 3-4 paragraflık bir analiz yorumu yaz. Aşağıdaki yapıya sadık kal:

PARAGRAF 1 — Durum tespiti (40-60 kelime):
Skoru yorumla. ${scoreCategory === "strong" ? "Güçlü konumu öv, ama şımartma." : scoreCategory === "medium" ? "Orta düzeyi nötr anlat — ne iyi ne kötü, potansiyel var." : "Zayıf durumu direkt söyle, suçlama değil, gerçeklik."} Hangi AI'da nerede olduğunu söyle.

PARAGRAF 2 — Rakip analizi (50-70 kelime):
En çok anılan 1-2 rakibi analiz et. Neden AI'lar onları ön plana çıkarıyor? Dil/stil: "${topCompetitors[0]?.name} her sorguda anılıyor, bu şu anlama geliyor..." Rakibin güçlü yönü ne, zayıf yönü ne varsa belirt.

PARAGRAF 3 — GEO/Pro ticari vaat (60-80 kelime):
"Google'da aranmaktan AI'da anılmaya geçiş yapısal bir değişim" cümlesiyle başla, sonra Pro'nun ticari vaadini net söyle. 43 madde + sürekli takip sayesinde KULLANICI NE KAZANACAK somut konuşulsun:

- "Rakiplerinin önüne geçmek"
- "Daha çok müşteri tarafından fark edilmek"
- "AI müşteriye firma önerirken senin adının geçmesi"
- "Satışlarını büyütmek"

Ton: iddialı ama gerçekçi. "Mümkün" değil "gerçekçi bir hedef, seni bekliyor" tarzı. Müşteri okuyunca "bu benim için değerli" demeli.

Örnek cümle: "43 madde sistemli uygulandığında, ${profile.name} rakiplerinin önüne geçmek, AI önerilerinde sürekli anılan firma haline gelmek ve daha çok satış gerçekleştirmek gerçekçi bir hedef — seni bekliyor."

PARAGRAF 4 — Somut eylem (30-45 kelime):
İlk yapılacak 1 net şey. 43 maddeden bir tanesini seç, ${profile.name}'e uygun olanı, başla eylem cümlesiyle: "${profile.name} için ilk 3 hafta içinde en kritik iş..."

TON:
- Dürüst, spesifik, kişiye özel (jenerik cümle YOK)
- "Siz/seniz" kullan, "kullanıcımız" YOK
- Korku satışı YOK, ama gerçeği yumuşatma — ${scoreCategory === "weak" ? "zayıf durumu sakla" : "kazanmış gibi davran"}
- Firma adını 2-3 kez kullan — kişiselleştirme belli olsun

MARKDOWN:
- Paragraflar arasında boş satır
- **Bold** kullanarak önemli metrikleri vurgula
- Liste YOK, düz paragraf

Sadece yorumu yaz, başlık veya preamble YAZMA.`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    return block?.type === "text" ? block.text.trim() : "";
  } catch (err) {
    console.error("[result-commentator] failed:", err);
    return "";
  }
}
