# Brief N v4 — Smoke Test Klavuzu

Brief N v4 canlıya indi, Brief I yazılmadan önce pipeline'ın gerçek veriyle çalıştığını doğrulamak için 4 smoke test scripti hazır.

## Hızlı Akış

```bash
# 1. URL fetch — 1 dakika, env gerekmez
npx tsx scripts/brief-n/smoke-source-fetch.ts

# 2. Qwen üretim — 1 dakika, QWEN_API_KEY gerekir
npx tsx scripts/brief-n/smoke-generate.ts idavilla

# 3. Kategori funnel — 30 saniye, PERPLEXITY_API_KEY gerekir
npx tsx scripts/brief-n/smoke-funnel.ts idavilla perplexity

# 4. Tam pipeline (opsiyonel, uzun) — 3-4 dakika, hepsi gerekir
npx tsx scripts/brief-n/smoke-full.ts idavilla
```

Toplam süre: ~5 dakika. Hepsi DB'ye yazmaz (dry-run).

---

## Test 1: `smoke-source-fetch` — URL bot block kontrolü

13 kritik 3. taraf platformu (Tripadvisor, Booking, Hotels.com, Expedia, Etstur, Tatil.com, Otelz, Wikipedia, Hürriyet, Milliyet, Zomato, Wikidata, Google Maps) test eder.

**Beklenen çıktı:**
```
DOMAIN                                   STATUS    SÜRE    BOYUT   IMG
tripadvisor.com                          ✓ OK      850ms   187k    img
booking.com                              ✗ BLOK    1200ms  —       
...
```

**Kırmızı bayraklar:**
- 5+ platform `BLOK` — score-source-dominance çoğu kaynağı neutral sayar, UI'da "kaynak analizi sınırlı" uyarısı göstermeli
- Tripadvisor + Booking ikisi birden blokta — konaklama kategorisi için kritik, alternatif veri kaynağı düşünülmeli

**Yeşil bayraklar:**
- En az 3 konaklama platformu OK

---

## Test 2: `smoke-generate` — Qwen sorgu kalitesi

Bir brandSlug için `generateNicheQueries` + `generateCategoryQueries` paralel çalıştırır, terminale 10 niş + 10 kategori funnel basar.

**Beklenen çıktı:**
```
🎯 NİŞ BİLİNİRLİK SORGULARI
01. Edremit Körfezi'nde evcil hayvanla kalabileceğim bungalov
    Aile dostu, pet-friendly tesis arayan kullanıcı
...

🏆 KATEGORİ HAKİMİYETİ FUNNELLERİ
01. [EASY] orderIndex=1
    Step 1: Bungalov tatili için önerilen tesisler Türkiye
    Step 2: Ege bölgesinde özellikle neler var?
    Step 3: Evcil hayvan dostu ve aile için olanlar hangileri?
...

KALİTE KONTROLÜ:
  • Niş sayısı: 10/10 ✓
  • Kategori sayısı: 10/10 ✓
  • Zorluk dağılımı: EASY=3, MEDIUM=4, HARD=3
```

**Kırmızı bayraklar:**
- Sorguda marka adı geçiyor (script ⚠ ile işaretler — brief yasağı)
- Zorluk dağılımı bozuk (3-4-3 beklenir)
- Funnel step'leri genel/soyut: "Türkiye'de konaklama" tipi (spesifik lokasyon yok)
- Step 2/3 Step 1'den farklı değil (daraltma yapmıyor)
- Sadece 5-6 sorgu üretildi (yetersiz)

**Yeşil bayraklar:**
- Sorgular spesifik + doğal Türkçe
- Funnel Step 1→2→3 daraltma gözle görülüyor
- Zorluk dağılımı 3-4-3

**Not:** İlk test için **İdavilla** önerilir (gerçek brand, tanıdığın sektör).

---

## Test 3: `smoke-funnel` — Uçtan uca funnel

Bir brand için sabit bir kategori sorgu + 3-adım funnel + 1 platformda çalıştırma + rank extraction + source extraction.

```bash
# Default sorgu (sector+city otomatik)
npx tsx scripts/brief-n/smoke-funnel.ts idavilla perplexity

# Özel sorgu
npx tsx scripts/brief-n/smoke-funnel.ts idavilla perplexity \
  "bungalov tatili Türkiye önerileri" \
  "Ege'de hangi tesisler öne çıkıyor?" \
  "Evcil hayvan dostu ve özel havuzlu olanlar?"
```

