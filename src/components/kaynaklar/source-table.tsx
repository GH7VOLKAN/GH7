"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { sourceTypeLabels, type SourceType } from "@/lib/types";

interface SourceDomain {
  id: string;
  domain: string;
  type: SourceType;
  usagePercent: number;
  avgCitations: number;
  urls: string[];
  actionNote: string | null;
}

interface SourceTableProps {
  sourceDomains: SourceDomain[];
}

export function SourceTable({ sourceDomains }: SourceTableProps) {
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
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceDomains.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{source.domain}</span>
                      {source.urls && source.urls.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {source.urls.length} URL takip ediliyor
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground">
                      {sourceTypeLabels[source.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold tabular-nums">
                        %{source.usagePercent}
                      </span>
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${source.usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">
                    {source.avgCitations.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {source.actionNote ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <p className="text-xs text-muted-foreground text-right max-w-[180px]">
                          {source.actionNote}
                        </p>
                        <Button size="sm">Kayıt Ol</Button>
                      </div>
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
