/**
 * Website Analyzer — Perplexity Sonar ile bir web sitesinden
 * ürün ve hizmet bilgilerini çıkarır.
 *
 * Redis ile 7 gün cache. Aynı domain tekrar analiz edilirse sıfır maliyet.
 */

import { querySonar } from "@/lib/ai/sonar-research";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";

export interface WebsiteAnalysis {
  products: string[];
  services: string[];
  sector: string;
  description: string;
}

const DEFAULT_ANALYSIS: WebsiteAnalysis = {
  products: [],
  services: [],
  sector: "",
  description: "",
};

export async function analyzeWebsite(domain: string): Promise<WebsiteAnalysis> {
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (!cleanDomain) return DEFAULT_ANALYSIS;

  // Check cache first
  const cacheKey = makeCacheKey("website-analysis", cleanDomain);
  const cached = await cacheGet<WebsiteAnalysis>(cacheKey);
  if (cached) {
    console.log(`[analyzeWebsite] Cache hit for ${cleanDomain}`);
    return cached;
  }

  console.log(`[analyzeWebsite] Cache miss, querying Perplexity for ${cleanDomain}`);

  const prompt = `Aşağıdaki web sitesini incele ve şirket hakkında bilgi topla:

Website: ${cleanDomain}

Görevin:
1. Bu şirketin sattığı ÜRÜNLERİ listele — sadece fiziksel ürünler, cihazlar, malzemeler (ör: "yerden ısıtma kablosu", "varil ısıtma ceketi")
2. Bu şirketin sunduğu ANA HİZMETLERİ listele — ana faaliyet alanları (ör: "proje danışmanlığı", "kurulum", "bungalov konaklama", "sağlık danışmanlığı")
3. Şirketin faaliyet gösterdiği SEKTÖRÜ belirle
4. Şirket hakkında 1 cümlelik açıklama yaz

KESİN KURALLAR:
- Sadece GERÇEKTEN sattıkları/sundukları şeyleri listele, tahmin yapma, HALÜSİNASYON yapma
- Bir şirket HİZMET sunuyorsa (otel, villa, klinik, danışmanlık vb.) "products" dizisini BOŞ bırak, sadece "services" doldur
- Bir şirket sadece ÜRÜN satıyorsa (e-ticaret, üretici) "services" dizisini BOŞ bırak, sadece "products" doldur
- SATIŞ KAMPANYASI DEĞİL: "peşin ödeme indirimi", "kargo ücretsiz", "taksit imkanı" HİZMET DEĞİLDİR — listeye KOYMA
- Her madde kısa olsun (1-4 kelime), kategori adı değil spesifik olsun
- Maksimum 8 ürün, 5 hizmet listele
- Türkçe cevapla
- Bilgi bulamazsan boş array dön ([])

SADECE aşağıdaki JSON formatında cevapla, başka hiçbir metin yazma:

{
  "products": ["ürün 1", "ürün 2"],
  "services": ["hizmet 1", "hizmet 2"],
  "sector": "Sektör Adı",
  "description": "Kısa açıklama."
}`;

  try {
    const response = await querySonar(prompt);

    // Parse JSON response — may be wrapped in markdown code fence
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[analyzeWebsite] No JSON found in response for ${cleanDomain}`);
      return DEFAULT_ANALYSIS;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<WebsiteAnalysis>;

    const result: WebsiteAnalysis = {
      products: Array.isArray(parsed.products) ? parsed.products.slice(0, 8).filter(Boolean) : [],
      services: Array.isArray(parsed.services) ? parsed.services.slice(0, 5).filter(Boolean) : [],
      sector: typeof parsed.sector === "string" ? parsed.sector : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
    };

    // Cache for 7 days (only if we got some data)
    if (result.products.length > 0 || result.services.length > 0) {
      await cacheSet(cacheKey, result, 7 * 24 * 60 * 60);
    }

    return result;
  } catch (err) {
    console.error(`[analyzeWebsite] Error for ${cleanDomain}:`, err);
    return DEFAULT_ANALYSIS;
  }
}
