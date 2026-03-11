import { Priority } from "../types";

export interface ActionTask {
  id: number;
  priority: Priority;
  title: string;
  impact: string;
  source: string;
  detail: string;
  completed: boolean;
  raasEligible: boolean;
  raasSelected: boolean;
}

export interface RaasOffer {
  selectedCount: number;
  currentScore: number;
  targetScore: number;
  price: string;
  deposit: string;
  timeline: string;
}

export const actionTasks: ActionTask[] = [
  {
    id: 1,
    priority: "high",
    title: "FAQ sayfası oluşturun",
    impact: "Hazırlık +10 puan",
    source: "Site Analizi → FAQ Schema",
    detail: "Sektörünüzdeki 20 sık sorulan soruyu yanıtlayan sayfa. FAQPage schema ile işaretleyin.",
    completed: false,
    raasEligible: true,
    raasSelected: false,
  },
  {
    id: 2,
    priority: "high",
    title: "Product schema ekleyin",
    impact: "Hazırlık +10 puan",
    source: "Site Analizi → Product Schema",
    detail: "5 ana ürün sayfasına fiyat, marka, açıklama bilgisi.",
    completed: false,
    raasEligible: true,
    raasSelected: false,
  },
  {
    id: 3,
    priority: "high",
    title: "Google Business güncelleyin",
    impact: "Hazırlık +2 puan (8→10)",
    source: "Site Analizi → Google Business",
    detail: "Çalışma saatleri ve hizmet alanı bilgilerini güncelleyin.",
    completed: true,
    raasEligible: false,
    raasSelected: false,
  },
  {
    id: 4,
    priority: "medium",
    title: "Sektörel dizinlere kayıt olun",
    impact: "Hazırlık +10 puan",
    source: "Site Analizi → Sektörel Dizinler",
    detail: "insaat.org, isitma.org.tr, yapi.com.tr, sektorel.com, firmasec.com.tr",
    completed: false,
    raasEligible: true,
    raasSelected: false,
  },
  {
    id: 5,
    priority: "medium",
    title: "\"Yerden ısıtma bakım rehberi\" yazın",
    impact: "2 yeni promptta bahsedilme potansiyeli",
    source: "Promptlar → bakım etiketli 2 promptta visibility %0",
    detail: "Bakım konusunda kapsamlı bir rehber yazısı oluşturun.",
    completed: false,
    raasEligible: true,
    raasSelected: false,
  },
  {
    id: 6,
    priority: "medium",
    title: "LocalBusiness schema tamamlayın",
    impact: "Hazırlık +5 puan",
    source: "Site Analizi → LocalBusiness Schema",
    detail: "Adres, telefon ve çalışma saatleri bilgilerini ekleyin.",
    completed: false,
    raasEligible: false,
    raasSelected: false,
  },
  {
    id: 7,
    priority: "low",
    title: "Hakkımızda sayfası zenginleştirin",
    impact: "Hazırlık +5 puan",
    source: "Site Analizi → Hakkımızda",
    detail: "Firma geçmişi, ekip bilgisi ve sertifikalar ekleyin.",
    completed: false,
    raasEligible: false,
    raasSelected: false,
  },
  {
    id: 8,
    priority: "low",
    title: "Blog takvimi oluşturun",
    impact: "Hazırlık +6 puan (4→10)",
    source: "Site Analizi → İçerik Güncelliği",
    detail: "Ayda en az 2 blog yazısı yayınlama planı oluşturun.",
    completed: false,
    raasEligible: false,
    raasSelected: false,
  },
];

export const raasOffer: RaasOffer = {
  selectedCount: 4,
  currentScore: 52,
  targetScore: 82,
  price: "12.000₺",
  deposit: "%30 başlangıç (3.600₺) + %70 hedefe ulaşınca",
  timeline: "4-6 hafta",
};
