"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompetitorDetail {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
}

interface GapAnalysisCardProps {
  detail: CompetitorDetail | null;
  userName: string;
}

export function GapAnalysisCard({ detail, userName }: GapAnalysisCardProps) {
  if (!detail) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Rakip verisi bulunamadı. Rakip ekledikten sonra fark analizi burada görünecek.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Fark Analizi — {detail.name} Neden Önde?
        </CardTitle>
        <CardDescription>
          Bahsedilme skoru karşılaştırması ve iyileştirme fırsatları
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Score comparison */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {detail.name}
            </p>
            <p className="text-3xl font-semibold tabular-nums">
              {detail.mentionScore}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${detail.mentionScore}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {userName}
              <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0">
                Siz
              </Badge>
            </p>
            <p className="text-3xl font-semibold tabular-nums">
              {detail.userMentionScore}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${detail.userMentionScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Readiness gaps */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Hazırlık Farkları</h3>
            <div className="flex flex-col gap-2">
              {detail.readinessGaps.length > 0 ? (
                detail.readinessGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <span className="mt-0.5 shrink-0 text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-muted-foreground">{gap}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Hazırlık farkı tespit edilmedi.
                </p>
              )}
            </div>
          </div>

          {/* Top source pages */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Kaynak Sayfalar</h3>
            {detail.topSourcePages.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Sayfa</TableHead>
                      <TableHead className="text-right">URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.topSourcePages.map((page, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {page.path}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {page.promptCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Kaynak sayfa verisi bulunamadı.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
