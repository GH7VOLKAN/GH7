"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DEMO_PERSONAL_KEYWORDS,
  PERSONAL_PROFESSIONS,
} from "@/data/demo-personal";
import {
  Globe,
  MessageSquare,
  MessageCircle,
  BarChart3,
  FileText,
  CheckCircle,
  X,
  Shield,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Package,
  Plus,
} from "lucide-react";
import {
  generateWhatsAppShareLink,
  generatePdfShareMessage,
} from "@/lib/whatsapp";
import { GH7Logo } from "@/components/gh7-logo";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import { CityMultiselect } from "@/components/ui/city-multiselect";
import { normalizeTurkish } from "@/lib/utils/turkish";
import { Audit43Report } from "@/components/analiz/audit-43-report";
import { PersonalAnalysisBox } from "@/components/analiz/personal-analysis-box";
import { ServicePackagesCTA } from "@/components/analiz/service-packages-cta";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 0 | 1 | 1.5 | 2 | 3;
// Legacy "kisisel" kod için backward compat: "kisi" === "kisisel" semantik olarak
type AnalysisType = "firma" | "kisi" | "kisisel" | "eticaret" | "yurtdisi";

// kisisel → kisi migration helper
function isPersonalType(t: AnalysisType): boolean {
  return t === "kisi" || t === "kisisel";
}

