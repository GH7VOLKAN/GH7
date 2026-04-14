import Link from "next/link";
import { ArrowRightIcon, ZapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TopActionCardProps {
  action: { title: string; impact: string };
}

export function TopActionCard({ action }: TopActionCardProps) {
  return (
    <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg bg-foreground/5 p-2 shrink-0">
            <ZapIcon className="size-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              En Önemli Aksiyonun
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground leading-snug">
              {action.title}
            </p>
            {action.impact && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {action.impact}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/panel/iyilestirme"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Başla
          <ArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
