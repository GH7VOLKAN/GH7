"use client";

import { useState } from "react";
import {
  KindePage,
  KindeHero,
  Divider,
  SectionHeading,
  SectionLead,
  KindeFooter,
  KindeToggle,
  useFadeIn,
  KINDE_COLORS,
  KINDE_FONT,
  BTN_PRIMARY,
  BTN_OUTLINE,
} from "@/components/panel/kinde/primitives";

const USER_TYPES: Array<{ value: string; label: string }> = [
  { value: "firma", label: "Firma" },
  { value: "kisi", label: "Kişi" },
  { value: "eticaret", label: "E-ticaret" },
  { value: "yurtdisi", label: "Yurtdışı" },
];

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  border: `1px solid ${KINDE_COLORS.divider}`,
  borderRadius: 8,
  background: KINDE_COLORS.white,
  fontFamily: KINDE_FONT,
  color: KINDE_COLORS.black,
  outline: "none",
};

function isSyntheticEmail(email: string | null): boolean {
  if (!email) return true;
  return email.startsWith("phone_") && email.endsWith("@gh7.ai");
}

export interface AyarlarV3Props {
  profileEmail: string;
  profileFullName: string;
  profilePhone: string | null;
  brandName: string;
  brandDomain: string;
  brandSector: string;
  userType: string;
  plan: string;
  serviceRegions: string[];
  competitors: Array<{
    id: string;
    name: string;
    domain: string | null;
    isPrimary: boolean;
  }>;
  notifications: {
    weeklyReport: boolean;
    scoreChange: boolean;
    scanComplete: boolean;
  };
}

export function AyarlarContentV3(props: AyarlarV3Props) {
  return (
    <KindePage>
      <KindeHero
        title="Ayarlar"
        subtitle="Hesap, marka, il, rakip ve bildirim tercihlerinizi buradan yönetin."
      />
      <Divider />
      <SectionBrand {...props} />
      <Divider />
      <SectionAccount {...props} />
      <Divider />
      <SectionRegions serviceRegions={props.serviceRegions} />
      <Divider />
      <SectionCompetitors competitors={props.competitors} />
      <Divider />
      <SectionNotifications notifications={props.notifications} />
      <Divider />
      <SectionDangerZone />
      <Divider />
      <KindeFooter lastUpdate={null} />
    </KindePage>
  );
}

