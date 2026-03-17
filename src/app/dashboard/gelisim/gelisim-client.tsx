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
  BellIcon,
  CalendarIcon,
  PackageIcon,
} from "lucide-react";
import {
  markChecklistItemDone,
  resetChecklistItemStatus,
  seedChecklistItems,
  setChecklistReminder,
} from "@/lib/actions";
import type { ChecklistData, ChecklistItemFull } from "@/lib/dal/checklist";
import type { TechnicalDetail } from "@/lib/checklist-defaults";
import { HeroSection } from "@/components/kinde/hero-section";
import {
  FadeIn,
  Stagger,
  AnimBar,
  PageSection,
  SectionTitle,
} from "@/components/kinde/animations";

// ── Technical detail helpers ────────────────────────────

function hasTechnicalScope(detail: unknown): detail is TechnicalDetail {
  if (!detail || typeof detail !== "object") return false;
  const d = detail as Record<string, unknown>;
  return Array.isArray(d.scope) && d.scope.length > 0;
}

function TechnicalDetailSection({ detail }: { detail: TechnicalDetail }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ borderTop: "1px dashed #eee" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 0",
          fontSize: 12,
          fontWeight: 500,
          color: "#999",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <ChevronDownIcon
          style={{
            width: 14,
            height: 14,
            transition: "transform 0.2s",
            transform: open ? "rotate(0)" : "rotate(-90deg)",
          }}
        />
        {open ? "Teknik detayi gizle" : "Teknik detay"}
      </button>

      {open && (
        <div
          style={{
            margin: "0 16px 16px",
            borderRadius: 12,
            border: "1px solid #eee",
            background: "#fafafa",
            padding: 16,
            fontFamily: "monospace",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#999",
              fontFamily: "inherit",
              marginBottom: 12,
            }}
          >
            Teknik Kapsam
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {detail.scope.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span
                  style={{
                    marginTop: 6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#bbb",
                    flexShrink: 0,
                  }}
                />
                <p style={{ fontSize: 11, lineHeight: 1.6, color: "#666" }}>{item}</p>
              </div>
            ))}
          </div>

          {detail.researchNote && (
            <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#777" }}>
                {detail.researchNote}
              </p>
              {detail.researchSource && (
                <p style={{ marginTop: 6, fontSize: 10, color: "#aaa" }}>
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

const DIFFICULTY_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
  EASY: { label: "Kolay", bg: "#ecfdf5", fg: "#059669" },
  MEDIUM: { label: "Orta", bg: "#fffbeb", fg: "#d97706" },
  HARD: { label: "Zor", bg: "#fef2f2", fg: "#dc2626" },
};

const IMPACT_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: "Dusuk Etki", color: "#999" },
  MEDIUM: { label: "Orta Etki", color: "#d97706" },
  HIGH: { label: "Yuksek Etki", color: "#059669" },
};

// ── "Pro ile AI rehber al" — Opus on-demand DIY rehber ────
interface DiyGuide {
  title: string;
  estimatedTime: string;
  difficulty: string;
  steps: Array<{ stepNumber: number; title: string; description: string; tip: string | null }>;
  completionMessage: string;
}

function DiyGuideSection({
  brandId,
  itemId,
  fallbackSteps,
  plan,
}: {
  brandId: string;
  itemId: string;
  fallbackSteps: string[];
  plan: string;
}) {
  const [guide, setGuide] = React.useState<DiyGuide | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showFallback, setShowFallback] = React.useState(false);
  const isPro = plan !== "free";

  async function fetchGuide() {
    setLoading(true);
    try {
      const res = await fetch("/api/checklist/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, checklistItemId: itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuide(data.guide);
      } else {
        setShowFallback(true);
      }
    } catch {
      setShowFallback(true);
    } finally {
      setLoading(false);
    }
  }

  // AI rehber loaded
  if (guide) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: "1px solid #dbeafe",
          background: "#eff6ff",
          padding: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{guide.title}</p>
          <span style={{ fontSize: 10, color: "#999" }}>
            {guide.estimatedTime} &bull; {guide.difficulty}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {guide.steps.map((step) => (
            <div key={step.stepNumber} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#1d4ed8",
                  flexShrink: 0,
                }}
              >
                {step.stepNumber}
              </span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500 }}>{step.title}</p>
                <p style={{ fontSize: 11, lineHeight: 1.6, color: "#666" }}>{step.description}</p>
                {step.tip && (
                  <p style={{ marginTop: 2, fontSize: 10, fontStyle: "italic", color: "#2563eb" }}>
                    {step.tip}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {guide.completionMessage && (
          <p style={{ fontSize: 11, color: "#999", fontStyle: "italic", marginTop: 8 }}>
            {guide.completionMessage}
          </p>
        )}
      </div>
    );
  }

  // Fallback: static steps
  if (showFallback && fallbackSteps.length > 0) {
    return (
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#999",
            marginBottom: 8,
          }}
        >
          Kendin Yap Adimlari
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {fallbackSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span
                style={{
                  marginTop: 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#999",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#666" }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Button to trigger
  if (isPro) {
    return (
      <button
        onClick={fetchGuide}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 12,
          border: "1px solid #dbeafe",
          background: "#eff6ff",
          color: "#1d4ed8",
          padding: "8px 12px",
          fontSize: 12,
          fontWeight: 500,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <ArrowRightIcon style={{ width: 14, height: 14 }} />
        {loading ? "Rehber hazirlaniyor..." : "Adim adim yapayim"}
      </button>
    );
  }

  // Free user: link to settings for Pro
  return (
    <Link
      href="/dashboard/ayarlar"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 9999,
        border: "1px solid #eee",
        background: "#fafafa",
        color: "#666",
        padding: "8px 16px",
        fontSize: 12,
        fontWeight: 500,
        textDecoration: "none",
      }}
    >
      <ArrowRightIcon style={{ width: 14, height: 14 }} />
      Pro ile AI rehber al
    </Link>
  );
}

// ── Status icon ─────────────────────────────────────────
function StatusIcon({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? 16 : 20;
  switch (status) {
    case "complete":
      return <CheckCircle2Icon style={{ width: s, height: s, color: "#10b981", flexShrink: 0 }} />;
    case "warning":
      return <AlertTriangleIcon style={{ width: s, height: s, color: "#f59e0b", flexShrink: 0 }} />;
    case "locked":
      return <LockIcon style={{ width: s, height: s, color: "#ccc", flexShrink: 0 }} />;
    case "missing":
    default:
      return <XCircleIcon style={{ width: s, height: s, color: "#f87171", flexShrink: 0 }} />;
  }
}

// ── Completion status ────────────────────────────────────
function CompletionStatus({ item }: { item: ChecklistItemFull }) {
  if (item.verifiedByAI) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 12,
            border: "1px solid #d1fae5",
            background: "#ecfdf5",
            padding: "8px 12px",
            fontSize: 12,
          }}
        >
          <ShieldCheckIcon style={{ width: 14, height: 14, color: "#10b981" }} />
          <span style={{ color: "#059669" }}>Yapay zeka tarafindan dogrulandi</span>
          {item.completedAt && (
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#6ee7b7" }}>
              {new Date(item.completedAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {item.verificationNote && (
          <p style={{ fontSize: 11, lineHeight: 1.6, color: "#059669", paddingLeft: 4, marginTop: 8 }}>
            {item.verificationNote}
          </p>
        )}
      </div>
    );
  }

  const completedDate = item.completedAt ? new Date(item.completedAt) : new Date();
  const nextVerification = getNextScanDate(completedDate);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <CheckCircle2Icon style={{ width: 14, height: 14, color: "#3b82f6" }} />
        <span style={{ color: "#1d4ed8", fontWeight: 500 }}>Tamamlandi olarak isaretledin</span>
      </div>
      <p style={{ marginTop: 4, fontSize: 11, color: "#60a5fa", paddingLeft: 22 }}>
        Sonraki taramada yapay zeka dogrulayacak.{" "}
        <span style={{ fontWeight: 500 }}>
          Test tarihi:{" "}
          {nextVerification.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </p>
    </div>
  );
}

function getNextScanDate(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  const scanDays = [1, 3, 5];
  while (!scanDays.includes(d.getDay())) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// ── Reminder section ────────────────────────────────────
function ReminderSection({
  brandId,
  itemId,
  currentReminder,
}: {
  brandId: string;
  itemId: string;
  currentReminder: string | null;
}) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  const hasReminder = !!currentReminder;
  const reminderDate = currentReminder ? new Date(currentReminder) : null;
  const isPast = reminderDate ? reminderDate < new Date() : false;

  async function handleSetReminder(date: string) {
    setSaving(true);
    try {
      await setChecklistReminder(brandId, itemId, date);
      router.refresh();
      setShowPicker(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleClearReminder() {
    setSaving(true);
    try {
      await setChecklistReminder(brandId, itemId, null);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  const quickOptions = [
    { label: "Yarin", days: 1 },
    { label: "3 gun sonra", days: 3 },
    { label: "1 hafta sonra", days: 7 },
    { label: "2 hafta sonra", days: 14 },
  ];

  if (hasReminder && !showPicker) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 12,
          border: `1px solid ${isPast ? "#fde68a" : "#dbeafe"}`,
          background: isPast ? "#fffbeb" : "#eff6ff",
          padding: "8px 12px",
          fontSize: 12,
        }}
      >
        <BellIcon style={{ width: 14, height: 14, color: isPast ? "#f59e0b" : "#3b82f6" }} />
        <span style={{ color: isPast ? "#b45309" : "#1d4ed8" }}>
          {isPast ? "Hatirlatici gecti: " : "Hatirlatici: "}
          {reminderDate!.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
        </span>
        <button
          onClick={handleClearReminder}
          disabled={saving}
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "#999",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "..." : "Kaldir"}
        </button>
      </div>
    );
  }

  if (showPicker) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#fafafa",
          padding: 12,
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Ne zaman hatirlatayim?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {quickOptions.map((opt) => {
            const date = new Date();
            date.setDate(date.getDate() + opt.days);
            return (
              <button
                key={opt.days}
                onClick={() => handleSetReminder(date.toISOString())}
                disabled={saving}
                style={{
                  borderRadius: 9999,
                  border: "1px solid #eee",
                  background: "white",
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowPicker(false)}
          style={{
            marginTop: 8,
            fontSize: 10,
            color: "#999",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Iptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowPicker(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "#999",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      <CalendarIcon style={{ width: 14, height: 14 }} />
      Hatirlatici kur
    </button>
  );
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
      className="kinde-card"
      style={{
        opacity: isLocked ? 0.5 : 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        disabled={isLocked}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 12,
          padding: 16,
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: isLocked ? "default" : "pointer",
        }}
      >
        <StatusIcon status={item.status} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
              textDecoration: isComplete ? "line-through" : "none",
              opacity: isComplete ? 0.6 : 1,
            }}
          >
            {item.simpleTitle}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                borderRadius: 6,
                padding: "2px 6px",
                fontSize: 10,
                fontWeight: 600,
                background: difficulty.bg,
                color: difficulty.fg,
              }}
            >
              {difficulty.label}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: impact.color }}>
              {impact.label}
            </span>
            <span style={{ fontSize: 10, color: "#999" }} title={`Yapilabilirlik: ${item.feasibilityScore}/5`}>
              {"●".repeat(item.feasibilityScore)}
              {"○".repeat(5 - item.feasibilityScore)}
            </span>
            {item.estimatedTime && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#999" }}>
                <ClockIcon style={{ width: 10, height: 10 }} />
                {item.estimatedTime}
              </span>
            )}
          </div>
        </div>
        {!isLocked && (
          <ChevronDownIcon
            style={{
              width: 16,
              height: 16,
              color: "#999",
              transition: "transform 0.2s",
              transform: isExpanded ? "rotate(0)" : "rotate(-90deg)",
            }}
          />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && !isLocked && (
        <div style={{ borderTop: "1px solid #eee" }}>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Description */}
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#555" }}>
              {item.simpleDescription}
            </p>

            {/* Competitor note */}
            {item.competitorNote && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  borderRadius: 12,
                  border: "1px solid #fde68a",
                  background: "#fffbeb",
                  padding: 12,
                }}
              >
                <TrophyIcon style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#555" }}>
                  {item.competitorNote}
                </p>
              </div>
            )}

            {/* DIY Guide */}
            <DiyGuideSection
              brandId={brandId}
              itemId={item.id}
              fallbackSteps={item.selfServiceSteps}
              plan={plan}
            />

            {/* Completed confirmation */}
            {isComplete && <CompletionStatus item={item} />}

            {/* Reminder */}
            {!isComplete && (
              <ReminderSection
                brandId={brandId}
                itemId={item.id}
                currentReminder={item.reminderDate}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 4 }}>
              {isComplete ? (
                <button
                  onClick={handleReset}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 9999,
                    border: "1px solid #eee",
                    background: "white",
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <UndoIcon style={{ width: 14, height: 14 }} />
                  {loading ? "Sifirlaniyor..." : "Sifirla"}
                </button>
              ) : (
                <button
                  onClick={handleMarkDone}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 9999,
                    background: "var(--foreground)",
                    color: "var(--background)",
                    border: "none",
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle2Icon style={{ width: 14, height: 14 }} />
                  {loading ? "Kaydediliyor..." : "Tamamladim"}
                </button>
              )}

              {/* Agency service promotion button */}
              <Link
                href="/dashboard/paketler"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 9999,
                  border: "1px solid #eee",
                  background: "white",
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--foreground)",
                  textDecoration: "none",
                }}
              >
                <ZapIcon style={{ width: 14, height: 14 }} />
                Bu adimi biz yapalim
              </Link>
            </div>
          </div>

          {/* Technical detail */}
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
  const [sortMode, setSortMode] = React.useState<"default" | "easy" | "impact">("default");
  const [seeding, setSeeding] = React.useState(false);
  const isFree = plan === "free";

  // Auto-expand item from URL
  React.useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) setExpandedItem(itemParam);
  }, [searchParams]);

  // ── Empty state ──────────────────────────────────────
  if (data.total === 0) {
    return (
      <div style={{ padding: "0 16px" }}>
        <div
          className="kinde-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            textAlign: "center",
            maxWidth: 500,
            margin: "40px auto",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <TargetIcon style={{ width: 32, height: 32, color: "#999" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Gelisim Planini Baslat</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: "#999", maxWidth: 400 }}>
            Yapay zeka gorunurlugunu adim adim artirmak icin kisisellestirilmis gelisim
            planini olustur. 15 kontrol noktasi ile nerelerde guclu, nerelerde
            zayif oldugunu gor.
          </p>
          <button
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
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 9999,
              background: "var(--foreground)",
              color: "var(--background)",
              border: "none",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <TargetIcon style={{ width: 16, height: 16 }} />
            {seeding ? "Hazirlaniyor..." : "Gelisim Planini Olustur"}
          </button>
        </div>
      </div>
    );
  }

  const progressPercent =
    data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── HERO SECTION ─────────────────────────────── */}
      <HeroSection
        label="GELİŞİM PLANI"
        title={`${data.total} adimda yapay zekada\ngorunur ol`}
        subtitle={`3 katmanda yapay zeka gorunurlugunu artirmak icin kontrol listesi.`}
      >
        {/* Animated counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", color: "var(--foreground)" }}>
              {data.completed}
              <span style={{ fontSize: 16, fontWeight: 500, color: "#999" }}>/{data.total}</span>
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>tamamlandi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", color: "var(--foreground)" }}>
              %{progressPercent}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>ilerleme</div>
          </div>
        </div>

        {/* Animated progress bar */}
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <AnimBar percent={progressPercent} color="#111" height={10} />
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 12,
            fontSize: 11,
            color: "#999",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} /> Tamamlandi
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} /> Eksik
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} /> Uyari
          </span>
          {isFree && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ddd" }} /> Kilitli
            </span>
          )}
        </div>
      </HeroSection>

      {/* ── CONTENT AREA ──────────────────────────────── */}
      <div style={{ padding: "0 16px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        {/* Sort toggle — pill buttons */}
        <PageSection>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: "#999" }}>Sirala:</span>
            {(["default", "easy", "impact"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                style={{
                  borderRadius: 9999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  background: sortMode === mode ? "var(--foreground)" : "#f3f4f6",
                  color: sortMode === mode ? "var(--background)" : "#666",
                  transition: "all 0.2s",
                }}
              >
                {mode === "default" ? "Varsayilan" : mode === "easy" ? "Kolay olanlar once" : "Etkili olanlar once"}
              </button>
            ))}
          </div>
        </PageSection>

        {/* ── Layer sections ──────────────────────────── */}
        {data.layers.map((layer, layerIdx) => {
          const LayerIcon = LAYER_ICONS[layer.layer] ?? SearchIcon;
          const layerProgress =
            layer.total > 0 ? Math.round((layer.completed / layer.total) * 100) : 0;

          return (
            <PageSection key={layer.layer} className="mb-8">
              <FadeIn delay={layerIdx * 100}>
                {/* Section title + progress */}
                <SectionTitle
                  title={`Katman ${layer.layer}: ${layer.name}`}
                  subtitle={`${layer.completed}/${layer.total} tamamlandi`}
                />

                {/* Layer progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <AnimBar
                    percent={layerProgress}
                    color="#111"
                    height={6}
                    delay={layerIdx * 150}
                  />
                </div>

                {/* Items */}
                <Stagger className="flex flex-col gap-3">
                  {[...layer.items]
                    .sort((a, b) => {
                      if (sortMode === "easy") return b.feasibilityScore - a.feasibilityScore;
                      if (sortMode === "impact") {
                        const impactOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                        return (impactOrder[b.impact] ?? 0) - (impactOrder[a.impact] ?? 0);
                      }
                      return 0;
                    })
                    .map((item) => (
                      <ChecklistItemCard
                        key={item.id}
                        item={item}
                        brandId={brandId}
                        plan={plan}
                        isExpanded={expandedItem === item.itemNumber}
                        onToggle={() =>
                          setExpandedItem(
                            expandedItem === item.itemNumber ? null : item.itemNumber,
                          )
                        }
                      />
                    ))}
                </Stagger>
              </FadeIn>
            </PageSection>
          );
        })}

        {/* ── Bottom CTA: Agency packages ─────────────── */}
        <PageSection className="mb-12">
          <FadeIn>
            <div
              className="kinde-card"
              style={{
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <PackageIcon style={{ width: 32, height: 32, color: "#999", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>
                Hepsini biz yapalim
              </p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: "#999",
                  maxWidth: 440,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.6,
                }}
              >
                Gelisim planindaki adimlari tek tek ugrasmak yerine, ajans paketlerimizle hepsini profesyonelce tamamlayalim.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
                <Link
                  href="/dashboard/paketler"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 9999,
                    background: "var(--foreground)",
                    color: "var(--background)",
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "transform 0.15s",
                  }}
                >
                  Ajans paketlerini incele
                  <ArrowRightIcon style={{ width: 16, height: 16 }} />
                </Link>
                {isFree && (
                  <Link
                    href="/dashboard/ayarlar"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 9999,
                      border: "1px solid #eee",
                      background: "white",
                      color: "var(--foreground)",
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Pro ile devam et
                  </Link>
                )}
              </div>
            </div>
          </FadeIn>
        </PageSection>
      </div>
    </div>
  );
}
