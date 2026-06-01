"use client";

import { useState } from "react";

export function CopyButton({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 9999,
        border: "1px solid #e5e5e5",
        background: done ? "#f0fdf4" : "#fff",
        color: done ? "#22c55e" : "#666",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {done ? copiedLabel : copyLabel}
    </button>
  );
}
