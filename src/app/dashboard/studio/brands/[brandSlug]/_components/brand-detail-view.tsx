"use client";

/**
 * BrandDetailView — Studio marka detayı + CRUD (Brief H-polish Aşama 2).
 *
 * Bölümler:
 * 01 · Marka Bilgisi — name/domain/sector/city inline düzenleme
 * 02 · Takip Edilen Sorgular — salt okunur (düzenleme Brief N'de)
 * 03 · Rakipler — ekle/sil (max 10)
 * 04 · Tehlikeli Bölge — marka silme (name confirm)
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { formatDate } from "@/lib/templates/common/formatters";
import type { Gate } from "@prisma/client";

type BrandSummary = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  sector: string | null;
  city: string | null;
  gate: Gate;
  createdAt: Date;
};

type PromptRow = { id: string; text: string };

type CompetitorRow = {
  id: string;
  name: string;
  domain: string;
  isPrimary: boolean;
  source: string;
};

type Props = {
  brand: BrandSummary;
  prompts: PromptRow[];
  competitors: CompetitorRow[];
};

export function BrandDetailView({ brand, prompts, competitors }: Props) {
  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-3xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="mb-4 text-label text-muted-foreground">
          <Link href="/dashboard/studio" className="hover:text-foreground">
            Studio
          </Link>
          {" / "}
          Marka Detayı
        </div>
        <h1 className="text-h1 mb-4">{brand.name}</h1>
        <p className="text-sm text-muted-foreground">
          {brand.domain} · Eklendi {formatDate(brand.createdAt)}
        </p>
      </motion.div>

      <MetaSection brand={brand} />
      <PromptsSection prompts={prompts} brandSlug={brand.slug} />
      <CompetitorsSection
        competitors={competitors}
        brandSlug={brand.slug}
      />
      <DangerSection brand={brand} />
    </motion.div>
  );
}

// ─── 01 · MARKA BİLGİSİ ────────────────────────────────

function MetaSection({ brand }: { brand: BrandSummary }) {
  const router = useRouter();
  const [editing, setEditing] = useState<null | "name" | "sector" | "city">(
    null,
  );
  const [values, setValues] = useState({
    name: brand.name,
    sector: brand.sector ?? "",
    city: brand.city ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  async function save(field: "name" | "sector" | "city", value: string) {
    setError(null);
    const res = await fetch(`/api/brands/${brand.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [field]: field === "name" ? value : value || null,
      }),
    });
    const data = (await res.json()) as { message?: string; error?: string };
    if (!res.ok) {
      setError(data.message ?? data.error ?? "Kaydedilemedi");
      return;
    }
    setEditing(null);
    startSave(() => router.refresh());
  }

  return (
    <motion.section variants={pageItem} className="mb-16">
      <SectionLabel index="01" title="Marka Bilgisi" />
      <dl className="space-y-0">
        <EditableRow
          label="İsim"
          value={values.name}
          editing={editing === "name"}
          saving={saving}
          onEdit={() => setEditing("name")}
          onCancel={() => {
            setValues({ ...values, name: brand.name });
            setEditing(null);
            setError(null);
          }}
          onChange={(v) => setValues({ ...values, name: v })}
          onSave={() => save("name", values.name)}
        />
        <InfoRow label="Website" value={brand.domain} />
        <InfoRow label="Kapı" value={gateLabel(brand.gate)} />
        <EditableRow
          label="Sektör"
          value={values.sector}
          placeholder="— belirtilmemiş —"
          editing={editing === "sector"}
          saving={saving}
          onEdit={() => setEditing("sector")}
          onCancel={() => {
            setValues({ ...values, sector: brand.sector ?? "" });
            setEditing(null);
            setError(null);
          }}
          onChange={(v) => setValues({ ...values, sector: v })}
          onSave={() => save("sector", values.sector)}
        />
        <EditableRow
          label="Şehir"
          value={values.city}
          placeholder="— belirtilmemiş —"
          editing={editing === "city"}
          saving={saving}
          onEdit={() => setEditing("city")}
          onCancel={() => {
            setValues({ ...values, city: brand.city ?? "" });
            setEditing(null);
            setError(null);
          }}
          onChange={(v) => setValues({ ...values, city: v })}
          onSave={() => save("city", values.city)}
        />
      </dl>
      {error && (
        <p className="mt-3 text-sm text-destructive">Hata: {error}</p>
      )}
    </motion.section>
  );
}

function gateLabel(gate: Gate): string {
  switch (gate) {
    case "FIRMA":
      return "Firma";
    case "KISI":
      return "Kişi";
    case "ETICARET":
      return "E-ticaret";
    case "YURTDISI":
      return "Yurtdışı";
    default:
      return String(gate);
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium tracking-tight">{value}</dd>
    </div>
  );
}

function EditableRow({
  label,
  value,
  editing,
  saving,
  placeholder,
  onEdit,
  onCancel,
  onChange,
  onSave,
}: {
  label: string;
  value: string;
  editing: boolean;
  saving: boolean;
  placeholder?: string;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
}) {
  if (!editing) {
    return (
      <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <div className="flex items-baseline gap-4">
          <dd
            className={`text-base font-medium tracking-tight ${value ? "" : "text-muted-foreground italic"}`}
          >
            {value || placeholder || "—"}
          </dd>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Düzenle
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <dt className="text-sm text-muted-foreground shrink-0">{label}</dt>
      <div className="flex flex-1 items-center justify-end gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={saving}
          className="w-full max-w-xs rounded-md border border-border bg-background px-2 py-1 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background disabled:opacity-60"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-60"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

// ─── 02 · SORGULAR ──────────────────────────────────────

function PromptsSection({
  prompts,
  brandSlug,
}: {
  prompts: PromptRow[];
  brandSlug: string;
}) {
  return (
    <motion.section variants={pageItem} className="mb-16">
      <SectionLabel
        index="02"
        title={`Takip Edilen Sorgular · ${prompts.length}`}
      />
      {prompts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Henüz aktif sorgu yok.{" "}
          <Link
            href={`/dashboard/${brandSlug}/insight`}
            className="underline hover:no-underline"
          >
            Insight&apos;a git
          </Link>
          .
        </p>
      ) : (
        <ol className="space-y-0">
          {prompts.map((p, idx) => (
            <li
              key={p.id}
              className="flex items-baseline gap-6 border-b border-border py-3 last:border-b-0"
            >
              <span className="text-label tabular-nums text-muted-foreground">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="text-sm tracking-tight">{p.text}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Sorgu düzenleme bonus slot sisteminde (Brief N) gelecek.
      </p>
    </motion.section>
  );
}

// ─── 03 · RAKİPLER ──────────────────────────────────────

function CompetitorsSection({
  competitors,
  brandSlug,
}: {
  competitors: CompetitorRow[];
  brandSlug: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!name.trim()) {
      setError("Rakip adı zorunlu");
      return;
    }
    const res = await fetch(`/api/brands/${brandSlug}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        domain: domain.trim() || undefined,
      }),
    });
    const data = (await res.json()) as { message?: string; error?: string };
    if (!res.ok) {
      setError(data.message ?? data.error ?? "Eklenemedi");
      return;
    }
    setName("");
    setDomain("");
    setAdding(false);
    startBusy(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("Bu rakibi silmek istiyor musun?")) return;
    setPendingId(id);
    const res = await fetch(
      `/api/brands/${brandSlug}/competitors/${id}`,
      { method: "DELETE" },
    );
    setPendingId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "Silinemedi");
      return;
    }
    startBusy(() => router.refresh());
  }

  return (
    <motion.section variants={pageItem} className="mb-16">
      <SectionLabel
        index="03"
        title={`Rakipler · ${competitors.length} / 10`}
      />
      {competitors.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz rakip yok.</p>
      ) : (
        <ul className="space-y-0">
          {competitors.map((c, idx) => (
            <li
              key={c.id}
              className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-baseline gap-6">
                <span className="text-label tabular-nums text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium tracking-tight">
                      {c.name}
                    </span>
                    {c.isPrimary && (
                      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                        Birincil
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.domain.endsWith(".placeholder") ? "URL yok" : c.domain}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(c.id)}
                disabled={pendingId === c.id || busy}
                className="text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
              >
                {pendingId === c.id ? "Siliniyor…" : "Sil"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="mt-4 space-y-3 rounded-lg border border-border p-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Rakip adı *
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-foreground/40 focus:outline-none"
              placeholder="Örn: Hak Enerji"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Website (opsiyonel)
            </label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-foreground/40 focus:outline-none"
              placeholder="Örn: hakenerji.com.tr"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={add}
              disabled={busy}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-60"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
                setName("");
                setDomain("");
              }}
              disabled={busy}
              className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-60"
            >
              Vazgeç
            </button>
          </div>
        </div>
      ) : (
        competitors.length < 10 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30"
          >
            + Rakip Ekle
          </button>
        )
      )}

      {error && <p className="mt-3 text-sm text-destructive">Hata: {error}</p>}
    </motion.section>
  );
}

// ─── 04 · TEHLİKELİ BÖLGE ──────────────────────────────

function DangerSection({ brand }: { brand: BrandSummary }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/brands/${brand.slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Silinemedi");
        return;
      }
      router.push("/dashboard/studio");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section variants={pageItem}>
      <SectionLabel index="04" title="Tehlikeli Bölge" />
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="mb-2 text-base font-semibold tracking-tight">
          Bu Markayı Sil
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Tüm taramalar, sorgular, rakipler, audit sonuçları ve advisor
          raporları birlikte silinir. Bu işlem geri alınamaz.
        </p>
        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-background px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Bu Markayı Sil
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs text-muted-foreground">
              Onaylamak için marka adını birebir yaz:{" "}
              <span className="font-medium text-foreground">{brand.name}</span>
            </label>
            <input
              autoFocus
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={brand.name}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-destructive/40 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={doDelete}
                disabled={busy || confirmName !== brand.name}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
              >
                {busy ? "Siliniyor…" : "Kalıcı Olarak Sil"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmName("");
                  setError(null);
                }}
                disabled={busy}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-60"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-destructive">Hata: {error}</p>}
      </div>
    </motion.section>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="text-label tabular-nums text-muted-foreground">
        {index}
      </span>
      <span className="text-label text-foreground">{title}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
