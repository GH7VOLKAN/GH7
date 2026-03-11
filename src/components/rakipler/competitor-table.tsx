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
                <TableHead>Bahsedilme</TableHead>
                <TableHead>Hazırlık</TableHead>
                {platforms.map((p) => (
                  <TableHead
                    key={p}
                    className="hidden lg:table-cell text-center"
                  >
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
                    className={row.isUser ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={row.isUser ? "font-semibold" : "font-medium"}>
                            {row.name}
                          </span>
                          {row.isUser && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              Siz
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {row.domain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold tabular-nums">
                            {row.mentionScore}
                          </span>
                          {mentionDiff !== null && (
                            <Badge
                              variant={mentionDiff > 0 ? "outline" : "secondary"}
                              className="text-muted-foreground text-[10px] px-1.5 py-0"
                            >
                              {mentionDiff >= 0 ? "+" : ""}
                              {mentionDiff}
                            </Badge>
                          )}
                        </div>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${row.mentionScore}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold tabular-nums">
                            {row.readinessScore}
                          </span>
                          {readinessDiff !== null && (
                            <Badge
                              variant={readinessDiff > 0 ? "outline" : "secondary"}
                              className="text-muted-foreground text-[10px] px-1.5 py-0"
                            >
                              {readinessDiff >= 0 ? "+" : ""}
                              {readinessDiff}
                            </Badge>
                          )}
                        </div>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${row.readinessScore}%` }}
                          />
                        </div>
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
