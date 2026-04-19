"use client";

import Link from "next/link";
import { FadeIn } from "./animations";
import { PLAN_PRICES } from "@/lib/iyzico/plans";

/**
 * DualCTA — (artık tekli) Free kullanıcıya sade Pro CTA'sı.
 *
 * Eski sürüm: "Kendim takip / Siz çözün" ikili kartlar + "Sizi Arayalım"
 * popup + ₺2.495 fiyatı + 0850 telefon. Hepsi kaldırıldı (v3 spec).
 *
 * API aynı kalır, sadece içerik değişti — geriye dönük uyum.
 */

interface DualCTAProps {
  contextMessage?: string;
  platformCount?: number;
  plan?: string;
}

export function DualCTA({ contextMessage, plan }: DualCTAProps) {
  // Don't render for paid users
  if (plan && plan !== "free") return null;

  return (
    <FadeIn>
      <div className="mt-12">
        {contextMessage && (
          <p
            style={{
              fontSize: 14,
              color: "var(--muted-foreground)",
              textAlign: "center",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {contextMessage}
          </p>
        )}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E8E8",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#000",
              marginBottom: 12,
            }}
          >
            Haftalık otomatik takip, tam AI yanıtları, aksiyon planı.
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Pro plan ile her hafta markanızın AI görünürlüğü otomatik taranır,
            rakip karşılaştırmaları ve detaylı raporlarla beraber e-postanıza
            düşer.
          </p>
          <Link
            href="/panel/abonelik"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 28px",
              background: "#000",
              color: "#fff",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Pro&apos;ya Geç · ₺{PLAN_PRICES.pro.monthly}/ay
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
