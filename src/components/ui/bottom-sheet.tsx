"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ open, onClose, children, maxHeight = "85vh" }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] bg-background shadow-[0_-8px_32px_rgba(0,0,0,0.12)] lg:hidden overflow-y-auto`}
        style={{
          maxHeight,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-background rounded-t-[20px]">
          <div className="h-1 w-9 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-6">
          {children}
        </div>
      </div>
    </>
  );
}
