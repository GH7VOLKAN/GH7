"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CheckStatus } from "@/lib/types";
import { createActionFromAuditCheck } from "@/lib/actions";
import { toast } from "sonner";
import { ChevronDownIcon } from "lucide-react";

interface AuditCheck {
  id: string;
  label: string;
  status: CheckStatus;
  score: number;
  maxScore: number;
  detail: string | null;
  recommendation: string | null;
  raasEligible: boolean;
}

interface AuditCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  checks: AuditCheck[];
}

interface AuditCategoriesProps {
  auditCategories: AuditCategory[];
  brandId: string;
}

const statusConfig: Record<CheckStatus, { icon: string; color: string; bg: string; rowBg: string }> = {
  pass: {
    icon: "✓",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/40",
    rowBg: "",
  },
  partial: {
    icon: "⚠",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    rowBg: "",
  },
  fail: {
    icon: "✗",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/40",
    rowBg: "bg-red-50/50 dark:bg-red-950/20",
  },
};

export function AuditCategories({ auditCategories, brandId }: AuditCategoriesProps) {
  const [isPending, startTransition] = useTransition();
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  function toggleCheck(checkId: string) {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(checkId)) {
        next.delete(checkId);
      } else {
        next.add(checkId);
      }
      return next;
    });
  }

  function handleAddAction(check: AuditCheck) {
    startTransition(async () => {
      const result = await createActionFromAuditCheck(brandId, {
        label: check.label,
        recommendation: check.recommendation ?? "",
        raasEligible: check.raasEligible,
      });
      if (result.duplicate) {
        toast.info("Bu kontrol zaten aksiyon planında.");
      } else {
        toast.success("Aksiyon planına eklendi.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {auditCategories.map((cat) => {
        const passCount = cat.checks.filter((c) => c.status === "pass").length;

        return (
          <Card key={cat.id} className="border border-border/50 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base">
                {cat.name}
                <Badge
                  variant="outline"
                  className={
                    passCount === cat.checks.length
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
                      : "text-muted-foreground"
                  }
                >
                  {passCount}/{cat.checks.length} kontrol geçti
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border rounded-xl border">
                {cat.checks.map((check) => {
                  const config = statusConfig[check.status];
                  const isExpanded = expandedChecks.has(check.id);
                  const hasExpandContent = check.detail || check.recommendation;

                  return (
                    <li key={check.id} className={config.rowBg}>
                      {/* Check row */}
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => hasExpandContent && toggleCheck(check.id)}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.bg} ${config.color}`}
                        >
                          {config.icon}
                        </span>
                        <span className="flex-1 text-sm font-medium">{check.label}</span>
                        {hasExpandContent && (
                          <ChevronDownIcon
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Expanded content */}
                      {isExpanded && hasExpandContent && (
                        <div className="border-t bg-muted/30 px-4 py-3 pl-13">
                          {check.detail && (
                            <p className="text-sm text-muted-foreground">{check.detail}</p>
                          )}
                          {check.recommendation && (
                            <p className="mt-1.5 text-sm">
                              <span className="font-medium">Öneri:</span>{" "}
                              {check.recommendation}
                            </p>
                          )}
                          <div className="mt-3 flex gap-2">
                            {check.raasEligible ? (
                              <Button
                                size="sm"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddAction(check);
                                }}
                              >
                                Biz Uygulayalım
                              </Button>
                            ) : check.recommendation ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddAction(check);
                                }}
                              >
                                Aksiyona Ekle
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
