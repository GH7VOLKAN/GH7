"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  LockIcon,
  ChevronDownIcon,
  ClockIcon,
  ZapIcon,
  TargetIcon,
  ArrowRightIcon,
  UndoIcon,
  ShieldCheckIcon,
  SearchIcon,
  TrophyIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurredSection } from "@/components/ui/blurred-section";
import {
  markChecklistItemDone,
  resetChecklistItemStatus,
  seedChecklistItems,
} from "@/lib/actions";
import type { ChecklistData, ChecklistItemFull } from "@/lib/dal/checklist";
import type { TechnicalDetail } from "@/lib/checklist-defaults";

// ── Technical detail helpers ────────────────────────────

function hasTechnicalScope(detail: unknown): detail is TechnicalDetail {
  if (!detail || typeof detail !== "object") return false;
  const d = detail as Record<string, unknown>;
  return Array.isArray(d.scope) && d.scope.length > 0;
}

function TechnicalDetailSection({ detail }: { detail: TechnicalDetail }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t border-dashed border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDownIcon
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        />
        {open ? "Teknik detayi gizle" : "Teknik detay"}
      </button>

      {open && (
        <div className="mx-4 mb-4 rounded-lg border border-border bg-muted/30 p-4 space-y-3 font-mono">
          {/* Technical scope header */}
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground font-sans">
            Teknik Kapsam
          </p>

          {/* Scope bullet list */}
          <div className="space-y-1.5">
            {detail.scope.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/40" />
                <p className="text-[11px] leading-relaxed text-foreground/70">
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* Research note */}
          {detail.researchNote && (
            <div className="mt-3 border-t border-border/50 pt-3 font-sans">
              <p className="text-xs leading-relaxed text-foreground/60">
                {detail.researchNote}
              </p>
              {detail.researchSource && (
                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                  Kaynak: {detail.researchSource}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Layer icons ─────────────────────────────────────────
const LAYER_ICONS: Record<number, React.ElementType> = {
  1: SearchIcon,
  2: ShieldCheckIcon,
  3: TrophyIcon,
};

const LAYER_COLORS: Record<number, string> = {
  1: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
  2: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  3: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  EASY: { label: "Kolay", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  MEDIUM: { label: "Orta", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  HARD: { label: "Zor", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

const IMPACT_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: "Dusuk Etki", color: "text-muted-foreground" },
  MEDIUM: { label: "Orta Etki", color: "text-amber-600 dark:text-amber-400" },
  HIGH: { label: "Yuksek Etki", color: "text-emerald-600 dark:text-emerald-400" },
};

// ── Status icon ─────────────────────────────────────────
function StatusIcon({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "size-4" : "size-5";
  switch (status) {
    case "complete":
      return <CheckCircle2Icon className={`${cls} shrink-0 text-emerald-500`} />;
    case "warning":
      return <AlertTriangleIcon className={`${cls} shrink-0 text-amber-500`} />;
    case "locked":
      return <LockIcon className={`${cls} shrink-0 text-muted-foreground/40`} />;
    case "missing":
    default:
      return <XCircleIcon className={`${cls} shrink-0 text-red-400`} />;
  }
}

// ── Item card ───────────────────────────────────────────
function ChecklistItemCard({
  item,
  brandId,
  isExpanded,
  onToggle,
  plan,
}: {
  item: ChecklistItemFull;
  brandId: string;
  isExpanded: boolean;
  onToggle: () => void;
  plan: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const isLocked = item.status === "locked";
  const isComplete = item.status === "complete";
  const difficulty = DIFFICULTY_LABELS[item.difficulty] ?? DIFFICULTY_LABELS.MEDIUM;
  const impact = IMPACT_LABELS[item.impact] ?? IMPACT_LABELS.MEDIUM;

  async function handleMarkDone() {
    setLoading(true);
    try {
      await markChecklistItemDone(brandId, item.id);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await resetChecklistItemStatus(brandId, item.id);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        isComplete
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : isLocked
          ? "border-border/50 bg-muted/30 opacity-60"
          : "border-border bg-card hover:border-foreground/10"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
        disabled={isLocked}
      >
        <StatusIcon status={item.status} />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isComplete ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.simpleTitle}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${difficulty.color}`}
            >
              {difficulty.label}
            </span>
            <span className={`text-[10px] font-medium ${impact.color}`}>
              {impact.label}
            </span>
            {item.estimatedTime && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ClockIcon className="size-2.5" />
                {item.estimatedTime}
              </span>
            )}
          </div>
        </div>
        {!isLocked && (
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        )}
      </button>

      {/* Expanded content — iki katmanlı bilgi mimarisi */}
      {isExpanded && !isLocked && (
        <div className="border-t border-border/50">
          {/* ── ÜST KATMAN: Doktor abi ─────────────────── */}
          <div className="p-4 space-y-4">
            {/* Description — 3 saniyede anlaşılır */}
            <p className="text-sm leading-relaxed text-foreground/80">
              {item.simpleDescription}
            </p>

            {/* Competitor note — rakip motivasyonu */}
            {item.competitorNote && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <TrophyIcon className="size-4 shrink-0 text-amber-500 mt-0.5" />
                <p className="text-xs leading-relaxed text-foreground/80">
                  {item.competitorNote}
                </p>
              </div>
            )}

            {/* Kendin yap adımları */}
            {item.selfServiceSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Kendin Yap Adimlari
                </p>
                <div className="space-y-1.5">
                  {item.selfServiceSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[9px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-foreground/70">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isComplete ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                  className="gap-1.5"
                >
                  <UndoIcon className="size-3.5" />
                  {loading ? "Sifirlaniyor..." : "Sifirla"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleMarkDone}
                  disabled={loading}
                  className="gap-1.5"
                >
                  <CheckCircle2Icon className="size-3.5" />
                  {loading ? "Kaydediliyor..." : "Tamamlandi Isaretle"}
                </Button>
              )}

              {item.canAgencyDo && item.agencyPrice && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  render={<Link href="/dashboard/ayarlar" />}
                >
                  <ZapIcon className="size-3.5" />
                  Biz Yapalim — {item.agencyPrice}
                </Button>
              )}
            </div>
          </div>

          {/* ── ALT KATMAN: Teknik kişi ────────────────── */}
          {item.technicalDetail && hasTechnicalScope(item.technicalDetail) && (
            <TechnicalDetailSection detail={item.technicalDetail} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────
export function GelisimClient({
  brandId,
  plan,
  data,
}: {
  brandId: string;
  plan: string;
  data: ChecklistData;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  const [seeding, setSeeding] = React.useState(false);
  const isFree = plan === "free";

  // Auto-expand item from URL
  React.useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) setExpandedItem(itemParam);
  }, [searchParams]);

  // Empty state — no checklist items yet
  if (data.total === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-foreground/5">
            <TargetIcon className="size-8 text-foreground/60" />
          </div>
          <h2 className="text-lg font-bold">Gelisim Planini Baslat</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            AI gorunurlugunu adim adim artirmak icin kisisellestirilmis gelisim
            planini olustur. 15 kontrol noktasi ile nerelerde guclu, nerelerde
            zayif oldugunu gor.
          </p>
          <Button
            className="mt-6 gap-2"
            onClick={async () => {
              setSeeding(true);
              try {
                await seedChecklistItems(brandId, plan);
                router.refresh();
              } catch {
                // ignore
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding}
          >
            <TargetIcon className="size-4" />
            {seeding ? "Hazirlaniyor..." : "Gelisim Planini Olustur"}
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent =
    data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Gelisim Plani</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI gorunurlugunu 3 katmanda artirmak icin kontrol listesi.
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Toplam Ilerleme
          </p>
          <p className="text-sm font-bold tabular-nums">
            {data.completed}/{data.total}{" "}
            <span className="font-normal text-muted-foreground">
              (%{progressPercent})
            </span>
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" /> Tamamlandi
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-400" /> Eksik
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" /> Uyari
          </span>
          {isFree && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground/30" /> Kilitli
            </span>
          )}
        </div>
      </div>

      {/* Layer sections */}
      {data.layers.map((layer) => {
        const LayerIcon = LAYER_ICONS[layer.layer] ?? SearchIcon;
        const layerColor = LAYER_COLORS[layer.layer] ?? LAYER_COLORS[1];
        const isLayer3 = layer.layer === 3;
        const isLayerLocked = isFree && isLayer3;
        const layerProgress =
          layer.total > 0
            ? Math.round((layer.completed / layer.total) * 100)
            : 0;

        const layerContent = (
          <div className={`rounded-xl border bg-gradient-to-b ${layerColor} overflow-hidden`}>
            {/* Layer header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                  <LayerIcon className="size-4.5 text-foreground/70" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Katman {layer.layer}
                  </p>
                  <h2 className="text-sm font-bold">{layer.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums">
                  {layer.completed}/{layer.total}
                </p>
                <p className="text-[10px] text-muted-foreground">%{layerProgress}</p>
              </div>
            </div>

            {/* Layer progress bar */}
            <div className="px-5 pt-3 pb-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                <div
                  className="h-full rounded-full bg-foreground/60 transition-all duration-500"
                  style={{ width: `${layerProgress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="p-5 space-y-3">
              {layer.items.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  brandId={brandId}
                  plan={plan}
                  isExpanded={expandedItem === item.itemNumber}
                  onToggle={() =>
                    setExpandedItem(
                      expandedItem === item.itemNumber
                        ? null
                        : item.itemNumber,
                    )
                  }
                />
              ))}
            </div>
          </div>
        );

        if (isLayerLocked) {
          return (
            <BlurredSection
              key={layer.layer}
              isLocked={true}
              title="AI Seni Oneriyor mu?"
              description="Katman 3 kontrol noktalarini gormek ve tamamlamak icin Pro plana gecin."
            >
              {layerContent}
            </BlurredSection>
          );
        }

        return <React.Fragment key={layer.layer}>{layerContent}</React.Fragment>;
      })}

      {/* Bottom CTA for free users */}
      {isFree && (
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
          <p className="text-lg font-bold">Tum Kontrol Noktalarini Ac</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Katman 3 (Oneri) kontrol noktalarini tamamlayarak AI gorunurlugunu
            maksimuma cikar.
          </p>
          <Link
            href="/dashboard/ayarlar"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Pro ile Basla
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
