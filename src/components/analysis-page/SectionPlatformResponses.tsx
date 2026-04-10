"use client";

import { useState } from "react";
import type { PlatformKey } from "@/lib/types";
import { platformLabels } from "@/lib/types";

interface PlatformResponseData {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  response: string;
  firmsMentioned: string[];
  sourceCount: number;
}

interface SectionPlatformResponsesProps {
  responses: PlatformResponseData[];
}

export function SectionPlatformResponses({
  responses,
}: SectionPlatformResponsesProps) {
  const [openPlatform, setOpenPlatform] = useState<string | null>(null);

  if (responses.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Platform Yanitlari
      </h2>
      <div className="space-y-2">
        {responses.map((resp) => {
          const isOpen = openPlatform === resp.platform;
          const label = platformLabels[resp.platform]?.name ?? resp.platform;

          return (
            <div
              key={resp.platform}
              className="rounded-md border border-border"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenPlatform(isOpen ? null : resp.platform)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {label}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      resp.mentioned ? "bg-foreground" : "bg-border"
                    }`}
                  />
                  {resp.sentiment && (
                    <span className="text-xs text-muted-foreground">
                      {resp.sentiment}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {resp.firmsMentioned.length} firma, {resp.sourceCount} kaynak
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-4">
                  {resp.position && (
                    <p className="mb-2 text-sm text-muted-foreground">
                      Pozisyon: {resp.position}
                    </p>
                  )}
                  {resp.firmsMentioned.length > 0 && (
                    <p className="mb-2 text-sm text-muted-foreground">
                      Bahsedilen firmalar:{" "}
                      {resp.firmsMentioned.join(", ")}
                    </p>
                  )}
                  <div className="mt-3 rounded bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {resp.response || "Yanit metni mevcut degil."}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