interface FormData {
  analysisType: AnalysisType;
  domain: string;
  heroInput: string;
  email: string;
  phone: string;
  otp: string;
  kvkkAccepted: boolean;
  brandName: string;
  websiteUrl: string;
  sector: string;
  cities: string[];
  keywords: string[];
  // kisisel/kisi fields
  fullName: string;
  profession: string;
  linkedinUrl: string;
  expertise: string; // YENİ: uzmanlık alanı (kisi için zorunlu)
  socialMedia: string; // YENİ: sosyal medya handle (kisi için ops)
  // E-ticaret fields
  ecommerceMode: "website" | "marketplace" | "brand";
  marketplaceUrl: string;
  brandOrProductName: string;
  category: string;
  // Yurtdışı fields
  targetMarkets: string;
  siteLanguage: string;
  // Ortak opsiyonel
  competitor: string; // Bilinen rakip (hint)
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_KEYWORDS = [
  "yerden ısıtma yaptıracağım firma önerir misin",
  "Türkiye'de en iyi yerden ısıtma firması hangisi",
  "heat trace boru ısıtma kablosu nereden alabilirim",
  "endüstriyel varil ısıtma ceketi en iyi marka",
  "çatı kar eritme sistemi kuracağım firma öner",
  "sera ısıtma sistemi hangi firma yapıyor",
  "yerden ısıtma mı radyatör mü daha ekonomik",
  "elektrikli yerden ısıtma en güvenilir marka",
  "boru donma önleme kablosu teklif nereden alırım",
  "karbon film yerden ısıtma mı kablolu mu tercih etmeliyim",
];

const LOADING_STEPS = [
  { text: "Firmanız araştırılıyor...", duration: 1200, icon: Globe, platform: null as AIPlatform | null },
  { text: "Ürünleriniz taranıyor...", duration: 1000, icon: Package, platform: null as AIPlatform | null },
  { text: "ChatGPT'ye soruyoruz...", duration: 1000, icon: MessageSquare, platform: "chatgpt" as AIPlatform | null },
  { text: "Gemini'den yanıt alınıyor...", duration: 1000, icon: MessageSquare, platform: "gemini" as AIPlatform | null },
  { text: "Perplexity kontrol ediliyor...", duration: 1000, icon: MessageSquare, platform: "perplexity" as AIPlatform | null },
  { text: "Claude'a danışıyoruz...", duration: 1000, icon: MessageSquare, platform: "claude" as AIPlatform | null },
  { text: "Google AI Overview taranıyor...", duration: 1000, icon: MessageSquare, platform: "google_aio" as AIPlatform | null },
  { text: "Ürün bazlı rakipleriniz tespit ediliyor...", duration: 800, icon: BarChart3, platform: null as AIPlatform | null },
  { text: "Raporunuz hazırlanıyor...", duration: 800, icon: FileText, platform: null as AIPlatform | null },
];


interface ProductItem {
  name: string;
  checked: boolean;
  autoDetected: boolean;
}

const DEMO_FIRMA_PRODUCTS: ProductItem[] = [
  { name: "Yerden ısıtma kablosu (elektrikli)", checked: true, autoDetected: true },
  { name: "Heat trace boru ısıtma kablosu", checked: true, autoDetected: true },
  { name: "Çatı kar buz eritme sistemi", checked: true, autoDetected: true },
  { name: "Varil ısıtma ceketi", checked: true, autoDetected: true },
  { name: "Sera ısıtma kablosu", checked: true, autoDetected: true },
  { name: "Karbon film ısıtıcı", checked: false, autoDetected: true },
];

const DEMO_FIRMA_SERVICES: ProductItem[] = [
  { name: "Proje tasarımı", checked: true, autoDetected: true },
  { name: "Teknik destek", checked: true, autoDetected: true },
];

const DEMO_PERSONAL_PRODUCTS: ProductItem[] = [
  { name: "Diz protezi ameliyatı", checked: true, autoDetected: true },
  { name: "Artroskopi", checked: true, autoDetected: true },
  { name: "Spor yaralanmaları", checked: true, autoDetected: true },
  { name: "Omuz cerrahisi", checked: false, autoDetected: true },
];

/* Product-based competitor rankings for Layer 3 */
const PRODUCT_RANKINGS = [
  {
    product: "Yerden Isıtma Kablosu",
    rankings: [
      { name: "Warmup", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "aynı" },
      { name: "ISITMAX", queryCount: 2, totalQueries: 5, trend: "up" as const, trendNote: "geçen hafta 3.ydü" },
      { name: "Giacomini", queryCount: 2, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
    ],
  },
  {
    product: "Heat Trace Boru Isıtma",
    rankings: [
      { name: "ISITMAX", queryCount: 4, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "Danfoss", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "nVent Raychem", queryCount: 1, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Çatı Kar Buz Eritme",
    rankings: [
      { name: "ISITMAX", queryCount: 3, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "Warmup", queryCount: 2, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
      { name: "Ensto", queryCount: 1, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Varil Isıtma Ceketi",
    rankings: [
      { name: "RezistansMarket", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "ISITMAX", queryCount: 2, totalQueries: 5, trend: "up" as const, trendNote: "geçen hafta 4.ydü" },
      { name: "Danfoss", queryCount: 2, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Sera Isıtma Kablosu",
    rankings: [
      { name: "ISITMAX", queryCount: 4, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "EnerSerji", queryCount: 2, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "Warmup", queryCount: 1, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
    ],
  },
];

interface DemoPlatformResponse {
  provider: string;
  response: string;
  sources: string[];
  brandMentioned: boolean;
}

interface DemoQueryGroup {
  keyword: string;
  platforms: DemoPlatformResponse[];
}

const DEMO_QUERY_RESPONSES: DemoQueryGroup[] = [
  {
    keyword: "villa banyosu için elektrikli yerden ısıtma",
    platforms: [
      { provider: "ChatGPT", response: "Villa banyoları için elektrikli yerden ısıtma sistemleri, özellikle karbon film ve ısıtma kabloları olarak iki ana kategoriye ayrılır. Isıtmax gibi yerli üreticiler, seramik ve doğal taş altına uygun, uzun ömürlü çözümler sunmaktadır...", sources: ["isitmax.com", "enerserji.com.tr", "warmup.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Villa banyolarında elektrikli yerden ısıtma konforlu ve enerji verimli bir çözümdür. Karbon film ve rezistans kablolu olmak üzere iki temel sistem mevcuttur. Warmup ve Isıtmax gibi markalar bu alanda öne çıkmaktadır...", sources: ["warmup.com.tr", "isitmax.com"], brandMentioned: true },
      { provider: "Perplexity", response: "Villa banyoları için elektrikli yerden ısıtma, seramik ve doğal taş zeminlerde verimli bir ısınma sağlar. Türkiye'de Warmup, Giacomini ve Isıtmax tercih edilen markalardır...", sources: ["isitmax.com", "warmup.com.tr", "giacomini.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Villa banyolarında yerden ısıtma, konfor ve hijyen açısından ideal bir çözümdür. Elektrikli sistemlerde ince profilli kablolar veya mat sistemler tercih edilir. Doğal taş uyumluluğu önemlidir...", sources: ["warmup.com.tr", "danfoss.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Elektrikli yerden ısıtma, villa banyolarında sıklıkla tercih edilen bir ısınma yöntemidir. Rezistans kablolu ve karbon film olmak üzere ikiye ayrılır. Isıtmax gibi yerli üreticiler uygun fiyatlı çözümler sunmaktadır...", sources: ["isitmax.com", "enerserji.com.tr"], brandMentioned: true },
    ],
  },
  {
    keyword: "endüstriyel varil ısıtma çeketi fiyat",
    platforms: [
      { provider: "ChatGPT", response: "Endüstriyel varil ısıtma çeketleri kimya ve gıda sektörlerinde yaygın olarak kullanılır. 200 litrelik standart variller için fiyatlar 2.000-8.000 TL arasında değişir. RezistansMarket ve Danfoss bu alanda öncü markalardır...", sources: ["rezistansmarket.com", "danfoss.com.tr"], brandMentioned: false },
      { provider: "Gemini", response: "Endüstriyel varil ısıtma çeketleri, kimya ve gıda sektörlerinde sıvı sıcaklığı korumak için kullanılır. Türkiye pazarında Isıtmax, RezistansMarket ve Danfoss gibi markalar öne çıkıyor...", sources: ["isitmax.com", "rezistansmarket.com", "danfoss.com.tr"], brandMentioned: true },
      { provider: "Perplexity", response: "Varil ısıtma çeketleri endüstriyel proseslerde kritik bir bileşendir. Silikon ve fiberglas malzemeli modeller mevcuttur. Fiyatlar varil boyutu ve güce göre 1.500-10.000 TL aralığında değişir...", sources: ["rezistansmarket.com", "heattrace.com.tr"], brandMentioned: false },
      { provider: "Claude", response: "Varil ısıtma çeketleri; kimyasal, gıda ve petrol sektörlerinde sıvıların donmasını ve viskozite kaybını önler. Isıtmax, farklı varil boyutlarına uygun silikon kaplı modeller üretmektedir...", sources: ["isitmax.com", "rezistansmarket.com"], brandMentioned: true },
      { provider: "AI Overview", response: "Endüstriyel varil ısıtma çeketleri 200L ve IBC konteyner boyutlarında mevcuttur. Termostat kontrollü modeller enerji tasarrufu sağlar. Fiyatlar 2.000 TL'den başlamaktadır...", sources: ["rezistansmarket.com", "firmamnet.com"], brandMentioned: false },
    ],
  },
  {
    keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
    platforms: [
      { provider: "ChatGPT", response: "Yüzey altı boru ısıtma kabloları, donma riskine karşı boru hatlarını korumak için kullanılır. Self-regulating ve sabit güçlü olmak üzere iki tip mevcuttur. Isıtmax ve nVent Raychem bu alanda güvenilir çözümler sunar...", sources: ["isitmax.com", "nvent.com"], brandMentioned: true },
      { provider: "Gemini", response: "Boru ısıtma kabloları termal koruma sağlar. Heat trace sistemleri endüstriyel ve konut uygulamalarında kullanılır. Self-regulating kablolar enerji verimliliği açısından öne çıkar...", sources: ["heattrace.com.tr", "danfoss.com.tr"], brandMentioned: false },
      { provider: "Perplexity", response: "Boru ısıtma kabloları; donma önleme, sıcaklık koruma ve akış sağlama amaçlı kullanılır. Isıtmax'ın heat trace serisi endüstriyel uygulamalarda tercih edilmektedir...", sources: ["isitmax.com", "heattrace.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Yüzey altı boru ısıtma için self-regulating kablolar en yaygın çözümdür. Bu kablolar ortam sıcaklığına göre güçlerini otomatik ayarlar. nVent Raychem ve Danfoss önde gelen markalardır...", sources: ["nvent.com", "danfoss.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Yüzey altı boru ısıtma kabloları; donmayı önlemek (heat trace), sıcaklığı korumak veya akışkanlığı sağlamak için kendinden regüleli veya sabit güçlü kablolar olarak ayrılır...", sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"], brandMentioned: true },
    ],
  },
  {
    keyword: "serada enerji verimli ısıtma sistemi",
    platforms: [
      { provider: "ChatGPT", response: "Sera ısıtmasında enerji verimliliği için toprak altı ısıtma kabloları ve hava üflemeli sistemler tercih edilir. Isıtmax'ın sera ısıtma kabloları düşük enerji tüketimi ile öne çıkmaktadır...", sources: ["isitmax.com", "tarim.gov.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Sera ısıtmasında en verimli yöntemler arasında toprak altı ısıtma kabloları, sıcak su borulu sistemler ve infrared ısıtıcılar yer alır. Toprak altı kablolar kök bölgesini doğrudan ısıtarak enerji tasarrufu sağlar...", sources: ["tarim.gov.tr", "seracilik.org"], brandMentioned: false },
      { provider: "Perplexity", response: "Seralarda enerji verimli ısıtma için toprak altı ısıtma kabloları, hava üfleyicili sistemler ve hibrit çözümler tercih edilmektedir. Isıtmax'ın sera ısıtma kabloları enerji verimli seçenekler arasında yer almaktadır...", sources: ["isitmax.com", "tarim.gov.tr", "seracilik.org"], brandMentioned: true },
      { provider: "Claude", response: "Sera ısıtmasında enerji verimliliği kritik bir faktördür. Toprak altı ısıtma kabloları, kök bölgesini doğrudan ısıtarak %30-40 enerji tasarrufu sağlayabilir. EnerSerji ve Isıtmax bu alanda çözümler sunmaktadır...", sources: ["isitmax.com", "enerserji.com.tr"], brandMentioned: true },
      { provider: "AI Overview", response: "Seralarda enerji verimli ısıtma yöntemleri arasında toprak altı ısıtma, fan coil sistemler ve güneş enerjisi destekli hibrit çözümler bulunur...", sources: ["tarim.gov.tr", "seracilik.org"], brandMentioned: false },
    ],
  },
  {
    keyword: "çatıda kar buz eritme kablo çözümleri",
    platforms: [
      { provider: "ChatGPT", response: "Çatı ve oluk sistemlerinde kar buz eritme için self-regulating ısıtma kabloları en etkili çözümdür. Isıtmax ve Warmup bu alanda geniş ürün yelpazesi sunmaktadır...", sources: ["isitmax.com", "warmup.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Çatıda kar ve buz eritme için kendinden ayarlı (self-regulating) ısıtma kabloları kullanılır. Bu kablolar oluk, çatı kenarı ve iniş borularına uygulanır. Warmup ve Ensto markalar tercih edilmektedir...", sources: ["warmup.com.tr", "ensto.com"], brandMentioned: false },
      { provider: "Perplexity", response: "Çatı kar buz eritme sistemleri self-regulating ve sabit güçlü kablolardan oluşur. Isıtmax'ın çatı ısıtma kabloları Türkiye iklim koşullarına uygun olarak tasarlanmıştır...", sources: ["isitmax.com", "heattrace.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Çatı ve oluk sistemlerinde kar ve buz birikmesini önlemek için self-regulating (kendinden ayarlı) ısıtma kabloları kullanılır. Bu kablolar ortam sıcaklığına göre güç tüketimini otomatik ayarlar...", sources: ["warmup.com.tr", "isitmax.com", "heattrace.com.tr"], brandMentioned: true },
      { provider: "AI Overview", response: "Çatılarda kar ve buz eritme kablo sistemleri oluklarda ve çatı kenarlarında birikmesini engeller. Self-regulating tipi kablolar enerji verimliliği açısından tercih edilir...", sources: ["warmup.com.tr", "ensto.com"], brandMentioned: false },
    ],
  },
  {
    keyword: "yerden ısıtma kablosu m2 fiyat",
    platforms: [
      { provider: "ChatGPT", response: "Yerden ısıtma kablosu fiyatları metrekare başına 200-600 TL arasında değişmektedir. Fiyat, kablo tipi, marka ve güç yoğunluğuna göre farklılık gösterir. Isıtmax, ekonomik yerli seçenekler sunmaktadır...", sources: ["isitmax.com", "warmup.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Elektrikli yerden ısıtma kablosu m2 fiyatları 250-700 TL aralığındadır. Karbon film sistemler daha ekonomik, rezistans kablolu sistemler daha dayanıklıdır. Warmup ve Giacomini premium segmentte yer alır...", sources: ["warmup.com.tr", "giacomini.com.tr"], brandMentioned: false },
      { provider: "Perplexity", response: "Yerden ısıtma kablosu fiyatları m2 başına ortalama 300-500 TL'dir. Isıtmax yerli üretim avantajıyla rekabetçi fiyatlar sunmaktadır. İşçilik dahil toplam maliyet m2 başına 400-900 TL olabilir...", sources: ["isitmax.com", "enerserji.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Yerden ısıtma kablolarında m2 fiyatları sisteme göre değişir. Rezistans kablo 200-400 TL/m2, karbon film 300-600 TL/m2, sulu sistem 400-800 TL/m2 aralığındadır...", sources: ["warmup.com.tr", "heattrace.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Yerden ısıtma kablosu metrekare fiyatları Türkiye'de 200-700 TL arasında değişir. Isıtmax ve Warmup en çok tercih edilen markalar arasındadır...", sources: ["isitmax.com", "warmup.com.tr", "giacomini.com.tr"], brandMentioned: true },
    ],
  },
  {
    keyword: "heat trace kablo nedir nasıl çalışır",
    platforms: [
      { provider: "ChatGPT", response: "Heat trace kablo, boru hatlarını donmaya karşı koruyan elektrikli ısıtma sistemidir. Self-regulating ve sabit güçlü olmak üzere iki tipi vardır. Isıtmax Türkiye'de heat trace çözümleri sunan yerli üreticilerden biridir...", sources: ["isitmax.com", "heattrace.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Heat trace, boru hatlarında sıcaklık koruması sağlayan bir elektrikli ısıtma teknolojisidir. Endüstriyel tesislerde donma önleme ve viskozite kontrolü için kullanılır. nVent Raychem ve Danfoss lider markalar arasındadır...", sources: ["nvent.com", "danfoss.com.tr"], brandMentioned: false },
      { provider: "Perplexity", response: "Heat trace kablolar boruların üzerine veya altına montajlanarak donmayı engeller. Self-regulating tipi ortam sıcaklığına göre otomatik güç ayarı yapar. Isıtmax bu teknolojide Türkiye'de çözümler sunmaktadır...", sources: ["isitmax.com", "heattrace.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Heat trace (boru ısıtma) sistemleri, endüstriyel boru hatlarında donmayı ve viskozite sorunlarını önler. İki ana tip vardır: self-regulating (otomatik ayarlı) ve constant wattage (sabit güçlü)...", sources: ["heattrace.com.tr", "nvent.com"], brandMentioned: false },
      { provider: "AI Overview", response: "Heat trace, boru hatlarının donmasını önleyen elektrikli ısıtma kablosudur. Self-regulating versiyonu enerji verimli çalışır. Endüstriyel tesislerde yaygın kullanılır...", sources: ["heattrace.com.tr", "isitmax.com"], brandMentioned: true },
    ],
  },
  {
    keyword: "karbon film ısıtıcı avantajları dezavantajları",
    platforms: [
      { provider: "ChatGPT", response: "Karbon film ısıtıcılar ince profili ve hızlı ısınma özelliğiyle öne çıkar. Avantajları: düşük profil, hızlı ısınma, sessiz çalışma. Dezavantajları: yüksek ilk yatırım maliyeti. Isıtmax karbon film ürünleriyle Türkiye pazarında yer almaktadır...", sources: ["isitmax.com", "enerserji.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Karbon film ısıtıcılar infrared ısı yayarak doğrudan nesneleri ısıtır. Avantajları arasında ince profil, düşük enerji tüketimi ve sessiz çalışma yer alır. Dezavantajı olarak yüksek ilk maliyet ve sınırlı güç yoğunluğu sayılabilir...", sources: ["enerserji.com.tr"], brandMentioned: false },
      { provider: "Perplexity", response: "Karbon film ısıtıcıların avantajları: ultra ince tasarım, hızlı ısınma, düşük enerji tüketimi, uzun ömür. Dezavantajları: mobilya altına uygulanamaması ve yüksek maliyet. Isıtmax ve EnerSerji Türkiye'deki tedarikçilerdir...", sources: ["isitmax.com", "enerserji.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Karbon film ısıtıcılar infrared teknolojisiyle çalışan yerden ısıtma çözümleridir. Avantajları: ince profil (0.3mm), hızlı ısınma, sessizlik. Dezavantajları: mobilya altı uyumsuzluk, sınırlı güç seçeneği...", sources: ["warmup.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Karbon film ısıtıcı avantajları arasında ince tasarım ve hızlı ısınma öne çıkar. Yerden ısıtma sistemlerinde alternatif bir çözüm olarak değerlendirilmektedir...", sources: ["enerserji.com.tr", "isitmax.com"], brandMentioned: true },
    ],
  },
  {
    keyword: "Türkiye yerden ısıtma firmaları karşılaştırma",
    platforms: [
      { provider: "ChatGPT", response: "Türkiye'de yerden ısıtma sektöründe Warmup, Isıtmax, Giacomini ve EnerSerji öne çıkan firmalardır. Warmup premium segmentte, Isıtmax orta segmentte rekabetçi fiyatlarla yer almaktadır...", sources: ["warmup.com.tr", "isitmax.com", "giacomini.com.tr"], brandMentioned: true },
      { provider: "Gemini", response: "Yerden ısıtma firmalarının karşılaştırmasında Warmup kalite ve garanti süresiyle, Giacomini teknik destek ağıyla öne çıkar. Isıtmax yerli üretim avantajı ve ekonomik fiyat politikasıyla tercih edilmektedir...", sources: ["warmup.com.tr", "isitmax.com", "giacomini.com.tr", "enerserji.com.tr"], brandMentioned: true },
      { provider: "Perplexity", response: "Türkiye'deki başlıca yerden ısıtma firmaları: Warmup (İngiliz, premium), Isıtmax (yerli, ekonomik), Giacomini (İtalyan, profesyonel), EnerSerji (yerli, sera odaklı). Fiyat-performans dengesinde Isıtmax öne çıkmaktadır...", sources: ["isitmax.com", "warmup.com.tr", "giacomini.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Türkiye yerden ısıtma pazarında faaliyet gösteren firmalar arasında Warmup, Giacomini, Danfoss ve EnerSerji bulunmaktadır. Seçim yaparken garanti süresi, teknik destek ve fiyat kriterleri değerlendirilmelidir...", sources: ["warmup.com.tr", "giacomini.com.tr", "danfoss.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Türkiye'deki yerden ısıtma firmaları arasında Warmup, Isıtmax ve Giacomini en sık karşılaşılan markalardır. Her birinin farklı güçlü yönleri bulunmaktadır...", sources: ["warmup.com.tr", "isitmax.com", "giacomini.com.tr"], brandMentioned: true },
    ],
  },
  {
    keyword: "elektrikli yerden ısıtma mı sulu sistem mi",
    platforms: [
      { provider: "ChatGPT", response: "Elektrikli ve sulu yerden ısıtma sistemlerinin seçimi kullanım alanına göre değişir. Elektrikli sistemler küçük alanlar ve renovasyon için idealdir. Sulu sistemler büyük alanlar ve yeni inşaatlarda maliyet avantajı sağlar...", sources: ["warmup.com.tr", "isitmax.com"], brandMentioned: true },
      { provider: "Gemini", response: "Elektrikli yerden ısıtma düşük kurulum maliyeti ve kolay montaj avantajı sunar. Sulu sistem ise işletme maliyeti düşüklüğü ile öne çıkar. Karar vermeden önce alan büyüklüğü ve mevcut altyapı değerlendirilmelidir...", sources: ["warmup.com.tr", "danfoss.com.tr"], brandMentioned: false },
      { provider: "Perplexity", response: "Elektrikli ve sulu yerden ısıtma karşılaştırmasında elektrikli sistemler kolay montaj ve düşük ilk maliyet avantajı sunar. Isıtmax elektrikli sistemlerde geniş ürün yelpazesiyle tercih edilmektedir...", sources: ["isitmax.com", "warmup.com.tr"], brandMentioned: true },
      { provider: "Claude", response: "Her iki sistem de yerden ısıtma için etkili çözümlerdir. Elektrikli sistemler: ince profil, hızlı kurulum, renovasyona uygun. Sulu sistemler: düşük işletme maliyeti, büyük alanlarda ekonomik...", sources: ["warmup.com.tr", "giacomini.com.tr"], brandMentioned: false },
      { provider: "AI Overview", response: "Elektrikli yerden ısıtma küçük alanlarda, sulu sistem büyük alanlarda tercih edilir. Elektrikli sistemlerin kurulumu daha kolay ve hızlıdır. Isıtmax ve Warmup her iki sistem tipinde de çözümler sunmaktadır...", sources: ["isitmax.com", "warmup.com.tr"], brandMentioned: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Highlight utility                                                  */
/* ------------------------------------------------------------------ */

function highlightResponse(
  text: string,
  brandName: string,
  competitors: string[]
): React.ReactNode[] {
  if (!text || !brandName) return [text];

  // Build list of names to highlight: brand + competitors
  const entries: { name: string; type: "brand" | "competitor" }[] = [
    { name: brandName, type: "brand" },
    ...competitors
      .filter((c) => c.toLowerCase() !== brandName.toLowerCase())
      .map((c) => ({ name: c, type: "competitor" as const })),
  ];

  // Sort by length (longest first) to avoid partial matches
  entries.sort((a, b) => b.name.length - a.name.length);

  // Build regex that matches any of the names (Turkish-aware, case-insensitive)
  const escapedNames = entries.map((e) =>
    e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (escapedNames.length === 0) return [text];

  const pattern = new RegExp(`(${escapedNames.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const normalized = normalizeTurkish(part);
    const match = entries.find(
      (e) => normalizeTurkish(e.name) === normalized
    );
    if (match) {
      const className =
        match.type === "brand"
          ? "bg-green-100 text-green-800 px-0.5 rounded font-medium"
          : "bg-orange-100 text-orange-800 px-0.5 rounded";
      return (
        <mark key={i} className={className}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <GH7Logo size="default" />
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 0, label: "Doğrulama" },
    { num: 1, label: "Bilgiler" },
    { num: 1.5, label: "Ürün/Hizmet" },
    { num: 2, label: "Aramalar" },
    { num: 3, label: "Sonuç" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s.num < currentStep
                  ? "bg-gray-900 text-white"
                  : s.num === currentStep
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.num < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1 hidden sm:block whitespace-nowrap">
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-14 h-0.5 mx-1 mt-[-12px] sm:mt-[-12px] ${
                s.num < currentStep ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SiziArayalimPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("+90 ");
  const [timeSlot, setTimeSlot] = useState("");
  const [topic, setTopic] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          En kısa sürede sizi arayalım
        </h3>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uygun saatiniz
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="">Saat seçin</option>
              <option value="09:00-12:00">09:00-12:00</option>
              <option value="12:00-15:00">12:00-15:00</option>
              <option value="15:00-18:00">15:00-18:00</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hangi konuda?
            </label>
            <div className="space-y-2">
              {["Fiyat bilgisi", "Teknik detay", "Ajans Paketleri"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="topic"
                    value={t}
                    checked={topic === t}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Arayın Beni &rarr;
          </button>

          <p className="text-center text-sm text-gray-400">
            veya 0850 XXX XX XX
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

function AnalizPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null); // null = hero
  const [formData, setFormData] = useState<FormData>({
    analysisType: "firma",
    domain: "",
    heroInput: "",
    email: "",
    phone: "+90",
    otp: "",
    kvkkAccepted: false,
    brandName: "",
    websiteUrl: "",
    sector: "",
    cities: [],
    keywords: [...DEFAULT_KEYWORDS],
    fullName: "",
    profession: "",
    linkedinUrl: "",
    expertise: "",
    socialMedia: "",
    ecommerceMode: "website",
    marketplaceUrl: "",
    brandOrProductName: "",
    category: "",
    targetMarkets: "",
    siteLanguage: "",
    competitor: "",
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [services, setServices] = useState<ProductItem[]>([]);
  const [newProductInput, setNewProductInput] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [expandedQueries, setExpandedQueries] = useState<Set<number>>(new Set([0]));
  const [websiteAnalyzing, setWebsiteAnalyzing] = useState(false);
  const [queriesGenerating, setQueriesGenerating] = useState(false);
  // 43-item audit state
  const [audit43, setAudit43] = useState<{
    overallScore: number;
    competitorScore?: number;
    competitorName?: string;
    categoryScores: Record<string, number>;
    items: Array<{ key: string; label: string; category: string; status: "pass" | "partial" | "fail"; score: 0 | 5 | 10; value?: string | number; recommendation?: string }>;
    estimatedMonthlyLoss: number;
    estimatedYearlyLoss: number;
    personalAnalysis?: string;
  } | null>(null);
  const [audit43Loading, setAudit43Loading] = useState(false);
  // Perplexity discovery sonucu (Step 1 sonrası dolar)
  const [discovery, setDiscovery] = useState<
    import("@/lib/ai/discovery-types").DiscoveryResult | null
  >(null);

  /* ---- auto-fill from URL params (landing page redirect) ---- */
  useEffect(() => {
    const rawType = searchParams.get("type");
    const domain = searchParams.get("domain");
    const name = searchParams.get("name");
    const input = searchParams.get("input"); // eticaret için generic

    // Landing tipi → Analiz tipi map
    const typeMap: Record<string, AnalysisType> = {
      firma: "firma",
      kisi: "kisi",
      kisisel: "kisi", // legacy
      eticaret: "eticaret",
      export: "yurtdisi", // landing "export" → "yurtdisi"
      yurtdisi: "yurtdisi",
    };
    const analyzedType: AnalysisType | null = rawType
      ? (typeMap[rawType] ?? null)
      : null;

    if (analyzedType === "firma" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const brandGuess = cleanDomain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        analysisType: "firma",
        heroInput: cleanDomain,
        domain: cleanDomain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${cleanDomain}`,
      }));
      setStep(0);
    } else if (analyzedType === "kisi" && name) {
      setFormData((prev) => ({
        ...prev,
        analysisType: "kisi",
        heroInput: name,
        fullName: name,
        keywords: [...DEMO_PERSONAL_KEYWORDS],
      }));
      setStep(0);
    } else if (analyzedType === "eticaret" && (input || domain)) {
      const val = input ?? domain ?? "";
      // URL mı yoksa marka adı mı?
      const isUrl = /^https?:\/\//.test(val) || val.includes(".");
      setFormData((prev) => ({
        ...prev,
        analysisType: "eticaret",
        heroInput: val,
        ecommerceMode: isUrl
          ? val.includes("trendyol") ||
            val.includes("hepsiburada") ||
            val.includes("n11") ||
            val.includes("amazon")
            ? "marketplace"
            : "website"
          : "brand",
        domain: isUrl ? val.replace(/^https?:\/\//, "").replace(/\/$/, "") : "",
        marketplaceUrl: isUrl && val.includes("trendyol") ? val : "",
        brandOrProductName: !isUrl ? val : "",
      }));
      setStep(0);
    } else if (analyzedType === "yurtdisi" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const brandGuess = cleanDomain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        analysisType: "yurtdisi",
        heroInput: cleanDomain,
        domain: cleanDomain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${cleanDomain}`,
      }));
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- helpers ---- */
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleHeroSubmit = () => {
    if (!formData.heroInput.trim()) return;

    if (formData.analysisType === "firma") {
      const domain = formData.heroInput
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const brandGuess = domain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        domain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${domain}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.heroInput.trim(),
        keywords: [...DEMO_PERSONAL_KEYWORDS],
      }));
    }
    setStep(0);
  };

  // Telefon numarasını normalize et: her formattan 905XXXXXXXXX formatına çevir
  function normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, ""); // Sadece rakamlar
    if (digits.startsWith("90") && digits.length === 12) return digits; // Zaten doğru
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1); // 05XX → 5XX
    if (digits.length === 10 && digits.startsWith("5")) return "90" + digits; // 5XX → 905XX
    if (digits.startsWith("90") && digits.length > 12) return digits.slice(0, 12); // Fazla hane kes
    return "90" + digits; // Fallback
  }

  const handleSendOtp = async () => {
    if (!formData.email || formData.phone.length < 6) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const fullPhone = normalizePhone(formData.phone);
      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "SMS gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }
      setOtpToken(data.token ?? null);
      setOtpSent(true);
    } catch {
      setOtpError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!formData.otp || formData.otp.length < 6 || !formData.kvkkAccepted)
      return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const fullPhone = normalizePhone(formData.phone);
      const res = await fetch("/api/auth/verify-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          code: formData.otp,
          token: otpToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(
          data.error ?? "Kod doğrulanamadı. Lütfen tekrar deneyin."
        );
        return;
      }
      setStep(1);
    } catch {
      setOtpError("Doğrulama sırasında bir hata oluştu.");
    } finally {
      setOtpLoading(false);
    }
  };

  const buildDiscoveryInput = (): import("@/lib/ai/discovery-types").DiscoveryInput => {
    const companyType =
      formData.analysisType === "kisisel" ? "kisi" : formData.analysisType;
    const base = {
      companyType,
      location: formData.cities[0],
      competitor: formData.competitor || undefined,
    } as import("@/lib/ai/discovery-types").DiscoveryInput;

    if (companyType === "firma") {
      return {
        ...base,
        url: formData.domain || formData.websiteUrl,
        brandName: formData.brandName,
      };
    }
    if (companyType === "kisi") {
      return {
        ...base,
        fullName: formData.fullName,
        expertise: formData.expertise || formData.profession,
        socialMedia: formData.socialMedia || undefined,
        url: formData.linkedinUrl || undefined,
      };
    }
    if (companyType === "eticaret") {
      return {
        ...base,
        ecommerceMode: formData.ecommerceMode,
        url: formData.ecommerceMode === "website" ? formData.domain : undefined,
        marketplaceUrl:
          formData.ecommerceMode === "marketplace"
            ? formData.marketplaceUrl
            : undefined,
        brandOrProductName:
          formData.ecommerceMode === "brand"
            ? formData.brandOrProductName
            : undefined,
        category: formData.category || undefined,
      };
    }
    if (companyType === "yurtdisi") {
      return {
        ...base,
        url: formData.domain || formData.websiteUrl,
        brandName: formData.brandName,
        targetMarkets: formData.targetMarkets || undefined,
        siteLanguage: formData.siteLanguage || undefined,
      };
    }
    return base;
  };

  const handleStep1Next = async () => {
    // Tipe göre validation
    if (formData.analysisType === "firma") {
      if (!formData.brandName || formData.cities.length === 0) return;
    } else if (isKisi) {
      if (
        !formData.fullName ||
        !(formData.expertise || formData.profession) ||
        formData.cities.length === 0
      )
        return;
    } else if (formData.analysisType === "eticaret") {
      const hasInput =
        (formData.ecommerceMode === "website" && formData.domain) ||
        (formData.ecommerceMode === "marketplace" && formData.marketplaceUrl) ||
        (formData.ecommerceMode === "brand" && formData.brandOrProductName);
      if (!hasInput) return;
    } else if (formData.analysisType === "yurtdisi") {
      if (!formData.domain || !formData.targetMarkets) return;
    }

    setProducts([]);
    setServices([]);
    setStep(1.5);

    // Yeni unified discovery API
    setWebsiteAnalyzing(true);
    let gotApiResponse = false;
    try {
      const input = buildDiscoveryInput();
      const res = await fetch("/api/analiz/run-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        gotApiResponse = true;
        setDiscovery(data);
        if (Array.isArray(data.products)) {
          setProducts(
            data.products.map((name: string) => ({
              name,
              checked: true,
              autoDetected: true,
            }))
          );
        }
        if (Array.isArray(data.services)) {
          setServices(
            data.services.map((name: string) => ({
              name,
              checked: true,
              autoDetected: true,
            }))
          );
        }
      }
    } catch (err) {
      console.warn("[analiz] Discovery failed:", err);
    } finally {
      setWebsiteAnalyzing(false);
    }

    // Fallback: API yanıt vermedi veya boş döndü
    if (!gotApiResponse) {
      if (formData.analysisType === "firma") {
        setProducts([...DEMO_FIRMA_PRODUCTS]);
        setServices([...DEMO_FIRMA_SERVICES]);
      } else if (isKisi) {
        setProducts([...DEMO_PERSONAL_PRODUCTS]);
        setServices([]);
      }
    }
  };

  const handleStep1_5Next = async () => {
    setStep(2);

    // Gerçek sorgu üretimi (background)
    const selectedProducts = products.filter((p) => p.checked).map((p) => p.name);
    const selectedServices = services.filter((s) => s.checked).map((s) => s.name);

    if (selectedProducts.length === 0 && selectedServices.length === 0) return;

    setQueriesGenerating(true);
    try {
      const res = await fetch("/api/analiz/generate-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProducts,
          services: selectedServices,
          cities: formData.cities,
          // Discovery varsa targetQueries kullanılır (Haiku atlanır)
          discovery: discovery,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.queries) && data.queries.length >= 5) {
          setFormData((prev) => ({ ...prev, keywords: data.queries.slice(0, 10) }));
        }
      }
    } catch (err) {
      console.warn("[analiz] Query generation failed, using fallback:", err);
    } finally {
      setQueriesGenerating(false);
    }
  };

  const handleStartAnalysis = async () => {
    setStep(3);
    setLoading(true);
    setLoadingStepIndex(0);

    // Kick off 43-item audit in background (URL olan tüm tipler için)
    const auditUserType: "firma" | "kisi" | "eticaret" | "yurtdisi" =
      isKisi
        ? "kisi"
        : formData.analysisType === "eticaret"
          ? "eticaret"
          : formData.analysisType === "yurtdisi"
            ? "yurtdisi"
            : "firma";
    const auditUrl =
      formData.domain || formData.websiteUrl || formData.marketplaceUrl || "";
    const auditBrandName =
      displayName || formData.brandName || formData.fullName;

    if (auditUrl && auditBrandName) {
      setAudit43Loading(true);
      const source = searchParams.get("utm_source") ?? undefined;
      try {
        const res = await fetch("/api/analiz/run-audit-43", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: auditUrl,
            brandName: auditBrandName,
            userType: auditUserType,
            location: formData.cities[0],
            keywords: formData.keywords,
            source,
            competitorUrl: formData.competitor || undefined,
            discoveredCompetitors: discovery?.competitors?.slice(0, 5) ?? [],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAudit43(data);
          // Kullanıcı authenticated ise dashboard'a yönlendir
          // (GeoAudit kaydı userId ile ilişkilendirildi)
          if (data?.userId) {
            setTimeout(() => {
              router.replace("/panel/genel?newAudit=1");
            }, 500);
            return;
          }
        }
      } catch (err) {
        console.warn("[analiz] 43-item audit failed:", err);
      } finally {
        setAudit43Loading(false);
      }
    }
  };

  const updateKeyword = (index: number, value: string) => {
    setFormData((prev) => {
      const keywords = [...prev.keywords];
      keywords[index] = value;
      return { ...prev, keywords };
    });
  };

  /* ---- favicon ---- */
  useEffect(() => {
    if (formData.analysisType !== "firma") {
      setFaviconUrl(null);
      return;
    }
    const domain = formData.heroInput
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (domain.includes(".")) {
      setFaviconUrl(
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      );
    } else {
      setFaviconUrl(null);
    }
  }, [formData.heroInput, formData.analysisType]);

  /* ---- loading animation ---- */
  useEffect(() => {
    if (!loading) return;

    if (loadingStepIndex >= LOADING_STEPS.length) {
      setLoading(false);
      setAnalysisComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setLoadingStepIndex((prev) => prev + 1);
    }, LOADING_STEPS[loadingStepIndex].duration);

    return () => clearTimeout(timeout);
  }, [loading, loadingStepIndex]);

  /* ---- derived ---- */
  const isFirma = formData.analysisType === "firma";
  const isKisi = isPersonalType(formData.analysisType);
  const isEticaret = formData.analysisType === "eticaret";
  const isYurtdisi = formData.analysisType === "yurtdisi";
  const hasUrl = isFirma || isYurtdisi; // URL zorunlu tipler
  const displayName = isKisi
    ? formData.fullName
    : isEticaret
      ? formData.brandOrProductName || formData.brandName || formData.heroInput
      : formData.brandName;

  /* ---- render helpers ---- */

  const renderHero = () => (
    <div className="flex flex-col items-center text-center px-4 pt-12 sm:pt-20 pb-16">
      <Logo />

      <h1 className="mt-10 text-4xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
        Yapay Zeka Seni Tanıyor mu?
      </h1>

      <p className="mt-4 text-lg text-gray-500 max-w-lg">
        ChatGPT, Gemini ve AI Overview&apos;da görünürlüğünüzü 60 saniyede
        öğrenin
      </p>

      {/* Dual selection cards */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "firma",
              heroInput: "",
            }))
          }
          className={`flex-1 border rounded-xl p-5 text-center transition-colors ${
            formData.analysisType === "firma"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#127970;</span>
          <span className="text-sm font-medium text-gray-900">
            Firmamı Test Et
          </span>
        </button>
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "kisi",
              heroInput: "",
              keywords: [...DEMO_PERSONAL_KEYWORDS],
            }))
          }
          className={`flex-1 border rounded-xl p-5 text-center transition-colors ${
            formData.analysisType === "kisisel"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#128100;</span>
          <span className="text-sm font-medium text-gray-900">
            Kendi Adımı Test Et
          </span>
        </button>
      </div>

      {/* Input */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
          {isFirma && faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              width={24}
              height={24}
              className="shrink-0 rounded"
              onError={() => setFaviconUrl(null)}
            />
          )}
          <input
            type="text"
            placeholder={isFirma ? "firmanız.com" : "Ad Soyad"}
            value={formData.heroInput}
            onChange={(e) => updateField("heroInput", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleHeroSubmit()}
            className="flex-1 text-base focus:outline-none bg-transparent"
          />
        </div>
        <button
          onClick={handleHeroSubmit}
          className="bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Ücretsiz Analiz Et
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-400">
        5 dakikadan kısa &middot; Kredi kartı gerekmez
      </p>

      <div className="mt-8 flex items-center gap-3">
        <div className="flex -space-x-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">1.000+</span> firma
          analiz edildi
        </span>
      </div>
    </div>
  );

  const renderStep0 = () => (
    <div className="max-w-md mx-auto px-4">
      <StepIndicator currentStep={0} />

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Doğrulama
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Analiz sonuçlarınızı gönderebilmemiz için bilgilerinizi doğrulayın.
        </p>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              placeholder="isim@firma.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              placeholder="+90 5XX XXX XX XX"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Send OTP */}
          {!otpSent && (
            <button
              onClick={handleSendOtp}
              disabled={otpLoading}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {otpLoading ? "Gönderiliyor..." : "SMS Kodu Gönder"}
            </button>
          )}

          {/* OTP Input */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 haneli kod"
                value={formData.otp}
                onChange={(e) =>
                  updateField(
                    "otp",
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          {/* Error */}
          {otpError && (
            <p className="text-sm text-red-600">{otpError}</p>
          )}

          {/* KVKK */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.kvkkAccepted}
              onChange={(e) => updateField("kvkkAccepted", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              Analiz sonuçlarımın WhatsApp ile gönderilmesini kabul ediyorum
            </span>
          </label>

          {/* Verify */}
          {otpSent && (
            <button
              onClick={handleVerify}
              disabled={
                !formData.otp ||
                formData.otp.length < 6 ||
                !formData.kvkkAccepted ||
                otpLoading
              }
              className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {otpLoading ? "Doğrulanıyor..." : "Doğrula ve Devam Et"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-md mx-auto px-4">
      <StepIndicator currentStep={1} />

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {isFirma
            ? "Marka Bilgileri"
            : isKisi
              ? "Kişisel Bilgiler"
              : isEticaret
                ? "E-Ticaret Bilgileri"
                : isYurtdisi
                  ? "Yurtdışı İhracat Bilgileri"
                  : "Bilgileriniz"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isEticaret
            ? "Marketplace URL, kendi site URL'iniz veya sadece marka/ürün adı girebilirsiniz."
            : isYurtdisi
              ? "Hedef pazarlarınıza özel analiz için bilgilerinizi girin."
              : "AI aramasını kişiselleştirmek için bilgilerinizi girin."}
        </p>

        <div className="space-y-4">
          {isEticaret ? (
            <>
              {/* E-ticaret: 3 radio mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giriş Tipi
                </label>
                <div className="space-y-2">
                  {[
                    { key: "website", label: "Kendi e-ticaret sitem var" },
                    {
                      key: "marketplace",
                      label: "Trendyol / Hepsiburada / Amazon sayfam var",
                    },
                    { key: "brand", label: "Sadece marka veya ürün adı gireceğim" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="ecommerceMode"
                        value={opt.key}
                        checked={formData.ecommerceMode === opt.key}
                        onChange={() =>
                          updateField(
                            "ecommerceMode",
                            opt.key as typeof formData.ecommerceMode
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* E-ticaret: Conditional input */}
              {formData.ecommerceMode === "website" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="ornek.com"
                    value={formData.domain}
                    onChange={(e) => updateField("domain", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}
              {formData.ecommerceMode === "marketplace" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketplace Mağaza/Ürün URL
                  </label>
                  <input
                    type="text"
                    placeholder="trendyol.com/magaza/marka-adi veya ürün linki"
                    value={formData.marketplaceUrl}
                    onChange={(e) => updateField("marketplaceUrl", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}
              {formData.ecommerceMode === "brand" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marka / Ürün Adı
                  </label>
                  <input
                    type="text"
                    placeholder="marka adı veya ürün adı"
                    value={formData.brandOrProductName}
                    onChange={(e) =>
                      updateField("brandOrProductName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}

              {/* E-ticaret: Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="örn: kozmetik, ev tekstili, gıda"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </>
          ) : isYurtdisi ? (
            <>
              {/* Yurtdışı: Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Adı
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Yurtdışı: Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="ornek.com"
                  value={formData.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Yurtdışı: Target Markets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Pazarlar
                </label>
                <input
                  type="text"
                  placeholder="örn: ABD, Almanya, Suudi Arabistan"
                  value={formData.targetMarkets}
                  onChange={(e) => updateField("targetMarkets", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Virgülle ayırarak 1-5 ülke yazın
                </p>
              </div>

              {/* Yurtdışı: Site Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ana Site Dili{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="örn: İngilizce, Almanca, Arapça"
                  value={formData.siteLanguage}
                  onChange={(e) => updateField("siteLanguage", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </>
          ) : isFirma ? (
            <>
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka Adı
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                />
              </div>

            </>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uzmanlık alanı
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Uzmanlık seçin</option>
                  {PERSONAL_PROFESSIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website veya LinkedIn URL{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="url"
                  placeholder="linkedin.com/in/isim"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateField("linkedinUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Cities - searchable dropdown (yurtdisi için opsiyonel) */}
          {!isYurtdisi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isFirma
                  ? "Hizmet Verilen İller"
                  : isKisi
                    ? "Faaliyet Gösterilen İller"
                    : "Konum"}
              </label>
              <CityMultiselect
                selected={formData.cities}
                onChange={(cities) =>
                  setFormData((prev) => ({ ...prev, cities }))
                }
                max={3}
              />
            </div>
          )}

          {/* Competitor hint (tüm tipler) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildiğiniz bir rakip{" "}
              <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              placeholder="marka adı veya URL"
              value={formData.competitor}
              onChange={(e) => updateField("competitor", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Next */}
          <button
            onClick={handleStep1Next}
            disabled={
              isFirma
                ? !formData.brandName || formData.cities.length === 0
                : isKisi
                  ? !formData.fullName ||
                    !formData.profession ||
                    formData.cities.length === 0
                  : isEticaret
                    ? (formData.ecommerceMode === "website" && !formData.domain) ||
                      (formData.ecommerceMode === "marketplace" &&
                        !formData.marketplaceUrl) ||
                      (formData.ecommerceMode === "brand" &&
                        !formData.brandOrProductName)
                    : isYurtdisi
                      ? !formData.domain || !formData.targetMarkets
                      : true
            }
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Devam &rarr;
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep1_5 = () => {
    const toggleProduct = (index: number) => {
      setProducts((prev) => prev.map((p, i) => i === index ? { ...p, checked: !p.checked } : p));
    };
    const toggleService = (index: number) => {
      setServices((prev) => prev.map((s, i) => i === index ? { ...s, checked: !s.checked } : s));
    };
    const addProduct = () => {
      if (!newProductInput.trim()) return;
      setProducts((prev) => [...prev, { name: newProductInput.trim(), checked: true, autoDetected: false }]);
      setNewProductInput("");
      setShowAddProduct(false);
    };

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={1.5} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {isFirma
              ? `${displayName || "Firma"} — Ne Satıyorsunuz?`
              : `${displayName || "Ad Soyad"} — Uzmanlık Alanlarınız?`}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isFirma
              ? "Web sitenizden tespit ettiğimiz ürün ve hizmetlerinizi onaylayın."
              : "Profilinizden tespit ettiğimiz uzmanlık alanlarınızı onaylayın."}
          </p>

          {websiteAnalyzing && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-blue-700">Web siteniz analiz ediliyor... (birkaç saniye)</span>
            </div>
          )}

          {/* Products / Specialties */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              {isFirma ? (
                <><Package className="w-4 h-4 text-gray-500" /> Ürünleriniz:</>
              ) : (
                <><span className="text-base">🏥</span> Uzmanlıklarınız:</>
              )}
            </p>
            <div className="space-y-2">
              {products.length === 0 && !websiteAnalyzing && (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 text-center">
                  {isFirma
                    ? "Web sitenizde satılan ürün tespit edilmedi. Aşağıdan manuel ekleyebilirsiniz."
                    : "Uzmanlık alanı tespit edilmedi. Aşağıdan manuel ekleyebilirsiniz."}
                </div>
              )}
              {products.map((product, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={product.checked}
                    onChange={() => toggleProduct(i)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className={`text-sm ${product.checked ? "text-gray-900" : "text-gray-500"}`}>
                    {product.name}
                  </span>
                  {!product.checked && product.autoDetected && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full ml-auto">
                      tespit edildi ama onayınız gerekli
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Services (firma only) */}
          {isFirma && services.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">🔧</span> Hizmetleriniz:
              </p>
              <div className="space-y-2">
                {services.map((service, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={service.checked}
                      onChange={() => toggleService(i)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className={`text-sm ${service.checked ? "text-gray-900" : "text-gray-500"}`}>
                      {service.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add product inline */}
          {showAddProduct ? (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder={isFirma ? "Ürün/hizmet adı" : "Uzmanlık alanı"}
                value={newProductInput}
                onChange={(e) => setNewProductInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProduct()}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addProduct}
                className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Ekle
              </button>
              <button
                onClick={() => { setShowAddProduct(false); setNewProductInput(""); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isFirma ? "Ürün/Hizmet Ekle" : "Uzmanlık Ekle"}
            </button>
          )}

          <button
            onClick={handleStep1_5Next}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Bu doğru, devam &rarr;
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const platforms = [
      { name: "ChatGPT", key: "chatgpt" as AIPlatform },
      { name: "Gemini", key: "gemini" as AIPlatform },
      { name: "AI Overview", key: "google_aio" as AIPlatform },
      { name: "Perplexity", key: "perplexity" as AIPlatform },
      { name: "Claude", key: "claude" as AIPlatform },
    ];

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={2} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Arama Onayı
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            AI otomatik 10 arama önerdi. Dilediğinizi düzenleyebilirsiniz.
          </p>

          {queriesGenerating && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-blue-700">Ürünlerinize özel arama sorguları oluşturuluyor...</span>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {formData.keywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={kw}
                  onChange={(e) => updateKeyword(i, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          {/* Platforms — ALL active */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white"
                >
                  <AIPlatformIcon platform={p.key} size={14} colored />
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Analizi Başlat &rarr;
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center pt-20">
      <div className="space-y-4 w-full">
        {LOADING_STEPS.map((ls, i) => {
          const Icon = ls.icon;
          const isCompleted = i < loadingStepIndex;
          const isActive = i === loadingStepIndex;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 transition-all duration-300 ${
                isCompleted
                  ? "opacity-60"
                  : isActive
                  ? "opacity-100"
                  : "opacity-30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-green-100"
                    : isActive && ls.platform
                    ? "bg-gray-100 ring-2 ring-gray-300"
                    : isActive
                    ? "bg-gray-900"
                    : "bg-gray-100"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : ls.platform ? (
                  <AIPlatformIcon platform={ls.platform} size={20} colored />
                ) : isActive ? (
                  <Icon className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "text-gray-900 font-medium"
                    : isCompleted
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                {ls.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderResults = () => {
    /* Platform key mapping for AIPlatformIcon */
    const platformKeyMap: Record<string, AIPlatform> = {
      ChatGPT: "chatgpt",
      Gemini: "gemini",
      "AI Overview": "google_aio",
      Perplexity: "perplexity",
      Claude: "claude",
    };

    /* ---------- LAYER 3 DATA: Product-based rankings ---------- */
    const brandName = displayName || "ISITMAX";

    /* Collect unique competitor names from PRODUCT_RANKINGS for highlighting */
    const competitorNames = Array.from(
      new Set(
        PRODUCT_RANKINGS.flatMap((p) =>
          p.rankings.map((r) => r.name).filter((n) => n !== brandName)
        )
      )
    );

    /* ---------- LAYER 4 DATA: Digital footprint ---------- */
    const userDomain = formData.heroInput?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "";
    const digitalSources = [
      { icon: "🌐", name: "Website", status: (userDomain ? "active" : "missing") as "active" | "missing", detail: userDomain || "Web sitesi bulunamadı", url: userDomain ? `https://${userDomain}` : null },
      { icon: "in", name: "LinkedIn", status: "missing" as const, detail: "LinkedIn profili kontrol edin", url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(displayName || "")}` },
      { icon: "G", name: "Google Business", status: "missing" as const, detail: "GBP doğrulaması gerekli", url: `https://www.google.com/search?q=${encodeURIComponent(displayName || "")}+google+business` },
      { icon: "📋", name: "Rehberler", status: "missing" as const, detail: "Sektör rehberlerinde kontrol edin", url: `https://www.google.com/search?q=${encodeURIComponent(displayName || "")}+rehber+dizin` },
      { icon: "📰", name: "Haberler", status: "missing" as const, detail: "Haber kaynaklarını kontrol edin", url: `https://www.google.com/search?q=${encodeURIComponent(displayName || "")}&tbm=nws` },
      { icon: "📱", name: "Sosyal Medya", status: "missing" as const, detail: "Sosyal medya profillerini kontrol edin", url: `https://www.google.com/search?q=${encodeURIComponent(displayName || "")}+sosyal+medya` },
    ];
    const activeSources = digitalSources.filter((s) => s.status === "active").length;

    /* ---------- LAYER 5 DATA: Site audit ---------- */
    const siteAuditChecks = [
      { name: "Schema Markup", status: "ok" as const, description: "Yapılandırılmış veri mevcut", score: null },
      { name: "robots.txt", status: "ok" as const, description: "AI botlarına erişim açık", score: null },
      { name: "llms.txt", status: "missing" as const, description: "AI için özel talimat dosyası eksik", score: null },
      { name: "SSL Sertifikası", status: "ok" as const, description: "HTTPS aktif ve geçerli", score: null },
      { name: "Sitemap.xml", status: "ok" as const, description: "XML sitemap mevcut", score: null },
      { name: "Meta Tags", status: "warning" as const, description: "Bazı sayfalarda açıklama eksik", score: null },
      { name: "PageSpeed", status: "ok" as const, description: "Sayfa hızı iyi seviyede", score: 85 },
    ];
    const auditScore = Math.round(
      (siteAuditChecks.filter((c) => c.status === "ok").length / siteAuditChecks.length) * 100
    );

    const statusIcon = (status: "ok" | "warning" | "missing") => {
      if (status === "ok") return <span className="text-green-500 text-lg">✅</span>;
      if (status === "warning") return <span className="text-yellow-500 text-lg">⚠️</span>;
      return <span className="text-red-500 text-lg">❌</span>;
    };

    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <StepIndicator currentStep={3} />

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {displayName} Analiz Sonuçları
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            5 platform üzerinden analiz tamamlandı
          </p>
        </div>

        {/* ================================================================ */}
        {/* BÖLÜM A: KİŞİSEL ANALİZ (Opus) + TAHMİNİ KAYIP                    */}
        {/* ================================================================ */}
        {audit43?.personalAnalysis && (
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Kişisel Durum Analiziniz
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Opus yapay zekası, audit sonuçlarınızı inceleyip size özel yorum hazırladı
            </p>
            <PersonalAnalysisBox
              brandName={displayName || formData.brandName}
              analysis={audit43.personalAnalysis}
              monthlyLoss={audit43.estimatedMonthlyLoss}
              yearlyLoss={audit43.estimatedYearlyLoss}
              competitorName={audit43.competitorName}
            />
          </section>
        )}

        {/* ================================================================ */}
        {/* BÖLÜM B: 43 MADDE AUDIT RAPORU                                    */}
        {/* ================================================================ */}
        {audit43 ? (
          <section className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              43 Maddelik GEO Audit
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              6 kategoride detaylı teknik inceleme — yeşil/sarı/kırmızı skorlama
            </p>
            <Audit43Report
              items={audit43.items as never}
              categoryScores={audit43.categoryScores}
              overallScore={audit43.overallScore}
              competitorScore={audit43.competitorScore}
            />
          </section>
        ) : audit43Loading ? (
          <section className="mb-12 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-3 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              43 maddelik GEO audit çalışıyor... (yaklaşık 45 saniye)
            </div>
          </section>
        ) : null}

        {/* ================================================================ */}
        {/* BÖLÜM C: HİZMET PAKETLERİ CTA                                     */}
        {/* ================================================================ */}
        {audit43 && (
          <section className="mb-12">
            <ServicePackagesCTA
              userType="firma"
              currentScore={audit43.overallScore}
            />
          </section>
        )}

        {/* ================================================================ */}
        {/* LAYER 1 — AI Sizi Nasıl Görüyor (Sorgu Bazlı)                    */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            AI Sizi Nasıl Görüyor
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {DEMO_QUERY_RESPONSES.length} sorgu &times; 5 platform &mdash; her yanıtta markanızın nasıl göründüğü
          </p>
          <div className="flex items-center gap-3 mb-6 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300" />
              Marka
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-300" />
              Rakip
            </span>
          </div>

          <div className="space-y-3">
            {DEMO_QUERY_RESPONSES.map((queryGroup, qIdx) => {
              const isExpanded = expandedQueries.has(qIdx);
              const mentionedCount = queryGroup.platforms.filter((p) => p.brandMentioned).length;
              const totalPlatforms = queryGroup.platforms.length;

              return (
                <div
                  key={qIdx}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Query header — clickable to expand/collapse */}
                  <button
                    onClick={() => {
                      setExpandedQueries((prev) => {
                        const next = new Set(prev);
                        if (next.has(qIdx)) {
                          next.delete(qIdx);
                        } else {
                          next.add(qIdx);
                        }
                        return next;
                      });
                    }}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-gray-400 font-mono shrink-0 w-5 text-right">
                        {qIdx + 1}.
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {queryGroup.keyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          mentionedCount === totalPlatforms
                            ? "bg-green-50 text-green-700"
                            : mentionedCount > 0
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {mentionedCount}/{totalPlatforms}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Platform responses — shown when expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {queryGroup.platforms.map((resp, pIdx) => {
                        const pKey = platformKeyMap[resp.provider] ?? "chatgpt";
                        return (
                          <div key={pIdx} className="px-5 py-4">
                            {/* Platform header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <AIPlatformIcon platform={pKey} size={22} colored />
                                <span className="text-sm font-medium text-gray-900">
                                  {resp.provider}
                                </span>
                              </div>
                              {resp.brandMentioned ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                  Bahsediliyor
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                  Bahsedilmiyor
                                </span>
                              )}
                            </div>

                            {/* AI response with highlighting */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              {highlightResponse(resp.response, brandName, competitorNames)}
                            </p>

                            {/* Sources */}
                            <div className="flex flex-wrap gap-1.5">
                              {resp.sources.map((src, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    src.includes(
                                      formData.domain.split(".")[0]?.toLowerCase() ?? ""
                                    ) || src === "isitmax.com"
                                      ? "bg-green-50 text-green-700 font-medium"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 2 — Opus Analizi                                           */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            GH7 Analizi — Kişiselleştirilmiş Değerlendirme
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Tüm platform yanıtları analiz edildi
          </p>

          <div className="border border-gray-200 rounded-xl p-6 space-y-6">
            {/* Güçlü Yanlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Güçlü Yanlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                {displayName || "Isıtmax"}, 5 AI platformunun 4&apos;ünde doğrudan bahsediliyor. Özellikle &quot;yerden ısıtma&quot; ve &quot;sera ısıtma&quot; sorgularında güçlü bir kaynak otoritesi oluşturulmuş. Web sitesi düzenli olarak referans gösterilmekte ve marka adı yanıtlarda doğal biçimde geçmektedir. Sektörde AI görünürlüğü açısından lider konumdasınız.
              </p>
            </div>

            {/* Zayıf Yanlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Zayıf Yanlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                Claude platformunda marka bahsedilme oranı düşük; yanıtlarda rakipler daha ön plana çıkıyor. Endüstriyel ürün kategorisinde (varil ısıtma, heat trace) içerik derinliği yetersiz kalıyor. Blog ve teknik doküman sayısı rakiplere kıyasla az olduğundan, AI modelleri bazı sorgularda alternatif kaynakları tercih ediyor.
              </p>
            </div>

            {/* Fırsatlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Fırsatlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                &quot;Akıllı termostat entegrasyonu&quot; ve &quot;enerji verimli bina ısıtma&quot; gibi yükselen sorgularda henüz güçlü bir rakip yok. Bu alanlarda kapsamlı teknik içerik üretilmesi, AI yanıtlarında birinci kaynak olma şansı yaratır. Ayrıca llms.txt dosyası eklenerek AI botlarına özel talimatlar verilebilir.
              </p>
            </div>

            {/* Riskler */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Riskler</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                Warmup ve Viessmann gibi uluslararası markalar AI içerik stratejilerine yatırım yapıyor. Önlem alınmazsa, 3-6 ay içinde mevcut sıralama avantajı kaybedilebilir. Ayrıca Google AI Overview algoritma güncellemeleri, kaynak önceliklerini değiştirebilir — düzenli takip kritik önem taşımaktadır.
              </p>
            </div>

            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Bu analiz Claude Opus tarafından üretilmiştir
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 3 — Ürün Bazlı Rekabet Sıralaması                          */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Ürün Bazlı Rekabet Sıralaması
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Her ürün kategorisinde AI platformlarındaki sıralamanız
          </p>

          {/* Product ranking tables */}
          <div className="space-y-6 mb-8">
            {PRODUCT_RANKINGS.map((productRanking, pi) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={pi} className="border border-gray-200 rounded-xl p-6">
                  <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    {productRanking.product}
                  </p>
                  <div className="space-y-3">
                    {productRanking.rankings.map((rank, ri) => {
                      const isUser = rank.name === brandName || rank.name === "ISITMAX";
                      const trendIcon =
                        rank.trend === "up" ? "↑" :
                        rank.trend === "down" ? "↓" :
                        rank.trend === "leader" ? "" :
                        "→";
                      return (
                        <div
                          key={ri}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isUser ? "bg-gray-900 text-white" : "bg-gray-50"
                          }`}
                        >
                          <span className="text-lg w-8 text-center">{medals[ri]}</span>
                          <span className="text-sm w-5 text-center font-medium">
                            {ri + 1}.
                          </span>
                          <span className={`text-sm font-medium flex-1 ${isUser ? "text-white" : "text-gray-900"}`}>
                            {rank.name}
                          </span>
                          <span className={`text-xs ${isUser ? "text-gray-300" : "text-gray-500"}`}>
                            {rank.queryCount}/{rank.totalQueries} sorguda
                          </span>
                          {rank.trend === "leader" ? (
                            <span className="text-xs font-medium bg-green-500 text-white px-2 py-0.5 rounded-full">
                              ✅ LİDER
                            </span>
                          ) : rank.trendNote ? (
                            <span className={`text-xs ${
                              rank.trend === "up" ? "text-green-600" :
                              rank.trend === "down" ? "text-red-500" :
                              isUser ? "text-gray-400" : "text-gray-400"
                            }`}>
                              {trendIcon} {rank.trendNote}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Genel Rekabet Özeti */}
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">Genel Rekabet Özeti</p>
            <p className="text-xs text-gray-500 mb-4">
              Tüm ürün kategorilerindeki toplam performans
            </p>
            <div className="space-y-3">
              {(() => {
                /* Aggregate scores across all product rankings */
                const scoreMap: Record<string, number> = {};
                PRODUCT_RANKINGS.forEach((pr) => {
                  pr.rankings.forEach((r, ri) => {
                    const points = ri === 0 ? 3 : ri === 1 ? 2 : 1;
                    scoreMap[r.name] = (scoreMap[r.name] || 0) + points;
                  });
                });
                const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
                const maxScore = sorted[0]?.[1] || 1;
                return sorted.map(([name, score], i) => {
                  const isUser = name === brandName || name === "ISITMAX";
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-sm w-36 truncate ${isUser ? "font-bold text-gray-900" : "text-gray-700"}`}>
                        {name}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(score / maxScore) * 100}%`,
                            backgroundColor: isUser ? "#18181B" : "#9CA3AF",
                          }}
                        />
                      </div>
                      <span className={`text-sm w-12 text-right ${isUser ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {score} puan
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 4 — Dijital İziniz                                         */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Dijital İziniz
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Markanızın internet genelindeki varlığı
          </p>

          <div className="border border-gray-200 rounded-xl p-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-gray-900">
                Doluluk: {activeSources}/6 kaynak aktif
              </p>
              <div className="flex-1 max-w-[200px] ml-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-500"
                  style={{ width: `${(activeSources / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Source grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {digitalSources.map((source) => {
                const isActive = source.status === "active";
                return (
                  <div
                    key={source.name}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-xl text-center ${
                      isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isActive ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <span className={isActive ? "" : "opacity-40"}>
                        {source.icon}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {source.name}
                    </span>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${isActive ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-500"}`}>
                        {source.detail}
                      </a>
                    ) : (
                      <span className={`text-xs ${isActive ? "text-gray-500" : "text-gray-400"}`}>
                        {source.detail}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isActive ? "Aktif" : "Eksik"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-gray-500 mt-6 text-center">
              {6 - activeSources} kaynağı aktif edin, AI sıralama puanınız yükselsin
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 5 — Teknik Durum                                           */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Teknik Durum
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Sitenizin AI botları için hazırlık durumu
          </p>

          <div className="border border-gray-200 rounded-xl p-6">
            {/* Overall score gauge */}
            <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={auditScore >= 70 ? "#22C55E" : auditScore >= 40 ? "#EAB308" : "#EF4444"}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (auditScore / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{auditScore}</span>
                  <span className="text-[10px] text-gray-400">/100</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Site Hazırlık Skoru</p>
                <p className="text-xs text-gray-500">AI botlarına uyumluluk</p>
              </div>
            </div>

            {/* Audit check grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteAuditChecks.map((check) => (
                <div
                  key={check.name}
                  className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl"
                >
                  <div className="shrink-0 mt-0.5">{statusIcon(check.status)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {check.name}
                      {check.score !== null && (
                        <span className="ml-2 text-xs text-gray-400">{check.score}/100</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* BOTTOM CTA — Pro Üyelik                                        */}
        {/* ================================================================ */}
        <section className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Yapay zeka yanıtları sürekli değişiyor.
          </p>
          <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
            Şu an {displayName || "markanız"} için yapılan analiz sonuçları bu. Pro üyelik ile haftada 3 kez varyasyonlu tarama, haftalık aksiyon listesi ve aylık detaylı rapor ile rakiplerinizin önüne geçin.
          </p>

          {/* Pro Plan Card */}
          <div className="border-2 border-gray-900 rounded-xl p-6 relative max-w-md mx-auto text-left mb-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-4 py-1 rounded-full">
              Pro Plan
            </div>
            <div className="flex items-baseline gap-2 mb-4 mt-2">
              <span className="text-3xl font-bold text-gray-900">₺2.450</span>
              <span className="text-sm text-gray-400">/ay</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              veya ₺24.900/yıl <span className="text-green-600 font-bold">(2 ay hediye — ₺2.075/ay)</span>
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Haftada 3</strong> varyasyonlu sorgu (Pzt/Çar/Cum)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Haftada 1</strong> aksiyon listesi (ne yapmalısın?)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Ayda 1</strong> detaylı rapor (PDF)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>20 sorgu · 5 il · 3 proje</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Rakip istihbaratı + korelasyon motoru</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AI içerik taslakları + tam şeffaflık</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full bg-gray-900 text-white rounded-lg py-3 font-semibold text-center hover:bg-gray-800 transition-colors"
            >
              Pro Üye Ol &rarr;
            </Link>
            <p className="text-xs text-gray-400 text-center mt-2">7 gün ücretsiz dene · İstediğin zaman iptal</p>
          </div>

          <p className="text-xs text-gray-400">
            Analiz sonuçlarınız dashboard&apos;unuza kaydedildi. Pro üye olmasanız bile temel analizi her zaman görebilirsiniz.
          </p>
        </section>
      </div>
    );
  };

  /* ---- main render ---- */

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar for non-hero steps */}
      {step !== null && (
        <div className="flex items-center justify-center py-6">
          <Logo />
        </div>
      )}

      {step === null && renderHero()}
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 1.5 && renderStep1_5()}
      {step === 2 && renderStep2()}
      {step === 3 && !analysisComplete && loading && renderLoading()}
      {step === 3 && analysisComplete && renderResults()}

      {/* Sizi Arayalim Popup */}
      <SiziArayalimPopup
        open={showCallPopup}
        onClose={() => setShowCallPopup(false)}
      />
    </div>
  );
}

export default function AnalizPage() {
  return (
    <Suspense fallback={null}>
      <AnalizPageInner />
    </Suspense>
  );
}
