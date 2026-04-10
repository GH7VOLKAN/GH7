# GH7.ai Kriz Yönetim Planı

## 1. Veri Yedekleme Stratejisi

### Supabase Otomatik Yedekleme
- Supabase Pro plan: Günlük otomatik PostgreSQL backup (7 gün saklama)
- Point-in-Time Recovery (PITR): Son 7 güne kadar herhangi bir ana dönüş
- Dashboard: Supabase > Settings > Database > Backups

### Kritik Tablolar (Öncelik Sırasıyla)
1. `profiles` — Kullanıcı hesapları + abonelik bilgileri
2. `brands` — Marka bilgileri + ayarlar
3. `prompts` — Sorgu listesi + kategoriler
4. `prompt_results` — Tarama sonuçları (en büyük tablo)
5. `competitors` — Rakip verileri + skorlar
6. `score_history` — Tarihsel skor verileri
7. `payments` — Ödeme geçmişi
8. `action_tasks` — Aksiyon görevleri
9. `checklist_items` — Kontrol listesi öğeleri

### Uygulama Seviyesi Export
- `/api/admin/export` endpoint'i (ileride): Kritik tabloları JSON olarak export
- Önerilen periyot: Haftalık, S3 veya GCS'ye

---

## 2. API Key Rotasyonu Prosedürü

