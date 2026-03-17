# GH7.ai TASARIM DÖNÜŞÜMÜ — Kinde.com Tarzı
# Her sidebar sekmesi = bir landing page (hero + scroll + kartlar)
# Referans: kinde.com dashboard, prototip dosyası: gh7-prototype-v2.jsx

---

## KONSEPT

Mevcut dashboard yapısını KORU (sidebar, sayfalar, veri bağlantıları).
SADECE görsel katmanı değiştir.

Her sidebar sekmesi tıklandığında sağ tarafta bir landing page açılır:
- En üstte HERO bölüm (büyük başlık, tek mesaj, 3 saniyede anlaşılır)
- Aşağı scroll ettikçe bölümler beliriyor (fade-in animasyon)
- Her bölüm arasında boşluk, nefes alan tasarım
- Kartlar Kinde body style — beyaz, ince border, rounded-2xl

## GENEL KURALLAR

### Layout
```
Sidebar (256px, beyaz, sabit) | Ana alan (scroll, #fafafa background)
```

### Header — MİNİMAL
```
Sadece 2 element:
Sol: sidebar toggle butonu (◀ / ▶)
Sağ: kullanıcı avatar (daire, 30px)

KALDIR: sayfa başlığı, "Tarama Başlat" butonu, "Son tarama" yazısı, 
bildirim ikonu. Header neredeyse görünmez olmalı.

sticky, backdrop-blur, yarı saydam background
```

### Font
```css
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

Hero başlık:    56px, font-weight 800, letter-spacing -2px, color #111
Bölüm başlık:  28px, font-weight 800, letter-spacing -0.5px, color #111
Bölüm alt yazı: 14px, font-weight 400, color #999
Kart başlık:    15px, font-weight 600, color #111
Kart body:      14px, font-weight 400, color #666
Etiket:         11px, font-weight 500
Üst label:      12px, uppercase, letter-spacing 3px, color #bbb
```

### Renkler
```css
Background:     #fafafa
Kart:           #ffffff, border 1px solid #eee, border-radius 20px
Hover:          border-color #ddd, translateY(-3px), box-shadow 0 8px 30px rgba(0,0,0,0.06)
Text primary:   #111111
Text secondary: #888888  
Text muted:     #bbbbbb
Accent:         #111111 (butonlar, "sen" barı, vurgular)

Platform renkleri (SADECE logo/ikonlarda):
ChatGPT:    #10a37f
Claude:     #d97706
Gemini:     #4285f4
Perplexity: #14b8a6

Durum:
Başarılı:   #22c55e (✓)
Uyarı:      #eab308 (⚠)
Eksik:      #ef4444 (✗)
```

### Motion Animasyonlar (Kinde tarzı)

```tsx
// 1. Scroll'a gelince fade-in (her bölüm için)
// IntersectionObserver kullan
const FadeIn = ({ children, delay = 0 }) => {
  // Görünür olduğunda: opacity 0→1, translateY(30px)→0
  // transition: 0.7s ease
};

// 2. Stagger — çocuk elementler sırayla beliriyor
// Platform kartları, soru kartları, değişim kartları
// Her kart 80ms arayla

// 3. Animated progress bar
// Scroll'a gelince bar soldan sağa açılır
// transition: width 0.8s cubic-bezier(0.4,0,0.2,1)

// 4. Animated counter
// Sayılar 0'dan hedefe doğru sayar
// "0 → 4" gibi, 1.2 saniyede

// 5. Hover micro-interactions
// Kartlar: translateY(-3px) + gölge
// Butonlar: scale(1.03)
// Expand kartlar: smooth max-height transition

// 6. Sidebar geçişi: width 0.3s cubic-bezier(0.4,0,0.2,1)
```

### AI Platform Logoları — SVG

```tsx
// Her platformun renkli daire SVG logosu olmalı
// Boyutlar: 28px (kart içi), 36px (hero bölüm)
// Mentioned = tam opaklık
// Not mentioned = opacity 0.25

// ChatGPT: yeşil daire + beyaz OpenAI ikonu
// Claude: turuncu daire + beyaz Anthropic ikonu  
// Gemini: mavi daire + beyaz Google ikonu
// Perplexity: turkuaz daire + beyaz P ikonu
```

---

## SAYFA SAYFA TASARIM

### GENEL BAKIŞ

