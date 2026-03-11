"use client";

import { useState } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`card-container cursor-pointer ${className ?? ""}`}
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative transition-transform duration-600"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Front */}
        <div
          className="card rounded-[16px] border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg hover:border-muted-foreground/30 active:scale-[0.98]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-[16px] border border-border bg-card p-5"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Kapat
            </button>
          </div>
          {back}
        </div>
      </div>
    </div>
  );
}
