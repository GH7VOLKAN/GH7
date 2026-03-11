export function GH7Logo({ className }: { className?: string }) {
  return (
    <span
      className={`text-xl font-black tracking-[-0.04em] ${className ?? ""}`}
    >
      GH7<span className="text-muted-foreground">.ai</span>
    </span>
  );
}
