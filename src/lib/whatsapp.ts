export function generateWhatsAppShareLink(params: {
  phone?: string;
  text: string;
}): string {
  const encodedText = encodeURIComponent(params.text);
  if (params.phone) {
    return `https://wa.me/${params.phone.replace(/\D/g, '')}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function generateWeeklyReportMessage(data: {
  brandName: string;
  geoScore: number;
  delta: number;
  topInsight: string;
  dashboardUrl: string;
}): string {
  const deltaText =
    data.delta > 0
      ? `↑${data.delta}`
      : data.delta < 0
        ? `↓${Math.abs(data.delta)}`
        : '→';

  return `*GH7.ai Haftalık Rapor* — ${data.brandName}

GEO Skoru: *${data.geoScore}/100* ${deltaText}

${data.topInsight}

Detaylı rapor: ${data.dashboardUrl}

_GH7.ai tarafından gönderildi_`;
}

export function generateActionShareMessage(params: {
  keyword: string;
  issue: string;
  recommendation: string;
}): string {
  return `*GH7.ai Aksiyon Talebi*

Sorgu: ${params.keyword}
Sorun: ${params.issue}
Öneri: ${params.recommendation}

Lütfen bu optimizasyonu tamamlayın.`;
}

export function generatePdfShareMessage(
  brandName: string,
  pdfUrl: string,
): string {
  return `*GH7.ai GEO Raporu* — ${brandName}

Raporu indirin: ${pdfUrl}

_GH7.ai tarafından oluşturuldu_`;
}
