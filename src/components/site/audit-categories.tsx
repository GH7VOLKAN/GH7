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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { auditCategories, type AuditCheck } from "@/lib/mock-data/site-audit";

const statusLabel: Record<AuditCheck["status"], string> = {
  pass: "✓ Geçti",
  fail: "✗ Başarısız",
  partial: "~ Kısmî",
};

const statusVariant: Record<AuditCheck["status"], "outline" | "secondary"> = {
  pass: "outline",
  fail: "outline",
  partial: "secondary",
};

export function AuditCategories() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Denetim Kategorileri</CardTitle>
        <CardDescription>
          {auditCategories.length} kategoride detaylı site analizi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={auditCategories[0].name}>
          <TabsList variant="line" className="w-full flex-wrap">
            {auditCategories.map((cat) => (
              <TabsTrigger key={cat.name} value={cat.name}>
                {cat.name}
                <Badge variant="outline" className="ml-1.5 text-muted-foreground">
                  {cat.score}/{cat.maxScore}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {auditCategories.map((cat) => {
            const pct =
              cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;

            return (
              <TabsContent key={cat.name} value={cat.name}>
                <div className="mt-4">
                  <Progress value={pct} />
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Durum</TableHead>
                        <TableHead>Kontrol</TableHead>
                        <TableHead>Skor</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Detay
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Öneri
                        </TableHead>
                        <TableHead className="text-right">Aksiyon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.checks.map((check) => (
                        <TableRow key={check.id}>
                          <TableCell>
                            <Badge variant={statusVariant[check.status]}>
                              {statusLabel[check.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {check.title}
                          </TableCell>
                          <TableCell className="tabular-nums font-semibold">
                            {check.score}/{check.maxScore}
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                            {check.detail}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">
                            {check.fix ?? "—"}
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
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
