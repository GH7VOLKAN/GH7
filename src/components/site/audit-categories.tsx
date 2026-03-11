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
import {
  auditCategories,
  type AuditCheck,
} from "@/lib/mock-data/site-audit";

const statusIcon: Record<AuditCheck["status"], string> = {
  pass: "✓",
  fail: "✗",
  partial: "~",
};

const statusLabel: Record<AuditCheck["status"], string> = {
  pass: "Geçti",
  fail: "Başarısız",
  partial: "Kısmî",
};

export function AuditCategories() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {auditCategories.map((cat) => {
        const pct =
          cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;

        return (
          <Card key={cat.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cat.name}
                <Badge variant="outline" className="text-muted-foreground">
                  {cat.score}/{cat.maxScore}
                </Badge>
              </CardTitle>
              <CardDescription>
                <span className="flex items-center gap-3">
                  <span>%{pct} tamamlandı</span>
                  <span className="text-xs">·</span>
                  <span>{cat.checks.length} kontrol</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category progress bar */}
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Checks table */}
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[100px]">Durum</TableHead>
                      <TableHead>Kontrol</TableHead>
                      <TableHead className="w-[80px]">Skor</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Detay
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Aksiyon
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cat.checks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell>
                          <Badge
                            variant={
                              check.status === "pass" ? "outline" : "secondary"
                            }
                          >
                            {statusIcon[check.status]} {statusLabel[check.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{check.title}</span>
                            {check.fix && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 md:hidden">
                                {check.fix}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold">
                          {check.score}/{check.maxScore}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          <p className="line-clamp-1">{check.detail}</p>
                          {check.fix && (
                            <p className="mt-0.5 text-xs line-clamp-1">
                              Öneri: {check.fix}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {check.raasEligible ? (
                            <Button size="sm">Biz Uygulayalım</Button>
                          ) : check.fix ? (
                            <Button variant="outline" size="sm">
                              Aksiyona Ekle
                            </Button>
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
      })}
    </div>
  );
}
