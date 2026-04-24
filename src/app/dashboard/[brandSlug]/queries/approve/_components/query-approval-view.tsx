"use client";

/**
 * QueryApprovalView — Brief N v4 Aşama 7 sorgu onay ekranı.
 *
 * Akış:
 *   1. Sayfa açılır → state = "idle"
 *   2. Kullanıcı "Sorguları Üret" bastığında → POST /api/tracked-queries/generate
 *      → state = "review"
 *   3. Kullanıcı 10 niş + 10 kategori funnel'ı düzenleyebilir
 *   4. "Onayla ve Başlat" → POST /api/tracked-queries/approve
 *      → başarılıysa /dashboard/[slug]'a redirect
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";

type NicheDraft = { query: string; rationale: string };
type CategoryDraft = {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  orderIndex: number;
  step1: string;
  step2: string;
  step3: string;
  rationale: string;
};

type Props = {
  brand: { slug: string; name: string };
  hasExistingQueries: boolean;
};

export function QueryApprovalView({ brand, hasExistingQueries }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "generating" | "review" | "saving">(
    "idle",
  );
  const [niche, setNiche] = useState<NicheDraft[]>([]);
  const [category, setCategory] = useState<CategoryDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<number | null>(null);

  async function generate() {
    setError(null);
    setState("generating");
    try {
      const res = await fetch("/api/tracked-queries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandSlug: brand.slug }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        niche?: NicheDraft[];
        category?: CategoryDraft[];
        cost?: { totalUsd: number };
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.niche || !data.category) {
        setError(data.message ?? data.error ?? "Üretim başarısız");
        setState("idle");
        return;
      }
      setNiche(data.niche);
      setCategory(data.category);
      setCost(data.cost?.totalUsd ?? null);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("idle");
    }
  }

  async function approve() {
    setError(null);
    setState("saving");
    try {
      const res = await fetch("/api/tracked-queries/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandSlug: brand.slug,
          niche,
          category,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Kaydedilemedi");
        setState("review");
        return;
      }
      router.push(`/dashboard/${brand.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("review");
    }
  }

  // State 1: idle — üretim başlatma ekranı
  if (state === "idle" || state === "generating") {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">
            GH7 · Sorgu Onayı
          </div>
          <h1 className="text-h1">
            {hasExistingQueries
              ? "Sorguları Yeniden Üret"
              : "Takip Edilecek Sorguları Hazırla"}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {brand.name} için 10 niş bilinirlik sorgusu ve 10 kategori
            hakimiyeti funnel'ı üreteceğiz. Onayından sonra her hafta 5 AI
            platformunda test edilirler.
            {hasExistingQueries && (
              <>
                {" "}
                Yeniden üretim mevcut sorguları arşivleyip yenilerini açar —
                geçmiş tarama verisi korunur.
              </>
            )}
          </p>

          <div className="rounded-xl border border-border bg-muted/30 p-6 text-sm">
            <p className="mb-3 font-medium text-foreground">Ne üretilir?</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  10 niş sorgu
                </span>{" "}
                — spesifik, kullanıcı-özel sorular (binary: var/yok skorlama)
              </li>
              <li>
                <span className="font-medium text-foreground">
                  10 kategori funnel
                </span>{" "}
                — 3-adım drilling: geniş → bölge → niş (sıralama puanı)
              </li>
            </ul>
          </div>

          <button
            onClick={generate}
            disabled={state === "generating"}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {state === "generating" ? "Üretiliyor…" : "Sorguları Üret →"}
          </button>

          {state === "generating" && (
            <p className="text-xs text-muted-foreground">
              Tahmini süre: 30-60 saniye
            </p>
          )}

          {error && <p className="text-sm text-destructive">Hata: {error}</p>}

          <Link
            href={`/dashboard/${brand.slug}`}
            className="inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // State 2: review — taslakları göster + düzenle
  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-16"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-12">
        <div className="text-label text-muted-foreground mb-4">
          GH7 · Sorgu Onayı
        </div>
        <h1 className="text-h1 mb-4">Sorguları Gözden Geçir</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {brand.name} için {niche.length} niş + {category.length} kategori
          funnel hazır. Her sorguyu inline düzenleyebilirsin. Onayladığında
          sorgular kilitlenir ve haftalık takip başlar.
          {cost && (
            <>
              {" "}
              <span className="text-muted-foreground/80">
                (Üretim maliyeti: ${cost.toFixed(4)})
              </span>
            </>
          )}
        </p>
      </motion.div>

      {/* NİŞ */}
      <motion.section variants={pageItem} className="mb-12">
        <SectionHeading label={`Niş Bilinirlik · ${niche.length}`} />
        <div className="space-y-0">
          {niche.map((q, idx) => (
            <NicheRow
              key={idx}
              index={idx + 1}
              query={q.query}
              rationale={q.rationale}
              onQueryChange={(v) => {
                setNiche((arr) =>
                  arr.map((n, i) => (i === idx ? { ...n, query: v } : n)),
                );
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* KATEGORİ */}
      <motion.section variants={pageItem} className="mb-12">
        <SectionHeading label={`Kategori Hakimiyeti · ${category.length}`} />
        <div className="space-y-4">
          {category.map((q, idx) => (
            <CategoryRow
              key={idx}
              index={idx + 1}
              difficulty={q.difficulty}
              step1={q.step1}
              step2={q.step2}
              step3={q.step3}
              rationale={q.rationale}
              onChange={(patch) => {
                setCategory((arr) =>
                  arr.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
                );
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* ONAY */}
      <motion.div
        variants={pageItem}
        className="flex flex-wrap items-center gap-3 border-t border-border pt-8"
      >
        <button
          onClick={approve}
          disabled={state === "saving"}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
        >
          {state === "saving" ? "Kaydediliyor…" : "Onayla ve Başlat →"}
        </button>
        <button
          onClick={generate}
          disabled={state === "saving"}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30 disabled:opacity-60"
        >
          Yeniden Üret
        </button>
        {error && <span className="text-sm text-destructive">Hata: {error}</span>}
      </motion.div>
      <p className="mt-3 text-xs text-muted-foreground">
        Onayladığında niş sorgular hemen aktifleşir. Kategori sorgular sağlık
        skorun %50'yi geçince açılır (eşik sistemi).
      </p>
    </motion.div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="text-label text-muted-foreground">{label}</div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function NicheRow({
  index,
  query,
  rationale,
  onQueryChange,
}: {
  index: number;
  query: string;
  rationale: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-baseline gap-4">
        <span className="text-label tabular-nums text-muted-foreground shrink-0">
          {String(index).padStart(2, "0")}
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-base font-medium tracking-tight focus:border-border focus:bg-background focus:outline-none"
        />
      </div>
      {rationale && (
        <p className="ml-10 mt-1 text-xs text-muted-foreground">{rationale}</p>
      )}
    </div>
  );
}

function CategoryRow({
  index,
  difficulty,
  step1,
  step2,
  step3,
  rationale,
  onChange,
}: {
  index: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  step1: string;
  step2: string;
  step3: string;
  rationale: string;
  onChange: (patch: Partial<CategoryDraft>) => void;
}) {
  const diffLabel = {
    EASY: "Kolay",
    MEDIUM: "Orta",
    HARD: "Zor",
  }[difficulty];

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-label tabular-nums text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <span className="rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {diffLabel}
        </span>
      </div>

      <div className="space-y-2">
        <StepInput
          label="Step 1"
          sublabel="Geniş kategori"
          value={step1}
          onChange={(v) => onChange({ step1: v })}
        />
        <StepInput
          label="Step 2"
          sublabel="Coğrafi daraltma"
          value={step2}
          onChange={(v) => onChange({ step2: v })}
        />
        <StepInput
          label="Step 3"
          sublabel="Niş özellik"
          value={step3}
          onChange={(v) => onChange({ step3: v })}
        />
      </div>

      {rationale && (
        <p className="mt-3 text-xs text-muted-foreground">{rationale}</p>
      )}
    </div>
  );
}

function StepInput({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <div className="w-20 shrink-0">
        <div className="text-label text-muted-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground/70">{sublabel}</div>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm tracking-tight focus:border-border focus:bg-background focus:outline-none"
      />
    </div>
  );
}
