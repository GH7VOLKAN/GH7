"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-16 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] border rounded-lg
        hover:scale-[1.03] active:scale-[0.97] transition-transform
        border-border bg-background text-foreground"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
