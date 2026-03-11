import { CheckStatus } from "../types";

export interface AuditCategory {
  name: string;
  score: number;
  maxScore: number;
  checks: AuditCheck[];
}

export interface AuditCheck {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  status: CheckStatus;
  detail: string;
  fix: string | null;
  raasEligible: boolean;
}

export const siteReadinessScore = 52;
export const siteReadinessTarget = 80;

export const auditCategories: AuditCategory[] = [
  {
    name: "Yapılandırılmış Veri",
    score: 15,
    maxScore: 40,
    checks: [
      { id: "org_schema", title: "Organization Schema", score: 10, maxScore: 10, status: "pass", detail: "Mevcut ve doğru.", fix: null, raasEligible: false },
      { id: "product_schema", title: "Product Schema", score: 0, maxScore: 10, status: "fail", detail: "Ürün sayfalarında bulunamadı.", fix: "Her ürün sayfasına Product schema ekleyin.", raasEligible: true },
      { id: "faq_schema", title: "FAQ Schema", score: 0, maxScore: 10, status: "fail", detail: "FAQ sayfası ve schema bulunamadı.", fix: "20 soruluk SSS sayfası + FAQPage schema.", raasEligible: true },
      { id: "local_schema", title: "LocalBusiness Schema", score: 5, maxScore: 10, status: "partial", detail: "Var ama adres ve telefon eksik.", fix: "Adres, telefon, çalışma saatleri ekleyin.", raasEligible: false },
    ],
  },
  {
    name: "Dış Platform",
    score: 8,
    maxScore: 20,
    checks: [
      { id: "google_business", title: "Google Business Profili", score: 8, maxScore: 10, status: "pass", detail: "4.6 puan, 127 yorum. Güncel.", fix: "Hizmet alanı genişletin, fotoğraf ekleyin.", raasEligible: false },
      { id: "sector_dirs", title: "Sektörel Dizinler", score: 0, maxScore: 10, status: "fail", detail: "0/5 dizinde kayıt.", fix: "5 dizine kayıt olun.", raasEligible: true },
    ],
  },
  {
    name: "İçerik",
    score: 9,
    maxScore: 20,
    checks: [
      { id: "about_page", title: "Hakkımızda Sayfası", score: 5, maxScore: 10, status: "partial", detail: "Sayfa var ama kuruluş yılı, ekip bilgisi eksik.", fix: "Firma geçmişi, ekip, sertifikalar ekleyin.", raasEligible: false },
      { id: "content_freshness", title: "İçerik Güncelliği", score: 4, maxScore: 10, status: "partial", detail: "Son blog yazısı: 4 ay önce.", fix: "Ayda en az 2 blog yazısı yayınlayın.", raasEligible: false },
    ],
  },
  {
    name: "Teknik",
    score: 20,
    maxScore: 20,
    checks: [
      { id: "meta_desc", title: "Meta Açıklamaları", score: 10, maxScore: 10, status: "pass", detail: "Mevcut ve uygun uzunlukta.", fix: null, raasEligible: false },
      { id: "page_speed", title: "Sayfa Hızı", score: 10, maxScore: 10, status: "pass", detail: "Hızlı. LCP: 1.8s, CLS: 0.05.", fix: null, raasEligible: false },
    ],
  },
];