```
HERO (merkez, büyük):
  üst label: "YAPAY ZEKA DURUM RAPORU" (12px, uppercase, #bbb)
  başlık: "4 yapay zekadan\n2'si seni tanıyor" (56px, 800 weight)
  "2" animated counter ile sayar
  altında: ince progress bar (180px genişlik) + "%50"
  en alt: "10 soruda, 2'sinde seni öneriyor · Son tarama: 2 saat önce" (#888)

scroll ↓ (fade-in)

PLATFORM KARTLARI (4 sütun grid, gap 14):
  Her kart: beyaz, ince border, rounded-20px, padding 28px
  İçinde: SVG logo (36px) → platform adı → skor (32px, 800 weight) → açıklama
  Aktif platform: border-color platform rengi (opacity 0.3)
  Pasif platform (0/10): gri, "henüz tanımıyor"
  Hover: translateY(-4px) + platform renginde gölge
  Stagger animation: sırayla beliriyor

scroll ↓ (fade-in)

SENİN YERİNE KİM (tam genişlik):
  başlık: "Senin yerine kim öneriliyor?" (28px)
  alt yazı: "Yapay zekaların senin yerine önerdiği firmalar" (#999)
  
  Bar listesi:
  Her satır: isim (160px) | animated bar | %skor
  "Sen" satırı: background #f8f8f8, isim bold, bar #111 (siyah)
  Rakipler: bar #d4d4d4 (gri)
  Barlar scroll'a gelince soldan sağa açılır (stagger)

scroll ↓ (fade-in)

BU HAFTA DEĞİŞENLER (2 sütun grid):
  Her kart: beyaz, rounded-16px, ikon + başlık + alt yazı
  İkon: 34px kare, rounded-10px
  İyi haber: ikon bg #f0fdf4, renk #22c55e
  Kötü haber: ikon bg #fef2f2, renk #ef4444
  Kartlar stagger ile beliriyor

scroll ↓ (fade-in)

ŞİMDİ NE YAPMALISIN:
  başlık: "Şimdi ne yapmalısın?" (28px)
  alt yazı: "Kolay olanlar önce — hemen başlayabilirsin"
  
  Expand kartları:
  ✗ + başlık + yapılabilirlik (●●●●○) + expand ikonu (+)
  Tıklayınca: smooth expand (max-height transition)
  İçinde: açıklama + süre/etki + "Adım adım rehber →" butonu
  Buton: bg #111, text #fff, rounded-full, hover scale

scroll ↓ (fade-in)

PRO CTA (sayfanın en altı):
  ProUpgradeCard type="trend"
  "Bu sonuçlar değişiyor mu? Haftalık takiple trendinizi görün."
  Buton: "Haftalık takibe başla → 2.495₺/ay"
```

### SORULAR

```
HERO:
  üst label: "SORU ANALİZİ"
  başlık: "10 sorunun 4'ünde\nçıkıyorsun" (56px)
  "4" animated counter

scroll ↓

FİLTRE BUTONLARI:
  [Tümü] [Öneri] [Karşılaştırma] [Fiyat]
  Aktif: bg #111, text #fff, rounded-full
  Pasif: bg transparent, border #e5e5e5, text #888
  
scroll ↓

SORU KARTLARI (2 sütun grid — web kanban / mobile yatay scroll):
  Her kart: beyaz, rounded-20px, padding 24px
  İçinde:
  - Etiketler: [Yerden ısıtma] (bg #f5f5f5) + [Öneri] (bg #111, text #fff)
  - Soru metni (15px, 600 weight, tırnak içinde)
  - Platform logoları: SVG 28px, mentioned=tam opaklık, not=opacity 0.25
  - "3/4" yazısı
  - "Senin yerine: ABC Isıtma" satırı
  Hover: translateY(-3px) + gölge
  Stagger animation

scroll ↓

PRO CTA:
  "Bu sorularda ilerliyor musun? Haftalık takip et."
```

### RAKİPLER

