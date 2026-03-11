"use client";

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
import { competitorRows, competitorDetail } from "@/lib/mock-data/competitors";

const userRow = competitorRows.find((r) => r.isUser);

export function GapAnalysisCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Fark Analizi — {competitorDetail.name} Neden Önde?
        </CardTitle>
        <CardDescription>
          {competitorDetail.name}: {competitorDetail.mentionScore} vs{" "}
          {userRow?.name ?? "Siz"}: {competitorDetail.userMentionScore}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Readiness gaps */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Hazırlık Farkları</h3>
            <ul className="space-y-2">
              {competitorDetail.readinessGaps.map((gap, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 shrink-0">·</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top source pages */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Kaynak Sayfalar</h3>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Sayfa</TableHead>
                    <TableHead className="text-right">Prompt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitorDetail.topSourcePages.map((page, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-medium">{page.path}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {page.promptCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
