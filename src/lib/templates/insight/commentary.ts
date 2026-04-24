/**
 * Free INSIGHT commentary template library (Brief H Aşama 2).
 *
 * 5 skor aralığı × 3 varyant = 15 Türkçe cümle.
 * Deterministic varyant seçimi (pickVariant seed: markaAdi + skor) — aynı
 * kullanıcı her seferinde aynı yorumu görür.
 *
 * Kullanım:
 *   const yorum = generateInsightCommentary({
 *     markaAdi: "İdavilla", skor: 17, maksimumSkor: 25,
 *     platformSayisi: 5, mentionSayisi: 3,
 *     enGuclu: "ChatGPT", enZayif: "Gemini", sektor: "bungalov konaklama",
 *   });
 */

import { renderTemplate, pickVariant } from "../engine";

type CommentaryCategory =
  | "excellent"
  | "good"
  | "average"
  | "weak"
  | "critical";

export const commentaryTemplates: Record<CommentaryCategory, string[]> = {
  // Skor 21-25 (≥84% — mükemmel)
  excellent: [
    "{markaAdi} için olağanüstü bir skor: {skor}/{maksimumSkor}. {sektor} sektöründe AI görünürlüğünüz örnek teşkil ediyor — {platformSayisi} AI platformunun {mentionSayisi}'inde bahsediliyorsunuz. Şimdi odaklanmanız gereken, bu pozisyonu korumak ve haftalık takiple trendi izlemek.",
    "{markaAdi} için {skor}/{maksimumSkor} gibi nadir görülen bir skor elde ettiniz. {enGuclu}'de özellikle güçlüsünüz. {enZayif}'de ise marjinal iyileştirmelerle sektörde lider konuma geçebilirsiniz.",
    "Bu skor ({skor}/{maksimumSkor}) {sektor} kategorisinde üst sıralara işaret ediyor. {platformSayisi} platformdan {mentionSayisi}'inde mevcut görünürlüğünüz, yaptığınız işin AI ekosisteminde doğru yansımasıdır.",
  ],

  // Skor 16-20 (≥64% — iyi)
  good: [
    "{markaAdi} için {skor}/{maksimumSkor} — {sektor} sektöründe sağlam bir pozisyon. {enGuclu}'de öne çıkıyorsunuz, ama {enZayif}'de daha fazla görünür olmak için çalışılabilir. Pro üyelikle hangi sorgularda kaçırdığınızı detaylı görebilirsiniz.",
    "{platformSayisi} AI platformundan {mentionSayisi}'inde bahsediliyorsunuz. Bu iyi bir temel ({skor}/{maksimumSkor}), ama {sektor} kategorisinde lider pozisyona oynamak için yapılandırılmış veri ve içerik optimizasyonu öncelik olmalı.",
    "Skorunuz {skor}/{maksimumSkor}. En güçlü olduğunuz platform {enGuclu}, en zayıfınız {enZayif}. Her biri için farklı strateji gerekiyor — GH7 Audit'te 43 maddelik denetim bunu adım adım gösterir.",
  ],

  // Skor 11-15 (≥44% — orta)
  average: [
    "{markaAdi} AI ekosisteminde henüz orta seviyede ({skor}/{maksimumSkor}). {sektor} sektöründe rekabet güçlü, ama temel optimizasyonlarla hızla yukarı çıkabilirsiniz. {enGuclu}'deki mevcut varlığınız iyi bir başlangıç noktası.",
    "{skor}/{maksimumSkor} skoru, {sektor} pazarında fark yaratmak için aktif çalışma gerektiriyor. {platformSayisi} platformun sadece {mentionSayisi}'inde bahsediliyorsunuz — bu rakamı 2-3 ay içinde ikiye katlamak mümkün.",
    "Mevcut skorunuz {skor}/{maksimumSkor}. {enZayif}'de hiç mention yok, {enGuclu}'de kısmi varlık var. Öncelik: en temel madde olan schema.org ve llms.txt dosyası. Bunlar yapıldığında skor hızla yükselir.",
  ],

  // Skor 6-10 (≥24% — zayıf)
  weak: [
    "{markaAdi} için {skor}/{maksimumSkor} — AI görünürlüğü henüz yapılandırılmamış. {sektor} sektöründe AI sorgularına dahil olmak için teknik altyapı (schema, llms.txt, yapılandırılmış veri) önemli eksik. İyi haber: bu eksiklikler giderildiğinde hızlı ilerleme olur.",
    "Skor {skor}/{maksimumSkor}. {platformSayisi} platformun sadece {mentionSayisi}'inde bahsediliyorsunuz. {sektor} kategorisinde AI sorgularına dahil olmanız için 3 temel adım var: schema.org yapılandırması, llms.txt dosyası, FAQ optimizasyonu.",
    "Bu skor ({skor}/{maksimumSkor}) başlangıç noktası. {markaAdi} için AI görünürlüğü potansiyeli yüksek, ancak temel teknik eksiklikler giderilmeli. GH7 Audit bu 43 maddeyi önceliklendirip size adım adım gösterir.",
  ],

  // Skor 0-5 (<24% — kritik)
  critical: [
    "{markaAdi} şu an AI ekosisteminde neredeyse görünmez ({skor}/{maksimumSkor}). {platformSayisi} platformda mention yok denecek kadar az. {sektor} sektöründe bu durum ciddi bir rekabet dezavantajı yaratır — kullanıcılar AI'ya sorduğunda sizi bulamıyor.",
    "Skor: {skor}/{maksimumSkor}. Bu seviyede AI görünürlüğü temel teknik altyapı eksikliği demek — robots.txt'de AI botlarına izin verilmemiş olabilir, schema.org yapılandırılmamış olabilir, site AI crawlerlar için hazır değil. Öncelik değişimi gerekli.",
    "{skor}/{maksimumSkor} skorunuz, AI ekosisteminde başlangıç noktasında olduğunuzu gösteriyor. İyi haber: 3-4 temel düzeltme ile 2 ay içinde skor 2-3 katına çıkabilir. {sektor} kategorisinde AI-ilk firma olma fırsatınız var.",
  ],
};

