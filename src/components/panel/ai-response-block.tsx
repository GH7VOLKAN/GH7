"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";
import { KINDE_COLORS } from "@/components/panel/kinde/primitives";

/**
 * AI Response Block — platform yanıt metnini okunabilir hale getirir.
 *
 *  - marked ile markdown render (**bold**, 1./2. listeler, paragraflar)
 *  - Marka → bold + hafif gri background pill
 *  - Rakip → bold + underline
 *  - 500 karakterden uzun yanıt → collapsed + "Devamını göster"
 *  - Yanıt boşsa → italik placeholder
 *  - Kinde estetiği: renk yok, ikon yok
 */

// marked configuration — güvenli mod, GFM, breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

const COLLAPSED_CHAR_LIMIT = 500;

export function AIResponseBlock({
  text,
  brandName,
  competitorNames,
  emptyLabel = "Bu platform yanıt vermedi",
}: {
  text: string | null | undefined;
  brandName: string;
  competitorNames: string[];
  emptyLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasText =
    !!text && text.trim().length > 0 && !text.startsWith("[ERROR]");

  // Render edilmiş HTML'i hesapla (memoize)
  const html = useMemo(() => {
    if (!hasText) return "";
    return renderWithHighlight(text ?? "", brandName, competitorNames);
  }, [text, brandName, competitorNames, hasText]);

  if (!hasText) {
    return (
      <div
        style={{
          padding: "16px 20px",
          background: "#FAFAFA",
          border: `1px solid ${KINDE_COLORS.divider}`,
          borderRadius: 8,
          fontSize: 14,
          fontStyle: "italic",
          color: KINDE_COLORS.mutedLight,
          lineHeight: 1.6,
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  const isLong = (text?.length ?? 0) > COLLAPSED_CHAR_LIMIT;
  const showToggle = isLong;
  const showCollapsed = isLong && !expanded;

  return (
    <div
      style={{
        padding: "16px 20px",
        background: "#FAFAFA",
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 8,
        fontSize: 14,
        lineHeight: 1.8,
        color: "#333",
      }}
    >
      <style jsx>{`
        .ai-resp {
          position: relative;
        }
        .ai-resp :global(p) {
          margin: 0 0 16px 0;
        }
        .ai-resp :global(p:last-child) {
          margin-bottom: 0;
        }
        .ai-resp :global(ol),
        .ai-resp :global(ul) {
          margin: 0 0 16px 0;
          padding-left: 24px;
        }
        .ai-resp :global(li) {
          margin-bottom: 12px;
        }
        .ai-resp :global(li p) {
          margin: 0 0 4px 0;
        }
        .ai-resp :global(strong) {
          font-weight: 700;
          color: #000;
        }
        .ai-resp :global(em) {
          font-style: italic;
        }
        .ai-resp :global(h1),
        .ai-resp :global(h2),
        .ai-resp :global(h3) {
          font-weight: 700;
          margin: 20px 0 8px 0;
          line-height: 1.3;
          color: #000;
        }
        .ai-resp :global(h1) {
          font-size: 18px;
        }
        .ai-resp :global(h2) {
          font-size: 16px;
        }
        .ai-resp :global(h3) {
          font-size: 15px;
        }
        .ai-resp :global(code) {
          background: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
        }
        .ai-resp :global(a) {
          color: #000;
          text-decoration: underline;
        }
        /* Marka vurgusu */
        .ai-resp :global(.brand-hit) {
          font-weight: 700;
          background: #f0f0f0;
          padding: 1px 6px;
          border-radius: 3px;
          color: #000;
        }
        /* Rakip vurgusu */
        .ai-resp :global(.comp-hit) {
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          color: #000;
        }
        .ai-resp-collapsed {
          max-height: 260px;
          overflow: hidden;
          mask-image: linear-gradient(
            to bottom,
            #000 70%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            #000 70%,
            transparent 100%
          );
        }
      `}</style>
      <div
        className={`ai-resp ${showCollapsed ? "ai-resp-collapsed" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 12,
            background: "transparent",
            border: 0,
            padding: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "#000",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {expanded ? "Daha az göster ▲" : "Devamını göster ▼"}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Render + highlight                                 */
/* -------------------------------------------------- */

/**
 * Markdown render et + marka/rakip highlight uygula.
 *
 * Strateji:
 * 1. Ham metinde marka ve rakip isimlerini ASCII-safe marker'larla sarmala
 *    (ör. BRMARKBEG__İdavilla__BRMARKEND)
 * 2. marked.parse(text) ile HTML üret — marker'lar HTML içinde korunur
 * 3. HTML içinde marker'ları <span class="brand-hit|comp-hit"> ile değiştir
 *
 * Bu sayede marka/rakip **bold** markdown içinde olsa bile highlight etkiler.
 * Türkçe karakterler güvenli — kendi regex pattern'imiz kullanıyoruz.
 */
function renderWithHighlight(
  raw: string,
  brandName: string,
  competitorNames: string[],
): string {
  const BRAND_BEGIN = "BRMARKBEG\u0000";
  const BRAND_END = "\u0000BRMARKEND";
  const COMP_BEGIN = "CMMARKBEG\u0000";
  const COMP_END = "\u0000CMMARKEND";

  let work = raw;

  // 1) Marka eşleşmelerini marker'la sarmala (en uzun eşleşmeden başla)
  const brandList = [brandName].filter((n) => n && n.trim().length > 1);
  for (const name of brandList) {
    const re = safeRegex(name);
    work = work.replace(re, (m) => `${BRAND_BEGIN}${m}${BRAND_END}`);
  }

  // 2) Rakip eşleşmelerini (brand eşleşmesi olanları atlayarak)
  const compList = [
    ...new Set(competitorNames.filter((n) => n && n.trim().length > 1)),
  ].sort((a, b) => b.length - a.length);

  for (const name of compList) {
    // Brand marker'lar içindeki eşleşmeleri atla
    const re = safeRegex(name);
    work = work.replace(re, (m, offset) => {
      // offset civarında BRAND_BEGIN / BRAND_END var mı kontrol et
      const before = work.slice(Math.max(0, offset - 40), offset);
      const lastBeg = before.lastIndexOf(BRAND_BEGIN);
      const lastEnd = before.lastIndexOf(BRAND_END);
      if (lastBeg > lastEnd) {
        // Şu an bir brand marker içindeyiz, dokunma
        return m;
      }
      return `${COMP_BEGIN}${m}${COMP_END}`;
    });
  }

  // 3) Markdown → HTML
  let html: string;
  try {
    html = marked.parse(work, { async: false }) as string;
  } catch {
    // Markdown parse hatası → raw metni escape edip paragraf olarak göster
    html = `<p>${escapeHtml(work)}</p>`;
  }

  // 4) Marker → span tag
  html = html
    .split(BRAND_BEGIN)
    .join('<span class="brand-hit">')
    .split(BRAND_END)
    .join("</span>")
    .split(COMP_BEGIN)
    .join('<span class="comp-hit">')
    .split(COMP_END)
    .join("</span>");

  return html;
}

/**
 * Safe regex — isim içindeki regex metakarakterlerini escape eder,
 * case-insensitive + unicode.
 */
function safeRegex(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "giu");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
