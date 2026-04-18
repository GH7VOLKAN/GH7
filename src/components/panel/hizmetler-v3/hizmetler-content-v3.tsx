"use client";

import Link from "next/link";
import type {
  ServicePackageData,
  ServiceOrderData,
} from "@/lib/dal/service-orders";
import {
  KindePage,
  KindeHero,
  Divider,
  SectionHeading,
  SectionLead,
  KindeFooter,
  useFadeIn,
  KINDE_COLORS,
  KINDE_FONT,
} from "@/components/panel/kinde/primitives";

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  in_progress: "Yapılıyor",
  delivered: "Teslim edildi",
  approved_preliminary: "Ön onay",
  approved_final: "Onaylandı",
  refunded: "İade edildi",
  cancelled: "İptal",
};

export interface HizmetlerV3Props {
  plan: string;
  packages: ServicePackageData[];
  orders: ServiceOrderData[];
  currentScore: number;
  userType: string;
  lastUpdate: string | null;
}

export function HizmetlerContentV3(props: HizmetlerV3Props) {
  const activeOrders = props.orders.filter(
    (o) => !["refunded", "approved_final", "cancelled"].includes(o.status),
  );

  return (
    <KindePage>
      <KindeHero
        title="Kırmızıları yeşile çevirelim."
        subtitle={`Audit'te düşük çıkan maddeleri biz düzeltelim. Mevcut skorunuz ${props.currentScore}/100.`}
        tertiary={
          activeOrders.length > 0
            ? `${activeOrders.length} aktif sipariş · ${props.orders.length} toplam`
            : `${props.packages.length} hazır paket var`
        }
      />
      <Divider />
      {activeOrders.length > 0 && (
        <>
          <SectionOrders orders={props.orders} />
          <Divider />
        </>
      )}
      <SectionPackages {...props} />
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

function SectionOrders({ orders }: { orders: ServiceOrderData[] }) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Aktif siparişleriniz.</SectionHeading>
      <SectionLead>Teslim edilenler ve yapılmakta olanlar.</SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {orders.map((o) => {
          const boost =
            o.preScore !== null && o.postScore !== null
              ? o.postScore - o.preScore
              : null;
          return (
            <div
              key={o.id}
              style={{
                padding: "20px 0",
                borderBottom: `1px solid ${KINDE_COLORS.divider}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {o.packageName}
                </div>
                <div style={{ fontSize: 12, color: KINDE_COLORS.muted }}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </div>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: KINDE_COLORS.mutedLight,
                }}
              >
                ₺{o.amount.toLocaleString("tr-TR")}
                {boost !== null && ` · Skor +${boost}`}
                {o.deliveredAt &&
                  ` · Teslim ${new Date(o.deliveredAt).toLocaleDateString("tr-TR")}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionPackages({ packages, currentScore }: HizmetlerV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  if (packages.length === 0) {
    return (
      <div ref={ref} className="gh7-fade-in">
        <SectionHeading>Paket bulunamadı.</SectionHeading>
        <SectionLead>
          Kullanıcı tipinize uygun hizmet paketi henüz tanımlanmamış.
        </SectionLead>
      </div>
    );
  }
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Hazır paketler.</SectionHeading>
      <SectionLead>
        Her paket 43 maddeden spesifik eksikleri hedefler. Fiyat önce
        gösterilmez; detaya tıklayın.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            currentScore={currentScore}
          />
        ))}
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  currentScore,
}: {
  pkg: ServicePackageData;
  currentScore: number;
}) {
  const targetScore = Math.min(100, currentScore + pkg.estimatedScoreBoost);
  return (
    <div
      style={{
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>{pkg.name}</div>
        <div style={{ fontSize: 11, color: KINDE_COLORS.mutedLight }}>
          {pkg.tier} · {pkg.deliveryDays} gün
        </div>
      </div>
      <p
        style={{
          fontSize: 14,
          color: "#333",
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        {pkg.description}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 13,
          color: KINDE_COLORS.muted,
          marginBottom: 16,
        }}
      >
        <span>Şu an: {currentScore}/100</span>
        <span>→</span>
        <span style={{ color: "#2E7D32", fontWeight: 600 }}>
          Tahmini: {targetScore}/100
        </span>
        <span>(+{pkg.estimatedScoreBoost})</span>
      </div>
      <div style={{ fontSize: 13, color: "#333", marginBottom: 16 }}>
        <strong style={{ fontSize: 11, color: "#666" }}>TESLİMATLAR</strong>
        <ul style={{ marginTop: 6, paddingLeft: 18, lineHeight: 1.7 }}>
          {pkg.deliverables.slice(0, 5).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
      <Link
        href={`/panel/hizmetler/${pkg.slug}`}
        style={{
          display: "inline-flex",
          padding: "10px 20px",
          background: KINDE_COLORS.black,
          color: KINDE_COLORS.white,
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: KINDE_FONT,
        }}
      >
        Detay ve fiyat →
      </Link>
    </div>
  );
}
