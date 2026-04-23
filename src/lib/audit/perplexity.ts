/**
 * Perplexity Sonar brand mention ölçümü (Brief G Aşama 2).
 *
 * Kullanım: test sorgularını Sonar'a atıp marka/domain'in yanıtta
 * geçip geçmediğini tespit eder. AI platform görünürlük sinyali.
 */

const API_URL = "https://api.perplexity.ai/chat/completions";

export type MentionCheck = {
  query: string;
  platform: "perplexity-sonar";
  response: string;
  brandMentioned: boolean;
  position: number | null; // karakter indeksi (kaçıncı pozisyonda geçti)
  citations: string[];
};

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .trim();
}

export async function checkBrandMention(
  brandName: string,
  domain: string,
  queries: string[],
): Promise<MentionCheck[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY env missing");
  }

  const brandLower = normalizeForMatch(brandName);
  const domainLower = normalizeForMatch(domain);

  const results: MentionCheck[] = [];

  for (const query of queries) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: query }],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        console.error(
          "[perplexity] non-OK:",
          res.status,
          await res.text().catch(() => ""),
        );
        continue;
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        citations?: string[];
      };
      const response = data?.choices?.[0]?.message?.content ?? "";
      const responseLower = response.toLowerCase();

      const brandIdx = brandLower ? responseLower.indexOf(brandLower) : -1;
      const domainIdx = domainLower ? responseLower.indexOf(domainLower) : -1;
      const brandMentioned = brandIdx >= 0 || domainIdx >= 0;
      const position = brandMentioned
        ? Math.min(
            brandIdx >= 0 ? brandIdx : Number.MAX_SAFE_INTEGER,
            domainIdx >= 0 ? domainIdx : Number.MAX_SAFE_INTEGER,
          )
        : null;

      results.push({
        query,
        platform: "perplexity-sonar",
        response,
        brandMentioned,
        position,
        citations: data?.citations ?? [],
      });
    } catch (err) {
      console.error("[perplexity] query failed:", query, err);
    }
  }

  return results;
}
