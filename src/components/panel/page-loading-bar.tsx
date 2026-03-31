"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading
    setLoading(true);
    setProgress(15);

    // Gradually increase progress (simulating real loading)
    const intervals = [
      setTimeout(() => setProgress(30), 200),
      setTimeout(() => setProgress(45), 600),
      setTimeout(() => setProgress(60), 1200),
      setTimeout(() => setProgress(75), 2500),
      setTimeout(() => setProgress(85), 4000),
    ];

    // Complete when page actually loads
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 300); // This fires when the effect re-runs with new pathname

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(completeTimer);
      // When cleanup runs (new navigation starts), immediately complete previous
      setProgress(100);
      setTimeout(() => setLoading(false), 100);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: 3, zIndex: 9999,
      pointerEvents: "none",
    }}>
      <div style={{
        height: "100%",
        background: "#09090B",
        width: `${progress}%`,
        transition: progress === 0 ? "none" : "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: loading ? "0 0 8px rgba(9,9,11,0.4)" : "none",
      }} />
    </div>
  );
}
