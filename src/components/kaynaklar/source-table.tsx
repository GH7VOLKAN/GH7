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
import { sourceDomains } from "@/lib/mock-data/sources";
import { sourceTypeLabels } from "@/lib/types";

export function SourceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaynak Domainler</CardTitle>
        <CardDescription>
          AI modellerinin yanıtlarında referans gösterdiği kaynaklar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Kullanım</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Ort. Atıf
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  URL Sayısı
                </TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceDomains.map((source) => (
                <TableRow key={source.domain}>
                  <TableCell className="font-medium">
                    {source.domain}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground">
                      {sourceTypeLabels[source.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        %{source.usagePercent}
                      </span>
                      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${source.usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">
                    {source.avgCitations.toFixed(1)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell tabular-nums text-muted-foreground">
                    {source.urls?.length ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {source.actionNote ? (
                      <Badge variant="outline" className="text-muted-foreground max-w-[200px] truncate">
                        {source.actionNote}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
