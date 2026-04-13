# GH7.ai — Proje Hafızası

> Bu dosya her Claude Code session'ında otomatik okunur. Projenin mevcut durumunu, mimariyi ve devam edilecek görevleri içerir. **Her önemli değişiklikten sonra güncelle.**

## Proje Nedir?
Türkiye'nin ilk Türkçe GEO (Generative Engine Optimization) platformu. 5 AI platformunda (ChatGPT, Claude, Gemini, Perplexity, Google AIO) markaların nasıl göründüğünü izler, rakip analizi yapar, aksiyon önerir.

## Tech Stack
- Next.js 16 App Router + Tailwind CSS + shadcn/ui
- Prisma ORM + Supabase PostgreSQL
- AI: Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Perplexity, Google AIO (SerpAPI), Qwen (DashScope)
- Supabase Auth (email OTP + Google OAuth)
- İyzico ödeme, Resend email, NetGSM SMS
- Upstash Redis cache
- Vercel deployment (auto-deploy on main merge, branch protection + CI required)

## Paket Yapısı
- **Free** (₺0): 1 kez tarama, 10 sorgu, 1 il, 1 proje, 5 AI platformu
- **Pro** (₺2.450/ay veya ₺2.075/ay yıllık): Haftada 3 sorgu, 20 sorgu, 5 il, 3 proje, haftalık aksiyon, aylık rapor, rakip istihbaratı

## Kritik Dosyalar

### Çekirdek Motor
| Dosya | İşlev |
|-------|-------|
| `src/lib/ai/scan-engine.ts` | Tarama orkestratörü (5 platform × N sorgu × varyasyon) |
| `src/lib/ai/analyzer.ts` | AI yanıt analizi (mention, position, sentiment, citations) |
| `src/lib/ai/providers/` | 5 AI provider (openai, anthropic, perplexity, google, google-aio) |
| `src/lib/ai/prompt-generator.ts` | Sonar + Claude ile sorgu üretimi |
| `src/lib/ai/competitor-discoverer.ts` | Rakip keşfi (Sonar + Claude Opus) — MAX 5 rakip |
| `src/lib/ai/action-plan-generator.ts` | 28 aksiyon üretimi (Claude Opus, GEO sinyal ağırlıklı) |
| `src/lib/ai/blog-generator.ts` | Otomatik blog üretimi (Opus/Qwen) |
| `src/lib/ai/checklist-verifier.ts` | 28 madde doğrulama (scan-based + Sonar) |
| `src/lib/ai/circuit-breaker.ts` | Provider devre kesici (3 hata → 60s timeout) |
| `src/lib/ai/retry.ts` | Exponential backoff (2 retry, 1-10s) |
| `src/lib/ai/dead-letter.ts` | Başarısız sonuç kurtarma (FailedResult tablosu) |

