"use client";

import { useState } from "react";
import Link from "next/link";
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

export interface AyarlarV3Props {
  profileEmail: string;
  profileFullName: string;
  profilePhone: string | null;
  brandName: string;
  brandDomain: string;
  brandSector: string;
  plan: string;
}

export function AyarlarContentV3(props: AyarlarV3Props) {
  const isPro = props.plan !== "free";

  return (
    <KindePage>
      <KindeHero
        title="Ayarlar."
        subtitle="Hesap, marka ve abonelik bilgilerinizi buradan yönetin."
        tertiary={isPro ? "Aktif plan: Pro" : "Aktif plan: Ücretsiz"}
      />
      <Divider />
      <SectionProfile {...props} />
      <Divider />
      <SectionBrand {...props} />
      <Divider />
      <SectionPlan plan={props.plan} />
      <Divider />
      <SectionDangerZone />
      <Divider />
      <KindeFooter lastUpdate={null} />
    </KindePage>
  );
}

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: string | React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 0",
        borderBottom: `1px solid ${KINDE_COLORS.divider}`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: KINDE_COLORS.mutedLight }}>
          {label}
        </div>
        <div
          style={{ marginTop: 4, fontSize: 15, fontWeight: 500, color: "#222" }}
        >
          {value || <span style={{ color: KINDE_COLORS.mutedLight }}>—</span>}
        </div>
      </div>
      {action}
    </div>
  );
}

function SectionProfile({ profileEmail, profileFullName, profilePhone }: AyarlarV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Profil.</SectionHeading>
      <SectionLead>Kişisel bilgileriniz.</SectionLead>
      <Row label="AD SOYAD" value={profileFullName} />
      <Row label="E-POSTA" value={profileEmail} />
      <Row label="TELEFON" value={profilePhone ?? ""} />
    </div>
  );
}

function SectionBrand({ brandName, brandDomain, brandSector }: AyarlarV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Markanız.</SectionHeading>
      <SectionLead>
        Analiz ve taramaların odaklandığı marka bilgileri.
      </SectionLead>
      <Row label="MARKA ADI" value={brandName} />
      <Row label="DOMAIN" value={brandDomain} />
      <Row label="SEKTÖR" value={brandSector} />
    </div>
  );
}

function SectionPlan({ plan }: { plan: string }) {
  const ref = useFadeIn<HTMLDivElement>();
  const isPro = plan !== "free";
  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Abonelik.</SectionHeading>
      <SectionLead>
        {isPro
          ? "Pro plan aktif. Haftalık tarama, 20 sorgu, 5 il, 3 proje."
          : "Ücretsiz plan. Tek seferlik analiz, 10 sorgu, 1 il."}
      </SectionLead>
      <div
        style={{
          padding: 24,
          background: KINDE_COLORS.bgSoft,
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 13, color: KINDE_COLORS.mutedLight }}>
          MEVCUT PLAN
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {isPro ? "Pro · ₺699/ay" : "Ücretsiz"}
        </div>
        <div style={{ marginTop: 16 }}>
          <Link
            href="/panel/abonelik"
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
            {isPro ? "Aboneliği yönet" : "Pro'ya yükselt"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionDangerZone() {
  const ref = useFadeIn<HTMLDivElement>();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      } else {
        alert("Hesap silinemedi. Lütfen destek ile iletişime geçin.");
        setLoading(false);
      }
    } catch {
      alert("Hesap silinemedi. Bağlantıyı kontrol edin.");
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Tehlikeli bölge.</SectionHeading>
      <SectionLead>
        Hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz — tüm
        audit verileri, sorgular, analizler silinir.
      </SectionLead>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: confirming ? "#C62828" : "#FFF",
          color: confirming ? "#FFF" : "#C62828",
          border: "1px solid #C62828",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: KINDE_FONT,
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading
          ? "Siliniyor..."
          : confirming
            ? "Emin misiniz? Tekrar tıklayın"
            : "Hesabımı sil"}
      </button>
    </div>
  );
}
