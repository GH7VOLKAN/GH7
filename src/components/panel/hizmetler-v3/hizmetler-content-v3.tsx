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
  BTN_PRIMARY,
  BTN_OUTLINE,
} from "@/components/panel/kinde/primitives";

const STATUS_LABELS: Record<string, string> = {
  pending: "beklemede",
  in_progress: "yapılıyor",
  delivered: "teslim edildi",
  approved_preliminary: "ön onay",
  approved_final: "onaylandı",
  refunded: "iade edildi",
  cancelled: "iptal",
};

export interface HizmetlerV3Props {
  plan: string;
  packages: ServicePackageData[];
  orders: ServiceOrderData[];
  currentScore: number;
  userType: string;
  failCount: number;
  lastUpdate: string | null;
}

export function HizmetlerContentV3(props: HizmetlerV3Props) {
  const isPro = props.plan !== "free";
  const activeOrders = props.orders.filter(
    (o) => !["refunded", "approved_final", "cancelled"].includes(o.status),
  );

  return (
    <KindePage>
      <KindeHero
        title="Hizmet Paketleri"
        subtitle="Eksiklerinizi profesyonel ekibimiz çözsün — önce gör, sonra öde."
      />

      <Divider />
      <SectionMetrics
        score={props.currentScore}
        failCount={props.failCount}
        orderCount={props.orders.length}
      />
      <Divider />

      {activeOrders.length > 0 && (
        <>
          <SectionOrders orders={props.orders} />
          <Divider />
        </>
      )}

      <SectionPackages
        packages={props.packages}
        currentScore={props.currentScore}
        isPro={isPro}
      />
      <Divider />
      <SectionPolicy />
      <Divider />
      <KindeFooter lastUpdate={props.lastUpdate} />
    </KindePage>
  );
}

/* -------------------------------------------------- */
/*  Üst metrikler                                       */
/* -------------------------------------------------- */
function SectionMetrics({
  score,
  failCount,
  orderCount,
}: {
  score: number;
  failCount: number;
  orderCount: number;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="gh7-fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
      }}
    >
      <MetricCard label="Mevcut Skor" value={`${score}/100`} />
      <MetricCard label="Eksik Madde" value={String(failCount)} />
      <MetricCard label="Sipariş" value={String(orderCount)} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 20,
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: KINDE_COLORS.mutedLight,
          letterSpacing: "0.04em",
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Aktif siparişler                                    */
/* -------------------------------------------------- */
function SectionOrders({ orders }: { orders: ServiceOrderData[] }) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Siparişleriniz.</SectionHeading>
      <SectionLead>Teslim edilenler ve yapılmakta olanlar.</SectionLead>

      <div style={{ display: "flex", flexDirection: "column" }}>
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
                <div
                  style={{
                    fontSize: 12,
                    color: KINDE_COLORS.muted,
                    fontWeight: 600,
                  }}
                >
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

/* -------------------------------------------------- */
/*  Paket listesi                                       */
/* -------------------------------------------------- */
function SectionPackages({
  packages,
  currentScore,
  isPro,
}: {
  packages: ServicePackageData[];
  currentScore: number;
  isPro: boolean;
}) {
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
        {isPro
          ? "Her paket 43 maddeden spesifik eksikleri hedefler. Fiyatlar aşağıda, seçip satın alabilirsiniz."
          : "Her paket 43 maddeden spesifik eksikleri hedefler. Detay ve fiyatlar Pro üyelere özeldir."}
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            currentScore={currentScore}
            isPro={isPro}
          />
        ))}
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  currentScore,
  isPro,
}: {
  pkg: ServicePackageData;
  currentScore: number;
  isPro: boolean;
}) {
  const targetScore = Math.min(100, currentScore + pkg.estimatedScoreBoost);
  return (
    <div
      style={{
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
        padding: 28,
        background: KINDE_COLORS.white,
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
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {pkg.name}
        </div>
        <div style={{ fontSize: 11, color: KINDE_COLORS.mutedLight }}>
          {pkg.deliveryDays} gün teslim
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
          fontSize: 13,
          color: KINDE_COLORS.muted,
          marginBottom: 20,
        }}
      >
        Mevcut: {currentScore}/100 →{" "}
        <strong style={{ color: KINDE_COLORS.black }}>
          Tahmini {targetScore}/100
        </strong>{" "}
        (+{pkg.estimatedScoreBoost})
      </div>

      <div style={{ fontSize: 13, color: "#333", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: KINDE_COLORS.muted,
            letterSpacing: "0.04em",
            marginBottom: 6,
          }}
        >
          BU PAKETE DAHİL
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            lineHeight: 1.8,
            listStyle: "none",
          }}
        >
          {pkg.deliverables.slice(0, 6).map((d, i) => (
            <li key={i} style={{ paddingLeft: 14, position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  color: KINDE_COLORS.muted,
                }}
              >
                ·
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {isPro ? (
        <>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            ₺{pkg.price.toLocaleString("tr-TR")}
          </div>
          <Link href={`/panel/hizmetler/${pkg.slug}`} style={BTN_PRIMARY}>
            Paketi Al · Önce Gör Sonra Öde
          </Link>
        </>
      ) : (
        <Link href="/panel/abonelik" style={BTN_OUTLINE}>
          Pro üyelere özel — Pro'ya Geç
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Politika                                             */
/* -------------------------------------------------- */
function SectionPolicy() {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Nasıl çalışıyor.</SectionHeading>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "#333",
          marginBottom: 8,
        }}
      >
        Önce iş yapılır, sonuç görüldükten sonra onaylanır. Ödeme yalnızca
        onayladıktan sonra tahsil edilir.
      </p>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: KINDE_COLORS.muted,
        }}
      >
        72 saat içinde itiraz hakkınız vardır. İtiraz kabul edilirse ücret iade
        edilir, paket düzeltmelere devam eder.
      </p>
    </div>
  );
}