### Panel Sayfaları (Tümü Gerçek DB Verisi Kullanıyor)
| Sayfa | Durum | DAL |
|-------|-------|-----|
| `/panel/gorunurluk` | ✅ Çalışıyor | `getOverviewData()` |
| `/panel/aramalar` | ✅ Çalışıyor | `getPromptsData()` |
| `/panel/iller` | ✅ Çalışıyor | Scan data + city filter |
| `/panel/iyilestirme` | ✅ Çalışıyor | `getChecklistData()` + `getActionsData()` + `getSiteAuditData()` |
| `/panel/aksiyonlar` | ✅ Çalışıyor (PR #56) | `getActionsData()` + `getSituationAnalysis()` |
| `/panel/istihbarat` | ✅ Çalışıyor (PR #56) | `getCompetitorsData()` |
| `/panel/icerik` | ✅ Çalışıyor (PR #56) | `getBlogPostsData()` |
| `/panel/korelasyon` | ✅ Çalışıyor (PR #56) | `getCorrelationData()` |
| `/panel/raporlar` | ✅ Çalışıyor | Prisma scan query |
| `/panel/genel` | ⚠️ Demo data | Hardcoded DEMO_* constants |
| `/panel/rakipler` | ⚠️ Shell | Hardcoded stats |

### Landing + Analiz Sayfaları
| Dosya | Not |
|-------|-----|
| `src/app/page.tsx` | Landing page: aylık/yıllık toggle, 2-paket pricing, trust signals |
| `src/app/analiz/page.tsx` | Free test + sonuç sayfası (1860+ satır monolitik) |
| `src/app/panel/abonelik/page.tsx` | Abonelik: aylık/yıllık toggle, İyzico checkout |

### Checklist Sistemi
- `src/lib/checklist-defaults.ts` — 28 madde (9+10+9, 3 katman), GEO sinyal ağırlıklı
- Katman 1: AI Seni Buluyor mu? (9 madde)
- Katman 2: AI Sana Güveniyor mu? (10 madde)
- Katman 3: AI Seni Öneriyor mu? (9 madde, Pro-only)

### Subscription
- `src/lib/subscription.ts` — 2 tier: free | pro
- `src/lib/plans.ts` — Detaylı plan limitleri
- `src/lib/iyzico/plans.ts` — Fiyatlar (pro: ₺2.495/ay, ₺23.950/yıl)

## Mimari Kurallar
1. **Server Component** pattern: `page.tsx` (async) → DAL çağrısı → props → `*-content.tsx` (client)
2. **DAL** dosyaları: `src/lib/dal/*.ts` — React `cache()` ile dedup
3. **Pro-only** sayfalar: `checkPageAccess("pro")` + redirect
4. **Turkish UI** her yerde — Türkçe karakter desteği (İ,ı,Ş,ş,Ğ,ğ,Ü,ü,Ö,ö,Ç,ç)
5. **Branch protection**: main'e direkt push yok, PR + CI gerekli
6. **GH7Logo** SVG component kullan (text değil)
7. **AI Platform Icons**: `AIPlatformIcon` component with `colored` prop

## Devam Edilecek Görevler (Öncelik Sırasıyla)

### 🔴 Kritik (Sonraki Session)
1. **Analiz sayfasında 10 sorgunun TÜM yanıtlarını göster**
   - Mevcut: QueryPage tek sorgu bazlı, her sorgu ayrı sayfa
   - Hedef: Tek sayfada tüm sorguların tüm platform yanıtları
   - Mimari: Scan sonuçlarından (PromptResult) direkt çekip render etmeli
   - Dosyalar: `src/app/analiz/page.tsx` (1860+ satır, refactor gerekli)

2. **Yanıtlarda marka + rakip isimlerini highlight et**
   - fullResponse içinde marka adı geçiyorsa yeşil highlight
   - Rakip adı geçiyorsa kırmızı/turuncu highlight
   - Her platformun yanıtında kimin bahsedildiği net görünmeli
   - Şeffaflık ilkesi: "bahsediliyor" diyorsa kanıtını göstermeli

3. **Genel bakış paneli** (`/panel/genel`) — demo data → gerçek DB
   - `getOverviewData()` DAL zaten var ve çalışıyor
   - Sadece page.tsx'i server component'a çevirip DAL bağlamak lazım

### 🟡 Önemli
4. **Rakipler paneli** (`/panel/rakipler`) — shell → gerçek DB
5. **Prisma migration** — FailedResult modeli DB'ye push edilmeli (`npx prisma db push`)
6. **Sentry DSN** — Vercel env var'a `NEXT_PUBLIC_SENTRY_DSN` eklenecek
7. **Circuit breaker + retry** — Provider dosyalarına entegre edilecek (şu an modüller var ama provider'lara bağlı değil)

### 🟢 İyileştirme
8. Checklist sync — Mevcut markalar için yeni 6 maddeyi ekle
9. Admin dashboard — sistem sağlığı izleme
10. Analiz sayfası refactor — 1860 satır → component'lara böl

## Son Merge Edilen PR'lar
- PR #53: 2-paket yapısı (Business/Agency kaldır)
- PR #54: Abonelik + sidebar ajans temizlik
- PR #55: Pricing redesign (kartlar, trust signals)
- PR #56: 4 Pro panel sayfası gerçek DB
- PR #57: Aylık/yıllık toggle + circuit breaker + dead-letter + crisis plan
- PR #58: GEO checklist 28 madde + aksiyon motoru
- PR #59: Analiz sayfası iyileştirmeleri + rakip mekanizması

## Env Vars (Vercel'de olmalı)
```
OPENAI_API_KEY, GH7_ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, PERPLEXITY_API_KEY, SERPAPI_KEY
DASHSCOPE_API_KEY, DASHSCOPE_BASE_URL, DASHSCOPE_MODEL
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL, DIRECT_URL
IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
RESEND_API_KEY, NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER=VSIMSIRKAYA
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
CRON_SECRET, NEXT_PUBLIC_APP_URL
```