### Genel Adımlar (Tüm Sağlayıcılar)
1. Yeni key oluştur (eski key'i henüz silme)
2. Vercel Environment Variables'da güncelle
3. Yeni deployment tetikle (otomatik olur)
4. Health endpoint'ten doğrula: `GET /api/health`
5. Eski key'i sil/deaktive et

### Provider Bazlı
| Provider | Dashboard | Env Var |
|----------|-----------|---------|
| OpenAI | platform.openai.com/api-keys | `OPENAI_API_KEY` |
| Anthropic | console.anthropic.com/settings/keys | `GH7_ANTHROPIC_API_KEY` |
| Google AI | aistudio.google.com/apikey | `GOOGLE_AI_API_KEY` |
| Perplexity | perplexity.ai/settings/api | `PERPLEXITY_API_KEY` |
| SerpAPI | serpapi.com/manage-api-key | `SERPAPI_KEY` |
| DashScope | dashscope.console.aliyun.com | `DASHSCOPE_API_KEY` |

### Acil Durum (Key Sızıntısı)
1. Hemen eski key'i deaktive et
2. Yeni key oluştur
3. Vercel'de güncelle + redeploy
4. Git geçmişini kontrol et (key commit'lenmemiş olmalı)
5. `.env` dosyaları .gitignore'da olmalı (✅ mevcut)

---

## 3. Provider Kesintisi Playbook

### Tespit
- Health endpoint: `GET /api/health` → `circuitBreakers` alanı
- Circuit breaker durumları: `closed` (normal), `open` (kesinti), `half_open` (test)

### Müdahale Adımları
1. **Tespit (0-5 dk)**: Circuit breaker otomatik açılır, loglara düşer
2. **Değerlendirme (5-15 dk)**: Provider status sayfasını kontrol et
   - OpenAI: status.openai.com
   - Anthropic: status.anthropic.com
   - Google: status.cloud.google.com
3. **Bilgilendirme (15-30 dk)**: Aktif taraması olan kullanıcılara bildirim
4. **Kurtarma**: Circuit breaker 60 saniye sonra otomatik test eder (half_open)
5. **Dead-letter**: Başarısız sonuçlar `failed_results` tablosuna kaydedilir, cron ile retry

### Degraded Service Stratejisi
- 1 provider çöktü: Diğer 4 platformda tarama devam eder, kullanıcıya bilgi
- 2+ provider çöktü: Taramaları duraklat, kullanıcıları bilgilendir
- Tüm providers çöktü: Maintenance mode, mevcut veriler gösterilmeye devam eder

### Provider Fallback Zinciri
- OpenAI: gpt-4o-search → gpt-4o-mini → gpt-3.5-turbo (3 model)
- Anthropic: claude-haiku + web_search → claude-haiku sade (2 mod)
- Her provider kendi içinde fallback yapar, circuit breaker tüm modeller başarısız olursa trip'lenir

---

## 4. Ödeme Hatası Recovery

### Otomatik Süreç
1. İyzico webhook `subscription.order.failure` → Grace period başlat (7 gün)
2. Kullanıcıya e-posta: "Ödemeniz başarısız oldu, 7 gün içinde güncelleyin"
3. Grace period boyunca: Pro özellikler aktif kalır
4. Grace period sonunda: Otomatik free'ye düşür
5. İyzico webhook `subscription.cancel` → Hemen free'ye düşür + bildirim

### Manuel Müdahale Gerektiren Durumlar
- İyzico API kesintisi → Webhook gelmeyebilir, günlük reconciliation cron gerekli
- Çift ödeme → İyzico dashboard'dan iade
- Kullanıcı itirazı → info@gh7.ai + İyzico dispute süreci

### İletişim Şablonları
- Ödeme başarısız: src/lib/email/ dizininde template
- Grace period uyarısı: 3. gün hatırlatma
- Free'ye düşürme: Son bildirim + yeniden abone olma linki

---

## 5. Veri Kaybı Müdahale Planı

### Senaryo 1: Veritabanı Bozulması
1. Supabase PITR ile son sağlıklı noktaya dön
2. Son backup'tan restore
3. Kaybedilen veri periyodunu tespit et
4. Etkilenen kullanıcılara bilgi ver
5. Kaybedilen taramaları yeniden çalıştır

### Senaryo 2: Yanlışlıkla Veri Silme
1. Soft-delete kullan (gelecek: deletedAt alanı ekle)
2. Supabase audit log'larını kontrol et
3. PITR ile spesifik tabloyu recover et

### Senaryo 3: Hesap Silme Sonrası İade Talebi
1. Supabase PITR'den kullanıcı verisini çek
2. Yeni hesap oluştur + veriyi import et
3. Mevcut durum: Hard-delete yapılıyor → Soft-delete'e geçilmeli

---

## 6. Acil İletişim Prosedürü

### Seviye 1 — Düşük (tek provider kesintisi, <1 saat)
- Kim: Geliştirici
- Ne: Circuit breaker log'larını izle, otomatik recovery bekle
- İletişim: Gerekmiyor

### Seviye 2 — Orta (çoklu provider kesintisi, ödeme hatası)
- Kim: Geliştirici + Ürün sahibi
- Ne: Provider status kontrol, kullanıcı bildirimi hazırla
- İletişim: Etkilenen Pro kullanıcılara e-posta

### Seviye 3 — Kritik (veri kaybı, güvenlik ihlali, tam kesinti)
- Kim: Tüm ekip
- Ne: Maintenance mode aktif et, Supabase PITR başlat
- İletişim: Tüm kullanıcılara e-posta + web banner
- Hukuk: KVKK bildirim yükümlülüğü (72 saat içinde)

### İletişim Kanalları
- E-posta: Resend üzerinden toplu bildirim
- Web: Maintenance banner (global banner component)
- WhatsApp: NetGSM üzerinden Pro kullanıcılara SMS

---

## 7. Monitoring Checklist

### Günlük
- [ ] `/api/health` → healthy
- [ ] Circuit breaker'lar closed
- [ ] Cron job'lar çalışıyor (auto-scan, weekly-report)

### Haftalık
- [ ] Failed results tablosu kontrolü (exhausted kayıt var mı?)
- [ ] Sentry error count trendi
- [ ] API provider usage + cost kontrolü

### Aylık
- [ ] Supabase backup doğrulama (test restore)
- [ ] API key yaşları kontrolü (6 aydan eski key'leri rotate et)
- [ ] İyzico reconciliation (ödeme eşleştirme)
