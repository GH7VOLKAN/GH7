"use client";

import { useState } from "react";

interface ExpandCardProps {
  summary: React.ReactNode;
  detail: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function ExpandCard({ summary, detail, className, defaultOpen = false }: ExpandCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`card rounded-[16px] border border-border bg-card transition-all duration-300 cursor-pointer
        ${!open ? "hover:-translate-y-[3px] hover:shadow-lg hover:border-muted-foreground/30" : "border-muted-foreground/20"}
        active:scale-[0.98] ${className ?? ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className="p-5">
        {summary}
      </div>
      <div
        className="overflow-hidden transition-all"
        style={{
          maxHeight: open ? "800px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
        }}
      >
        <div className="border-t border-border px-5 pb-5 pt-4" onClick={(e) => e.stopPropagation()}>
          {detail}
        </div>
      </div>
    </div>
  );
}