export type InsightCommentaryInput = {
  markaAdi: string;
  skor: number;
  maksimumSkor: number;
  platformSayisi: number;
  mentionSayisi: number;
  enGuclu: string;
  enZayif: string;
  sektor: string;
};

function categorize(skor: number, maksimumSkor: number): CommentaryCategory {
  const ratio = maksimumSkor > 0 ? skor / maksimumSkor : 0;
  if (ratio >= 0.84) return "excellent";
  if (ratio >= 0.64) return "good";
  if (ratio >= 0.44) return "average";
  if (ratio >= 0.24) return "weak";
  return "critical";
}

/**
 * Skor verilerine göre deterministik Türkçe commentary üretir.
 * Seed = markaAdi + skor → aynı marka + aynı skor → her çağrıda aynı yorum.
 */
export function generateInsightCommentary(
  input: InsightCommentaryInput,
): string {
  const category = categorize(input.skor, input.maksimumSkor);
  const variants = commentaryTemplates[category];
  const seed = `${input.markaAdi}-${input.skor}`;
  const picked = pickVariant(variants, seed);
  return renderTemplate(picked, {
    markaAdi: input.markaAdi,
    skor: input.skor,
    maksimumSkor: input.maksimumSkor,
    platformSayisi: input.platformSayisi,
    mentionSayisi: input.mentionSayisi,
    enGuclu: input.enGuclu,
    enZayif: input.enZayif,
    sektor: input.sektor,
  });
}

/** Diagnostics: hangi kategoriye düşeceğini gösterir (UI debug için). */
export function getCommentaryCategory(
  skor: number,
  maksimumSkor: number,
): CommentaryCategory {
  return categorize(skor, maksimumSkor);
}
