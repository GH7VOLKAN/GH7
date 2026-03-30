interface SectionVisibilityTipsProps {
  tips: string | null;
}

export function SectionVisibilityTips({ tips }: SectionVisibilityTipsProps) {
  if (!tips) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Gorunurluk Tavsiyeleri
      </h2>
      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
          {tips}
        </p>
      </div>
    </section>
  );
}
