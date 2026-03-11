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
import { competitorRows } from "@/lib/mock-data/competitors";
import { platformLabels, type PlatformKey } from "@/lib/types";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];
const userRow = competitorRows.find((r) => r.isUser);

export function CompetitorTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rakip Karşılaştırma</CardTitle>
        <CardDescription>
          AI platformlarındaki görünürlük karşılaştırması
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead className="hidden sm:table-cell">Domain</TableHead>
                <TableHead>Bahsedilme</TableHead>
                <TableHead>Hazırlık</TableHead>
                {platforms.map((p) => (
                  <TableHead key={p} className="hidden lg:table-cell text-center">
                    {platformLabels[p].name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorRows.map((row) => {
                const mentionDiff = row.isUser
                  ? null
                  : row.mentionScore - (userRow?.mentionScore ?? 0);
                const readinessDiff = row.isUser
                  ? null
                  : row.readinessScore - (userRow?.readinessScore ?? 0);

                return (
                  <TableRow
                    key={row.domain}
                    className={row.isUser ? "bg-muted/30" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {row.name}
                        {row.isUser && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Siz
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {row.domain}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold tabular-nums">
                          {row.mentionScore}
                        </span>
                        {mentionDiff !== null && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            ({mentionDiff >= 0 ? "+" : ""}
                            {mentionDiff})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold tabular-nums">
                          {row.readinessScore}
                        </span>
                        {readinessDiff !== null && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            ({readinessDiff >= 0 ? "+" : ""}
                            {readinessDiff})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {platforms.map((p) => (
                      <TableCell
                        key={p}
                        className="hidden lg:table-cell text-center tabular-nums text-muted-foreground"
                      >
                        {row.platforms[p]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