/* -------------------------------------------------- */
/*  Marka bilgileri                                     */
/* -------------------------------------------------- */
function SectionBrand(props: AyarlarV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  const [name, setName] = useState(props.brandName);
  const [domain, setDomain] = useState(props.brandDomain);
  const [sector, setSector] = useState(props.brandSector);
  const [userType, setUserType] = useState(props.userType);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const isPro = props.plan !== "free";

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, sector, userType }),
      });
      if (res.ok) {
        setMsg("Kaydedildi.");
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.error ?? "Kaydedilemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Marka bilgileri.</SectionHeading>
      <SectionLead>
        Analiz ve taramaların odaklandığı marka verileri. Domain veya sektör
        değişirse sonraki taramada yeni değerler kullanılır.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="MARKA ADI">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={INPUT_STYLE}
          />
        </Field>
        <Field label="DOMAIN">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ornek.com"
            style={INPUT_STYLE}
          />
        </Field>
        <Field label="SEKTÖR">
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Turizm, Otomotiv, E-ticaret..."
            style={INPUT_STYLE}
          />
        </Field>
        <Field label="KULLANICI TİPİ">
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            style={{ ...INPUT_STYLE, cursor: "pointer" }}
          >
            {USER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="PLAN">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              border: `1px solid ${KINDE_COLORS.divider}`,
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>
              {isPro ? "Pro · ₺699/ay" : "Ücretsiz"}
            </span>
            {!isPro && (
              <a
                href="/panel/abonelik"
                style={{
                  fontSize: 13,
                  color: KINDE_COLORS.black,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Pro'ya geçin →
              </a>
            )}
          </div>
        </Field>
      </div>

      <SaveRow saving={saving} msg={msg} onSave={save} />
    </div>
  );
}

/* -------------------------------------------------- */
/*  Hesap bilgileri                                     */
/* -------------------------------------------------- */
function SectionAccount(props: AyarlarV3Props) {
  const ref = useFadeIn<HTMLDivElement>();
  const [fullName, setFullName] = useState(props.profileFullName);
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState(props.profileEmail);

  const synthetic = isSyntheticEmail(currentEmail);

  const saveFullName = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (res.ok) {
        setMsg("Kaydedildi.");
      } else {
        setMsg("Kaydedilemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (res.ok) {
        const body = await res.json();
        setCurrentEmail(body.email);
        setAddingEmail(false);
        setMsg(
          "E-posta eklendi. Doğrulama kodu göndermek için giriş sayfasını kullanın.",
        );
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.error ?? "Kaydedilemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Hesap bilgileri.</SectionHeading>
      <SectionLead>
        Giriş bilgileriniz. Şifre kullanmıyoruz — her girişte telefon veya
        e-posta ile 6 haneli kod gönderiyoruz.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="TELEFON">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              border: `1px solid ${KINDE_COLORS.divider}`,
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <span>{props.profilePhone ?? "—"}</span>
            {props.profilePhone && (
              <span style={{ fontSize: 12, color: KINDE_COLORS.muted }}>
                doğrulanmış
              </span>
            )}
          </div>
        </Field>

        <Field label="E-POSTA">
          {synthetic ? (
            addingEmail ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ad@sirketim.com"
                  style={INPUT_STYLE}
                />
                <button
                  type="button"
                  onClick={saveEmail}
                  disabled={saving}
                  style={{ ...BTN_PRIMARY, padding: "10px 16px" }}
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setAddingEmail(false)}
                  style={{ ...BTN_OUTLINE, padding: "10px 16px" }}
                >
                  İptal
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  border: `1px solid ${KINDE_COLORS.divider}`,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <span style={{ color: KINDE_COLORS.mutedLight }}>
                  E-posta adresinizi ekleyin
                </span>
                <button
                  type="button"
                  onClick={() => setAddingEmail(true)}
                  style={{
                    background: "transparent",
                    border: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: KINDE_COLORS.black,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  E-posta Ekle →
                </button>
              </div>
            )
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                border: `1px solid ${KINDE_COLORS.divider}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              <span>{currentEmail}</span>
              <span style={{ fontSize: 12, color: KINDE_COLORS.muted }}>
                eklendi
              </span>
            </div>
          )}
        </Field>

        <Field label="AD SOYAD">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ad Soyad"
            style={INPUT_STYLE}
          />
        </Field>
      </div>

      <SaveRow saving={saving} msg={msg} onSave={saveFullName} />
    </div>
  );
}

/* -------------------------------------------------- */
/*  İl yönetimi                                         */
/* -------------------------------------------------- */
function SectionRegions({ serviceRegions }: { serviceRegions: string[] }) {
  const ref = useFadeIn<HTMLDivElement>();
  const [regions, setRegions] = useState<string[]>(serviceRegions);
  const [adding, setAdding] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const persist = async (next: string[]) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/brand/regions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions: next }),
      });
      if (res.ok) {
        setRegions(next);
      } else {
        setMsg("Kaydedilemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const addCity = async () => {
    const trimmed = newCity.trim();
    if (!trimmed) return;
    if (regions.length >= 3) {
      setMsg("Maksimum 3 il ekleyebilirsiniz.");
      return;
    }
    if (regions.includes(trimmed)) {
      setMsg("Bu il zaten ekli.");
      return;
    }
    const next = [...regions, trimmed];
    await persist(next);
    setNewCity("");
    setAdding(false);
  };

  const removeCity = async (city: string) => {
    const next = regions.filter((r) => r !== city);
    await persist(next);
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>İl seçimi.</SectionHeading>
      <SectionLead>
        Analiz yapılacak iller (maksimum 3). Sorgular ve taramalar seçtiğiniz
        iller için özel olarak çalışır.
      </SectionLead>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {regions.map((city) => (
          <div
            key={city}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: KINDE_COLORS.white,
              border: `1px solid ${KINDE_COLORS.divider}`,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span>{city}</span>
            <button
              type="button"
              onClick={() => removeCity(city)}
              disabled={saving}
              style={{
                background: "transparent",
                border: 0,
                cursor: "pointer",
                fontSize: 13,
                color: KINDE_COLORS.muted,
                padding: 0,
                fontFamily: "inherit",
              }}
              aria-label={`${city} ilini kaldır`}
            >
              ×
            </button>
          </div>
        ))}
        {regions.length < 3 &&
          (adding ? (
            <div style={{ display: "inline-flex", gap: 6 }}>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="İl adı"
                style={{ ...INPUT_STYLE, width: 160 }}
              />
              <button
                type="button"
                onClick={addCity}
                disabled={saving}
                style={{ ...BTN_PRIMARY, padding: "10px 16px" }}
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                style={{ ...BTN_OUTLINE, padding: "10px 16px" }}
              >
                İptal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              style={{ ...BTN_OUTLINE, padding: "8px 14px", fontSize: 13 }}
            >
              + İl Ekle
            </button>
          ))}
      </div>

      {msg && (
        <div style={{ fontSize: 12, color: KINDE_COLORS.muted }}>{msg}</div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Rakip yönetimi                                      */
/* -------------------------------------------------- */
function SectionCompetitors({
  competitors,
}: {
  competitors: Array<{
    id: string;
    name: string;
    domain: string | null;
    isPrimary: boolean;
  }>;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  const [list, setList] = useState(competitors);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const addCompetitor = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (list.length >= 5) {
      setMsg("Maksimum 5 rakip ekleyebilirsiniz.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/panel/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, domain: domain.trim() || undefined }),
      });
      if (res.ok) {
        const body = await res.json();
        setList([
          ...list,
          {
            id: body.competitor.id,
            name: body.competitor.name,
            domain: body.competitor.domain ?? null,
            isPrimary: false,
          },
        ]);
        setName("");
        setDomain("");
        setAdding(false);
      } else {
        setMsg("Eklenemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const removeCompetitor = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/panel/competitors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setList(list.filter((c) => c.id !== id));
      } else {
        setMsg("Silinemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const togglePrimary = async (id: string, next: boolean) => {
    const primaryCount = list.filter((c) => c.isPrimary).length;
    if (next && primaryCount >= 3) {
      setMsg("Maksimum 3 ana rakip. Önce birini kaldırın.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/panel/competitors/${id}/primary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary: next }),
      });
      if (res.ok) {
        setList(list.map((c) => (c.id === id ? { ...c, isPrimary: next } : c)));
        if (next) {
          setMsg(
            "Ana rakip olarak işaretlendi. Yeni audit'te karşılaştırmaya dahil olur.",
          );
        }
      } else {
        const body = await res.json().catch(() => ({}));
        setMsg(body.error ?? "İşaretlenemedi.");
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const primaryCount = list.filter((c) => c.isPrimary).length;

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Rakip yönetimi.</SectionHeading>
      <SectionLead>
        Rakipleriniz (max 5). Bunların {primaryCount}/3'ü ana rakip olarak
        işaretli — audit'te madde madde karşılaştırma onlarla yapılır. Yeniden
        audit için ana rakipleri değiştirip "Yeniden Analiz Et" butonuna
        basabilirsiniz.
      </SectionLead>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {list.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${KINDE_COLORS.divider}`,
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {c.name}
                {c.isPrimary && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: KINDE_COLORS.black,
                      fontWeight: 700,
                    }}
                  >
                    · ana rakip
                  </span>
                )}
              </div>
              {c.domain && (
                <div
                  style={{
                    fontSize: 12,
                    color: KINDE_COLORS.mutedLight,
                    marginTop: 2,
                  }}
                >
                  {c.domain}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: KINDE_COLORS.muted,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={c.isPrimary}
                  onChange={(e) => togglePrimary(c.id, e.target.checked)}
                  disabled={saving || (!c.isPrimary && primaryCount >= 3)}
                  style={{ accentColor: KINDE_COLORS.black }}
                />
                ana rakip
              </label>
              <button
                type="button"
                onClick={() => removeCompetitor(c.id)}
                disabled={saving}
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: 13,
                  color: KINDE_COLORS.muted,
                  fontFamily: "inherit",
                }}
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
      </div>

      {list.length < 5 && (
        <div style={{ marginTop: 16 }}>
          {adding ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rakip adı"
                style={INPUT_STYLE}
              />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com (opsiyonel)"
                style={INPUT_STYLE}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={addCompetitor}
                  disabled={saving}
                  style={BTN_PRIMARY}
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  style={BTN_OUTLINE}
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              style={{ ...BTN_OUTLINE, padding: "8px 14px", fontSize: 13 }}
            >
              + Rakip Ekle
            </button>
          )}
        </div>
      )}

      {msg && (
        <div style={{ fontSize: 12, color: KINDE_COLORS.muted, marginTop: 12 }}>
          {msg}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Bildirim tercihleri                                 */
/* -------------------------------------------------- */
function SectionNotifications({
  notifications,
}: {
  notifications: AyarlarV3Props["notifications"];
}) {
  const ref = useFadeIn<HTMLDivElement>();
  const [weekly, setWeekly] = useState(notifications.weeklyReport);
  const [scoreChange, setScoreChange] = useState(notifications.scoreChange);
  const [scanComplete, setScanComplete] = useState(notifications.scanComplete);

  const persist = async (key: string, value: boolean) => {
    try {
      await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      // non-fatal
    }
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Bildirim tercihleri.</SectionHeading>
      <SectionLead>
        Hangi durumlarda e-posta almak istediğinizi seçin.
      </SectionLead>

      <KindeToggle
        checked={weekly}
        onChange={(v) => {
          setWeekly(v);
          persist("emailWeeklyReport", v);
        }}
        label="Haftalık rapor e-postası"
        description="Pazartesi günleri haftalık GEO skoru + sorgu özeti"
      />
      <KindeToggle
        checked={scoreChange}
        onChange={(v) => {
          setScoreChange(v);
          persist("emailScoreChange", v);
        }}
        label="Skor değişikliği bildirimi"
        description="±5 puan veya daha fazla değişiklik olduğunda"
      />
      <KindeToggle
        checked={scanComplete}
        onChange={(v) => {
          setScanComplete(v);
          persist("emailScanComplete", v);
        }}
        label="Tarama tamamlandı"
        description="Haftalık otomatik tarama bittikten sonra"
      />
    </div>
  );
}

/* -------------------------------------------------- */
/*  Hesap silme                                         */
/* -------------------------------------------------- */
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
        alert("Hesap silinemedi. Destek ile iletişime geçin.");
        setLoading(false);
      }
    } catch {
      alert("Hesap silinemedi. Bağlantıyı kontrol edin.");
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="gh7-fade-in">
      <SectionHeading>Hesap işlemleri.</SectionHeading>
      <SectionLead>
        Bu işlem geri alınamaz. Tüm verileriniz (marka, audit, sorgular,
        taramalar) kalıcı olarak silinir.
      </SectionLead>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        style={{
          ...BTN_OUTLINE,
          opacity: loading ? 0.5 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading
          ? "Siliniyor..."
          : confirming
            ? "Emin misiniz? Tekrar tıklayın."
            : "Hesabımı sil"}
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Küçük yardımcılar                                   */
/* -------------------------------------------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: KINDE_COLORS.mutedLight,
          letterSpacing: "0.04em",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SaveRow({
  saving,
  msg,
  onSave,
}: {
  saving: boolean;
  msg: string | null;
  onSave: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 12, color: KINDE_COLORS.muted }}>{msg ?? ""}</div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={{
          ...BTN_PRIMARY,
          opacity: saving ? 0.6 : 1,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}
