'use client';

import React from 'react';
import Link from 'next/link';
import { FadeIn, Stagger } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, BarChart3, Brain, Target, TrendingUp } from 'lucide-react';

// --- Bileşenler (Componentler) ---

const SectionTitle = ({ title, subtitle, align = 'center' }: { title: string; subtitle?: string; align?: 'left' | 'center' }) => (
  <div className={`mb-10 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
      {title}
    </h2>
    {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const TestimonialCard = ({ name, role, company, content }: { name: string; role: string; company: string; content: string }) => (
  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
    <p className="text-gray-700 mb-6 italic">"{content}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-500">{role}, {company}</p>
      </div>
    </div>
  </div>
);

const PricingCard = ({ tier, price, features, recommended = false }: { tier: string; price: string; features: string[]; recommended?: boolean }) => (
  <div className={`relative p-8 rounded-3xl border ${recommended ? 'border-blue-600 bg-blue-50/50 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white'} flex flex-col h-full`}>
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
        En Popüler
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tier}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-gray-900">{price}</span>
      {price !== 'Ücretsiz' && <span className="text-gray-500">/ay</span>}
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-600">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <Button className={`w-full ${recommended ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
      Başla
    </Button>
  </div>
);

// --- Ana Sayfa ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">Ayzeo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#ozellikler" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Özellikler</Link>
            <Link href="#nasil-calisir" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Nasıl Çalışır</Link>
            <Link href="#fiyatlandirma" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Fiyatlandırma</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block">Giriş Yap</Link>
            <Link href="/register">
              <Button size="sm">Ücretsiz Dene</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* HERO BÖLÜMÜ */}
        <section className="relative px-4 py-20 sm:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <FadeIn direction="up" duration={0.8}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Yapay Zeka Aramalarında Görünür Olun
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-gray-900">
                Yapay zeka sizi <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">tanıyor mu?</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Müşterileriniz ChatGPT, Perplexity veya Claude'a sorduğunda, 
                rakipleriniz değil <strong>siniz öneriliyor.</strong>
                Bunu ölçümleyin, analiz edin ve iyileştirin.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Ücretsiz Analiz Başlat <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#nasil-calisir">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base border-gray-200">
                    Nasıl Çalışır?
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
          
          {/* Arkaplan Deseni */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
        </section>

        {/* PROBLEM BÖLÜMÜ (KORKU) */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle 
              title="Bunu kendiniz yapmaya çalışmayın" 
              subtitle="Yapay zeka görünürlüğünü manuel takip etmek imkansızdır."
            />
            
            <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
              <div className="space-y-6">
                {[
                  "50 farklı soruyu elle aratıp not almak",
                  "5 farklı platformda (ChatGPT, Perplexity...) haftalık tekrar",
                  "Rakiplerinizi tek tek izleyip karşılaştırmak",
                  "Hangi değişikliğin işe yaradığını anlamaya çalışmak"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-sm">!</div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white flex flex-col justify-center items-center text-center shadow-2xl">
                  <Target className="w-16 h-16 mb-6 text-red-400" />
                  <h3 className="text-2xl font-bold mb-4">Manuel Takip Kabusu</h3>
                  <p className="text-gray-400">
                    Her hafta yüzlerce saat harcamak yerine,<br/>
                    Ayzeo ile otomatik takip ve aksiyon alın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İSTATİSTİK BÖLÜMÜ (Eski Harita Yerine) */}
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <FadeIn direction="up">
              <div className="text-6xl sm:text-8xl font-bold text-blue-600 mb-6">97%</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Tüketiciler yerel işletmeleri online arıyor
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Yapay zeka profilinizi kontrol edin, kişiselleştirilmiş görevleri tamamlayın ve 
                yerel arama görünürlüğünüzü artırın. Yeni müşteriler kazanmanın en iyi yolu.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ÖZELLİKLER (KPI & ROOT CAUSE) */}
        <section id="ozellikler" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle 
              title="KPI'dan Kök Neden'e" 
              subtitle="Sadece skoru görmeyin — neden olduğunu anlayın ve neyi düzelteceğinizi öğrenin."
            />

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <FeatureCard 
                icon={Target}
                title="Prompt Seviyesinde Analiz"
                description="Markanızı hangi sorular tetikliyor, hanglerinde görünmüyorsunuz? Her bir prompt'u detaylıca görün."
              />
              <FeatureCard 
                icon={BarChart3}
                title="Alıntılar & URL Takibi"
                description="Yapay zeka sitenizin hangi sayfalarını açıyor ve kaynak gösteriyor? En değerli içeriklerinizi keşfedin."
              />
              <FeatureCard 
                icon={TrendingUp}
                title="Rakip Karşılaştırması"
                description="Sizin yerinize kimler öneriliyor? Pazar payınızı ölçün ve rakiplerinizle kıyaslayın."
              />
              <FeatureCard 
                icon={Brain}
                title="Duygu Analizi"
                description="Markanız hakkında olumlu, nötr veya olumsuz konuşulmasını sağlayan tam cümleleri görün."
              />
              <FeatureCard 
                icon={CheckCircle2}
                title="Aksiyon Odaklı Öneriler"
                description="Sadece veri değil, ne yapmanız gerektiğini söyleyen adım adım görevler alın."
              />
              <FeatureCard 
                icon={ArrowRight}
                title="Beyaz Etiket Raporlama"
                description="Ajanslar için özel, logolu ve profesyonel PDF raporlar oluşturun."
              />
            </div>
          </div>
        </section>

        {/* MÜŞTERİ YORUMLARI */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle 
              title="Müşterilerimiz Ne Diyor?" 
              subtitle="Ayzeo kullanan gerçek işletmelerden sonuçlar."
            />
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <TestimonialCard 
                name="Ahmet Yılmaz"
                role="Kurucu"
                company="TechStart"
                content="Ayzeo sayesinde ChatGPT'de görünürlüğümüz %40 arttı. Rakiplerimizin nerede olduğunu görmek stratejimizi tamamen değiştirdi."
              />
              <TestimonialCard 
                name="Elif Demir"
                role="Pazarlama Müdürü"
                company="Global Danışmanlık"
                content="Haftalarca süren manuel araştırmaları artık dakikalar içinde yapıyoruz. ROI'yi kanıtlamak hiç bu kadar kolay olmamıştı."
              />
              <TestimonialCard 
                name="Caner Öz"
                role="SEO Uzmanı"
                company="Dijital Ajans"
                content="Müşterilerime sunduğum beyaz etiket raporlar harika. Yapay zeka optimizasyonu artık hizmet portföyümüzün vazgeçilmezi."
              />
            </div>
          </div>
        </section>

        {/* FİYATLANDIRMA */}
        <section id="fiyatlandirma" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle 
              title="Basit Fiyatlandırma" 
              subtitle="Gizli ücret yok. İstediğiniz zaman iptal edin."
            />

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
              <PricingCard 
                tier="Başlangıç"
                price="Ücretsiz"
                features={[
                  "50 Soru takibi",
                  "Temel görünürlük analizi",
                  "Haftalık rapor",
                  "1 Proje"
                ]}
              />
              <PricingCard 
                tier="Pro"
                price="$29"
                recommended={true}
                features={[
                  "Sınırsız Soru takibi",
                  "5 Platform desteği",
                  "Rakip analizi",
                  "Aksiyon önerileri",
                  "Beyaz etiket raporlar",
                  "Öncelikli destek"
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA BÖLÜMÜ */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Yapay zeka sizi önermesin mi?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Binlerce potansiyel müşteri sizi arıyor. Onlara ulaşmanın zamanı geldi.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-gray-900 hover:bg-gray-100">
                Ücretsiz Hesap Oluştur
              </Button>
            </Link>
            <p className="mt-6 text-sm text-gray-500">Kredi kartı gerekmez • 14 gün ücretsiz deneme</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Brain className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900">Ayzeo</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 Ayzeo. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-gray-900 text-sm">Gizlilik</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900 text-sm">Kullanım Şartları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
