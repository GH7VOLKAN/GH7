"use client";

import Link from "next/link";
import { HeroSection } from "./hero-section";
import { FadeIn, Stagger, PageSection, SectionTitle } from "./animations";
import {
  CheckIcon,
  ArrowRightIcon,
  GlobeIcon,
  SearchIcon,
  FileTextIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Ücretli Paketler — Ajans Hizmet Paketleri
   ───────────────────────────────────────────────────── */

interface PaketlerContentProps {
  plan: string;
}

const PACKAGES = [
  {
    name: "GEO Başlangıç",
    price: "4.990₺",
    period: "tek seferlik",
    description: "Yapay zeka görünürlüğünü oluşturmak için temel optimizasyon",
    icon: SearchIcon,
    color: "#4285f4",
    features: [
      "Mevcut durum analizi ve rapor",
      "Schema markup kurulumu (FAQ, Organization, Product)",
      "llms.txt dosyası oluşturma",
      "Sitemap ve robots.txt optimizasyonu",
      "3 adet içerik optimizasyonu",
      "1 aylık takip ve rapor",
    ],
  },
  {
    name: "GEO Profesyonel",
    price: "9.990₺",
    period: "/ay",
    description: "Sürekli optimizasyon ve rakip takibi ile görünürlüğü artırma",
    icon: BarChart3Icon,
    color: "#111",
    popular: true,
    features: [
      "GEO Başlangıç paketindeki her şey",
      "Haftalık yapay zeka tarama ve analiz",
      "10 adet aylık içerik optimizasyonu",
      "Rakip analizi ve strateji raporu",
      "Schema markup bakımı ve güncelleme",
      "E-A-T sinyalleri güçlendirme",
      "Aylık performans raporu",
      "Öncelikli destek",
    ],
  },
  {
    name: "GEO Kurumsal",
    price: "19.990₺",
    period: "/ay",
    description: "Tam kapsamlı yapay zeka görünürlük yönetimi ve içerik stratejisi",
    icon: ShieldCheckIcon,
    color: "#22c55e",
    features: [
      "GEO Profesyonel paketindeki her şey",
      "Günlük yapay zeka tarama",
      "Sınırsız içerik optimizasyonu",
      "Dijital PR ve kaynak oluşturma",
      "Özel yapay zeka asistan eğitimi",
      "Çoklu marka yönetimi",
      "Haftalık strateji toplantısı",
      "Dedike hesap yöneticisi",
      "API erişimi",
    ],
  },
];

const ADD_ON_SERVICES = [
  {
    name: "İçerik Optimizasyonu",
    price: "990₺",
    unit: "sayfa başına",
    icon: FileTextIcon,
    desc: "Mevcut sayfalarınızı yapay zeka algoritmalarına uygun hale getiriyoruz",
  },
  {
    name: "Schema Markup Kurulumu",
    price: "2.490₺",
    unit: "site başına",
    icon: GlobeIcon,
    desc: "FAQ, Organization, Product ve diğer schema tiplerinin tam kurulumu",
  },
  {
    name: "Rakip Analiz Raporu",
    price: "1.990₺",
    unit: "tek seferlik",
    icon: BarChart3Icon,
    desc: "Rakiplerinizin yapay zeka görünürlüğünün detaylı analizi ve strateji önerileri",
  },
  {
    name: "Acil Müdahale",
    price: "4.990₺",
    unit: "tek seferlik",
    icon: ZapIcon,
    desc: "Yapay zekada yanlış bilgi veya olumsuz görünürlük durumlarında acil düzeltme",
  },
];

export function PaketlerContent({ plan }: PaketlerContentProps) {
  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="AJANS HİZMETLERİ"
        title={"Yapay zekada görünür ol\nbiz halledelim"}
        subtitle="Uzman ekibimiz yapay zeka görünürlüğünüzü profesyonelce yönetsin. Siz işinize odaklanın."
      />

      {/* ── PAKETLER (3-col grid) ─────────────────────── */}
      <PageSection>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4" staggerMs={100}>
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.name}
                className="kinde-card p-4 sm:p-6 flex flex-col relative"
                style={{
                  borderColor: pkg.popular ? "#111" : undefined,
                  borderWidth: pkg.popular ? 2 : 1,
                }}
              >
                {pkg.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1"
                    style={{
                      background: "#111",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    En Popüler
                  </div>
                )}

                <div
                  className="flex items-center justify-center rounded-2xl mb-4"
                  style={{
                    width: 48,
                    height: 48,
                    background: `${pkg.color}10`,
                  }}
                >
                  <Icon style={{ color: pkg.color, width: 24, height: 24 }} />
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>
                    {pkg.price}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    {pkg.period}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 8, lineHeight: 1.5 }}>
                  {pkg.description}
                </p>

                <div className="flex-1 mt-5 space-y-2.5">
                  {pkg.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckIcon
                        className="shrink-0 mt-0.5"
                        style={{ width: 16, height: 16, color: "#22c55e" }}
                      />
                      <span style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.4 }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="https://wa.me/905xxxxxxxxx?text=GH7%20ajans%20hizmeti%20hakkında%20bilgi%20almak%20istiyorum"
                  target="_blank"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: pkg.popular ? "#111" : "transparent",
                    color: pkg.popular ? "#fff" : "var(--foreground)",
                    border: pkg.popular ? "none" : "1px solid var(--border)",
                  }}
                >
                  Teklif Al <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ── EK HİZMETLER ──────────────────────────────── */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Ek Hizmetler"
          subtitle="İhtiyacınıza göre tek seferlik hizmetler"
        />
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" staggerMs={80}>
          {ADD_ON_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.name} className="kinde-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: 40, height: 40, background: "#f5f5f5" }}
                >
                  <Icon style={{ width: 20, height: 20, color: "var(--foreground)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                    {svc.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, lineHeight: 1.5 }}>
                    {svc.desc}
                  </p>
                  <p className="mt-2">
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                      {svc.price}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>
                      {svc.unit}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ── CTA ───────────────────────────────────────── */}
      <FadeIn className="mt-12">
        <div className="kinde-card p-5 sm:p-8 text-center" style={{ cursor: "default" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>
            Hangi paket size uygun?
          </p>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 8, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Yapay zeka görünürlüğünüzü analiz edelim ve size en uygun stratejiyi belirleyelim. İlk görüşme ücretsiz.
          </p>
          <Link
            href="https://wa.me/905xxxxxxxxx?text=GH7%20ücretsiz%20görüşme%20talep%20ediyorum"
            target="_blank"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-[13px] font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Ücretsiz Görüşme Talep Et <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