**Beklenen çıktı:**
```
✓ Tamamlandı: 45.2s
  foundAtStep: 3
  rank: 2
  listLength: 5

▸ STEP 1: bungalov tatili Türkiye önerileri
── Response (ilk 800 char) ──
Türkiye'de önerilen bungalov tesisleri şunlar...
── Extraction ──
  mentioned: false
  extractedBrands (5): Hak Enerji, Antik Vadi, ...

▸ STEP 2: Ege'de hangi tesisler öne çıkıyor?
...
  mentioned: false

▸ STEP 3: Evcil hayvan dostu ve özel havuzlu olanlar?
...
  mentioned: true
  rank: 2
```

**Kırmızı bayraklar:**
- `source: "qwen"` her step'te (regex parser çalışmıyor → Qwen fallback pahalı)
- `extractedBrands` boş hepsinde (AI liste veriyor ama parser çekemiyor)
- Step 1'de bulundu ama Step 2'de de çalışmış (erken dur çalışmıyor)
- Step fail/error
- Perplexity'de `sources` boş (citations alanı native değil)

**Yeşil bayraklar:**
- Step 1 bulunduysa sadece 1 step çalışmış (erken dur ✓)
- `extractedBrands` 3+ rakip gerçek marka adı
- `source: "regex"` (ücretsiz fast path)
- Perplexity için URL listesi çıkmış

---

## Test 4: `smoke-full` — Tam pipeline

5 adım tek bir markayla: generate → niş 1 platform → kategori funnel → source fetch + analiz → scoring engine.

**3-4 dakika sürer. ~$0.05-0.10 Qwen + Perplexity maliyeti.**

**Beklenen sonuç tablosu:**
```
GENEL DEĞERLENDIRME:
  ✓ Qwen üretim: OK
  ✓ Niş pipeline: OK
  ✓ Kategori funnel: 3/3 step başarılı
  ✓ Kaynak fetch: 4/5 erişilebilir
  ✓ Scoring: çalışıyor
```

Bu test tüm parçaları birbirine bağlar — kritik bir bug tek bir testte yakalansa bile burada manifesto olur.

---

## Beklenen Bulgular (ön-tahmin)

Aşağıdakileri önceden tahmin ediyorum — çıkarsa sürpriz değil:

1. **Tripadvisor / Booking bot blok** — büyük olasılık. Çoğu site GH7Bot'u tanımaz, Cloudflare 403. `scoreSourceDominance` bunları `unreachable=neutral` sayar. Eğer onaylarsan UI'da "kaynak analizi sınırlı" uyarısı Brief N-fix'e girer.

2. **Perplexity citations eksik bazı sorularda** — Perplexity bazen citations döndürmez (özellikle kısa cevaplarda). `extractFromPerplexity` content regex'e düşer, zaten var — sorun değil.

3. **Rank extractor Qwen fallback'a sık düşebilir** — AI cevapları her zaman numaralı liste değil; paragraf formatındaysa regex boş döner. Qwen pahalı değil ama frekans ölçülmeli.

4. **Google AIO provider citations yok** — bilinen eksik. Fetch'lenebilir URL'leri serpapi `organic_results`'ten çekmek future work.

5. **Qwen zaman zaman 9 sorgu / 11 sorgu** — model max_tokens sınırına takılırsa kırpılır. `smoke-generate` bunu saym — <5 ise hata atar.

---

## Çıktıları nasıl paylaş

1. Her smoke test çıktısını terminalden kopyala (ya da `>` ile dosyaya yaz)
2. UI ekran görüntüleri: dashboard home + /category + /sources
3. Yargılarınla birlikte bana yolla:
   - "Niş sorguları gerçek arayanlara benziyor mu?"
   - "Funnel Step 1 → Step 2 daraltma yapıyor mu?"
   - "Kaynaklar kategoriye uygun mu (Tripadvisor yerine garip site mi?)"
   - "Dashboard skor breakdown'u anlamlı mı?"

Bulgulara göre:
- ✅ Hepsi OK → Brief I yazarım
- ⚠️ Küçük düzeltmeler → "Brief N-fix" mini PR listesi
- 🔴 Büyük sorun → Birlikte spec'i revize ederiz

---

## Ek Not: Maliyet

- `smoke-source-fetch`: **$0** (sadece HTTP)
- `smoke-generate`: **~$0.01-0.02** (Qwen 2 paralel üretim)
- `smoke-funnel`: **~$0.01-0.05** (platform × 3 adım, Perplexity $1/1M token)
- `smoke-full`: **~$0.05-0.10** (hepsi birden)

Toplam tüm testler: **$0.15 altı**. Endişelenme.
