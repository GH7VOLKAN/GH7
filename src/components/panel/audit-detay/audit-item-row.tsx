"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { PLAN_PRICES } from "@/lib/iyzico/plans";
import { isPro } from "@/lib/plans";
import type { AuditItemResult } from "@/lib/ai/audit-43";

interface Props {
  item: AuditItemResult;
  plan: string;
  // Optional: self-service steps + agency price from checklist-defaults
  selfServiceSteps?: string[];
  agencyPrice?: string | null;
  estimatedTime?: string;
}

function StatusIcon({ status }: { status: AuditItemResult["status"] }) {
  if (status === "pass") return <CheckCircle2 className="size-4 text-green-600" />;
  if (status === "partial") return <AlertTriangle className="size-4 text-yellow-600" />;
  return <XCircle className="size-4 text-red-600" />;
}

export function AuditItemRow({
  item,
  plan,
  selfServiceSteps,
  agencyPrice,
  estimatedTime,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasPlan = isPro(plan);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Status + label */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <StatusIcon status={item.status} />
          <span className="truncate text-sm font-medium text-gray-900">
            {item.label}
          </span>
        </div>

        {/* Values */}
        <div className="flex items-center gap-4 text-xs">
          <div className="whitespace-nowrap text-gray-600">
            <span className="text-gray-400">Siz:</span>{" "}
            <span className="font-semibold text-gray-900">
              {item.value ?? "—"}
            </span>
          </div>
          <div className="whitespace-nowrap text-gray-600">
            <span className="text-gray-400">Rakip:</span>{" "}
            <span className="font-semibold text-gray-900">
              {item.competitorValue ?? "—"}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="shrink-0">
          {hasPlan ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Ne yapmalıyım?
              <ChevronDown
                className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          ) : (
            <Link
              href="/panel/abonelik"
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title={`Eylem planı Pro ile açılır · ₺${PLAN_PRICES.pro.monthly}/ay`}
            >
              <Lock className="size-3" />
              Ne yapmalıyım?
            </Link>
          )}
        </div>
      </div>

      {/* Expanded pro content */}
      {hasPlan && expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          {item.recommendation && (
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              {item.recommendation}
            </p>
          )}

          {selfServiceSteps && selfServiceSteps.length > 0 && (
            <div className="mb-3">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Kendin yap
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {selfServiceSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gray-400" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              {estimatedTime && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Tahmini süre: {estimatedTime}
                </p>
              )}
            </div>
          )}

          {agencyPrice && (
            <Link
              href="/panel/hizmetler"
              className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Hizmet al · {agencyPrice}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
