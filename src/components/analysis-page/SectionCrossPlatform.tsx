interface SectionCrossPlatformProps {
  notes: string | null;
}

export function SectionCrossPlatform({ notes }: SectionCrossPlatformProps) {
  if (!notes) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Platformlar Arasi Analiz
      </h2>
      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
          {notes}
        </p>
      </div>
    </section>
  );
}
