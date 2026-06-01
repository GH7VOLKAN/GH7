import { ClassifiedSource, QueryGap, Stage2Overview } from '../schema/stage2';

export function buildReport(input: {
  brand: string;
  overview: Stage2Overview | null;
  classified: ClassifiedSource[];
  gaps: QueryGap[];
}): string {
  const { brand, overview, classified, gaps } = input;
  const L: string[] = [];

  L.push(`# ${brand} — AI Görünürlük Aksiyon Raporu (Stage 2)\n`);

  if (overview) {
    L.push('## Durum\n');
    L.push(overview.summary + '\n');
    L.push('**Atıf alınıyor vs önerilliyor:** ' + overview.citedVsRecommended + '\n');
    L.push('## Kaynak okuması\n');
    L.push('- **Kendi domainin:** ' + overview.sourceReading.own);
    L.push('- **Rakip domainleri:** ' + overview.sourceReading.competitor);
    L.push('- **Nötr kaynaklar:** ' + overview.sourceReading.neutral + '\n');
    L.push('## Ana kaldıraç\n');
    L.push(overview.mainLever + '\n');
    if (overview.neutralSourcePlan?.length) {
      L.push('### Kazanılabilir nötr kaynaklar\n');
      for (const n of overview.neutralSourcePlan) L.push('- ' + n);
      L.push('');
    }
  }

  L.push('## Kaynak sınıflandırması\n');
  L.push('| Atıf | Domain | Sınıf |');
  L.push('|---|---|---|');
  for (const s of classified.slice(0, 20))
    L.push(`| ${s.count} | ${s.domain} | ${s.klass} |`);
  L.push('');

  L.push('## Sorgu-bazlı gap + hazır içerik\n');
  L.push('_Kaybedilen / rakibin önde olduğu sorgular, öncelik sırasıyla. Her biri için: neden kaybediyorsun, ne eklemelisin, ve yayına hazır içerik._\n');

  for (const g of gaps) {
    L.push(`### "${g.query}"\n`);
    L.push('**Neden rakip kazanıyor:** ' + g.diagnosis + '\n');
    if (g.contentGap?.length) {
      L.push('**Eklenecekler (kendi sitende):**');
      for (const c of g.contentGap) L.push('- ' + c);
      L.push('');
    }
    if (g.faq?.length) {
      L.push('**Hazır FAQ:**');
      for (const f of g.faq) L.push(`- **${f.q}** — ${f.a}`);
      L.push('');
    }
    if (g.jsonLd) {
      L.push('**JSON-LD schema:**\n');
      L.push('```html\n' + g.jsonLd + '\n```\n');
    }
    if (g.pageActions?.length) {
      L.push('**Aksiyonlar:**');
      g.pageActions.forEach((a, i) => L.push(`${i + 1}. ${a}`));
      L.push('');
    }
  }

  return L.join('\n');
}
