"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const fh = frontRef.current?.scrollHeight ?? 0;
    const bh = backRef.current?.scrollHeight ?? 0;
    if (fh > 0 || bh > 0) {
      setHeight(Math.max(fh, bh));
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      className={`cursor-pointer ${className ?? ""}`}
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative"
        style={{
          height: height !== undefined ? `${height}px` : "auto",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Front */}
        <div
          ref={frontRef}
          className="absolute inset-0 card rounded-[16px] border border-border bg-card p-5 transition-shadow duration-300 hover:shadow-lg hover:border-muted-foreground/30"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        {/* Back */}
        <div
          ref={backRef}
          className="absolute inset-0 rounded-[16px] border border-border bg-card p-5 overflow-y-auto"
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
