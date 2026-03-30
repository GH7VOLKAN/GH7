interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium text-foreground ${className ?? ""}`}
    >
      Dogrulanmis
    </span>
  );
}