```
HERO:
  üst label: "RAKİP ANALİZİ"
  başlık: "Senin yerine kim\nöneriliyor?" (56px)

scroll ↓

GENEL SIRALAMA:
  Animated bar chart (Genel Bakış'takiyle aynı ama daha detaylı)
  "Sen" siyah bar, bold isim, hafif arka plan

scroll ↓

PLATFORM BAZLI SIRALAMA:
  4 kart yan yana (her platform)
  Her kartta: logo + platform adı + 1. 2. 3. sıralama
  "Sen" satırı: bold + ✓ işareti
  "Claude'da yoksun ✗ — gelişim planında buna odaklan."

scroll ↓

"NEDEN ÖNDE?" EXPAND KARTLARI:
  Her rakip için expand kart
  İçinde: kaynak karşılaştırma (sen vs rakip)
  İkon bazlı: [🌐] Web sitesi ✓/✗, [in] LinkedIn ✓/✗ vb.
  "3 fark var, kapatabilirsin"

scroll ↓

PRO CTA:
  "Rakiplerin bu hafta ne yaptı? Takipte kal."
```

### KAYNAKLAR

```
HERO:
  üst label: "KAYNAK ANALİZİ"  
  başlık: "Yapay zeka seni\nnereden öğrenmiş?" (56px)

scroll ↓

KAYNAK İKONLARI (büyük kartlar, 3 sütun):
  Her kart: beyaz, rounded-20px
  Sol: büyük renkli ikon (LinkedIn mavi, Google renkli, vb.)
  Sağ: kaynak adı + durum + kullanım sıklığı
  Aktif kaynak: renkli
  Eksik kaynak: gri + "EKSİK" etiketi + "Bu kaynağı ekle" link

scroll ↓

DOLULUK:
  "5 kaynaktan 2'si aktif"
  "3 kaynağı aktif et, yapay zekadaki görünürlüğün artar."

scroll ↓

PRO CTA
```

### SITE KONTROLÜ

```
HERO:
  üst label: "SİTE ANALİZİ"
  başlık: "Siten yapay zekaya\nne kadar hazır?" (56px)

scroll ↓

KONTROL LİSTESİ (tek sütun, tam genişlik kartlar):
  Her kontrol: beyaz kart, sol ✓/⚠/✗ ikon + başlık + durum
  ✓ SSL sertifikası — Var
  ✓ Sitemap.xml — Var
  ⚠ Sayfa hızı — 65/100, iyileştirilebilir
  ✗ FAQ Schema — Yok, en önemli eksik
  ✗ llms.txt — Yok
  
  "Toplam: 4/8 kontrol geçti"

scroll ↓

PRO CTA
```

### GELİŞİM PLANI (sidebar'dan erişilir)

```
HERO:
  üst label: "GELİŞİM PLANI"
  başlık: "22 adımda yapay zekada\ngörünür ol" (56px)
  altında: "8/22 tamamlandı" + animated progress bar

scroll ↓

KATMAN 1: BULUYOR MU? (5/7):
  Bölüm başlığı + ilerleme barı
  Her madde: expand kart
  ✓ tamamlanan: yeşil sol border
  ⚠ eksik: sarı sol border  
  ✗ yok: kırmızı sol border
  
  Expand: doktor abi açıklama + teknik detay + "Adım adım yapayım →"

scroll ↓

KATMAN 2: GÜVENİYOR MU? (3/8)

scroll ↓

KATMAN 3: ÖNERİYOR MU? (0/7)

scroll ↓

PRO CTA:
  "FAQ sayfası oluşturdun mu? Yapay zekanın fark edip etmediğini
   gelecek hafta kontrol edelim."
```

---

## MOBİL UYUM

```
Mobile'da:
- Sidebar → hamburger menü (slide-in)
- Alt tab bar: [Genel] [Sorular] [Rakip] [Kaynak] [Gelişim]
- Grid kartlar: 2 sütun → 1 sütun
- Soru/rakip kartları: yatay scroll (swipe) — overflow-x auto, snap
- Hero başlık: 56px → 36px
- Kart padding: 24px → 16px

Yatay scroll kart örneği:
<div style="display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;">
  {cards.map(card => (
    <div style="min-width: 280px; scroll-snap-align: start;">
      {card}
    </div>
  ))}
</div>
```

---

## ÖNEMLİ

1. API route'lara DOKUNMA
2. Veri modellerine DOKUNMA
3. Supabase bağlantılarına DOKUNMA
4. SADECE component'ler ve sayfa layout'ları değişecek
5. Mevcut veri bağlantılarını koru — sadece gösterim şeklini değiştir
6. Prototip referans: gh7-prototype-v2.jsx (outputs klasöründe)
7. kinde.com'u tarayıcıda aç, dashboard'unu incele, aynı hissi ver
