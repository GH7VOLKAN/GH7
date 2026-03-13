"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBrand, updateBrandType, updateScanSchedule, updateNotificationPreferences } from "@/lib/actions";

type BrandType = "firma" | "kisisel";

interface AyarlarClientProps {
  brandId: string;
  brandName: string;
  brandDomain: string;
  brandSector: string;
  brandType: BrandType;
  autoScan: boolean;
  scanInterval: string;
  phone: string;
  smsEnabled: boolean;
}

export function AyarlarClient({
  brandId,
  brandName,
  brandDomain,
  brandSector,
  brandType: initialBrandType,
  autoScan: initialAutoScan,
  scanInterval: initialInterval,
  phone: initialPhone,
  smsEnabled: initialSmsEnabled,
}: AyarlarClientProps) {
  const router = useRouter();
  const [name, setName] = useState(brandName);
  const [domain, setDomain] = useState(brandDomain);
  const [sector, setSector] = useState(brandSector);
  const [brandType, setBrandType] = useState<BrandType>(initialBrandType);
  const [autoScan, setAutoScan] = useState(initialAutoScan);
  const [scanInterval, setScanInterval] = useState(initialInterval);
  const [phone, setPhone] = useState(initialPhone);
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null);
  const [typeMsg, setTypeMsg] = useState<string | null>(null);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateBrand(brandId, { name, domain, sector });
        setMessage("Kaydedildi");
        setTimeout(() => setMessage(null), 2000);
      } catch {
        setMessage("Hata oluştu");
      }
    });
  }

  const inputClass =
    "mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors";

  return (
    <div className="space-y-8 px-4 lg:px-6">
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Ayarlar
        </p>
        <h1 className="mt-2 text-2xl font-light tracking-[-0.04em]">
          Hesap Ayarları
        </h1>
      </div>

      {/* Brand Type Selector */}
      <div className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Hesap Türü
        </h3>
        <p className="text-xs text-muted-foreground">
          Dashboard deneyiminizi hesap türünüze göre özelleştirin.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                value: "firma" as BrandType,
                title: "Firma",
                desc: "Kurumsal marka takibi, rakip analizi, site SEO auditi.",
              },
              {
                value: "kisisel" as BrandType,
                title: "Kişisel",
                desc: "Kişisel tanınırlık, dijital iz takibi, senin yerine kim.",
              },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setBrandType(option.value);
                startTransition(async () => {
                  try {
                    await updateBrandType(brandId, option.value);
                    setTypeMsg("Kaydedildi");
                    router.refresh();
                    setTimeout(() => setTypeMsg(null), 2000);
                  } catch {
                    setTypeMsg("Hata oluştu");
                  }
                });
              }}
              disabled={isPending}
              className={`rounded-xl border-[1.5px] p-4 text-left transition-all ${
                brandType === option.value
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <p className="text-sm font-bold">{option.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {option.desc}
              </p>
            </button>
          ))}
        </div>
        {typeMsg && (
          <span className="text-sm text-muted-foreground">{typeMsg}</span>
        )}
      </div>

      <div className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Marka Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sektör
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Otomatik Tarama
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Otomatik tarama</p>
            <p className="text-xs text-muted-foreground">
              Taramalar belirtilen sıklıkta otomatik çalışır
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoScan}
            onClick={() => setAutoScan(!autoScan)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${autoScan ? "bg-foreground" : "bg-muted"}`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform ${autoScan ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
        {autoScan && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Tarama Sıklığı
            </label>
            <select
              value={scanInterval}
              onChange={(e) => setScanInterval(e.target.value)}
              className={inputClass}
            >
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              startTransition(async () => {
                try {
                  await updateScanSchedule(brandId, { autoScan, scanInterval });
                  setScheduleMsg("Kaydedildi");
                  setTimeout(() => setScheduleMsg(null), 2000);
                } catch {
                  setScheduleMsg("Hata oluştu");
                }
              });
            }}
            disabled={isPending}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {scheduleMsg && (
            <span className="text-sm text-muted-foreground">{scheduleMsg}</span>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Bildirim Tercihleri
        </h3>
        <p className="text-xs text-muted-foreground">
          Tarama sonuçları ve skor değişimleri için bildirim ayarlarınızı yönetin.
        </p>

        {/* SMS Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">SMS Bildirimleri</p>
            <p className="text-xs text-muted-foreground">
              Tarama sonuçlarını telefonunuza da gönderin (Pro)
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={smsEnabled}
            onClick={() => setSmsEnabled(!smsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${smsEnabled ? "bg-foreground" : "bg-muted"}`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform ${smsEnabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {smsEnabled && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Telefon Numarası
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className={inputClass}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              startTransition(async () => {
                try {
                  await updateNotificationPreferences({
                    phone,
                    smsEnabled,
                  });
                  setNotifMsg("Kaydedildi");
                  setTimeout(() => setNotifMsg(null), 2000);
                } catch {
                  setNotifMsg("Hata oluştu");
                }
              });
            }}
            disabled={isPending}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {notifMsg && (
            <span className="text-sm text-muted-foreground">{notifMsg}</span>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Plan Bilgisi
        </h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-bold">Pro</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dönem</span>
            <span className="font-bold">Aylık</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sonraki Ödeme</span>
            <span className="font-bold">10 Nisan 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
