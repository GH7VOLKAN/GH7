"use client";

import { useState, useTransition } from "react";
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
import { PlusIcon, Trash2Icon } from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { addCompetitor, removeCompetitor } from "@/lib/actions";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
}

interface CompetitorTableProps {
  rows: CompetitorRow[];
  brandId: string;
}

export function CompetitorTable({ rows, brandId }: CompetitorTableProps) {
  const userRow = rows.find((r) => r.isUser);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addCompetitor(brandId, { name: newName, domain: newDomain });
      setNewName("");
      setNewDomain("");
    });
  }

  function handleRemove(competitorId: string) {
    setDeletingId(competitorId);
    startTransition(async () => {
      await removeCompetitor(brandId, competitorId);
      setDeletingId(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rakip Karşılaştırma</CardTitle>
        <CardDescription>
          AI platformlarındaki görünürlük karşılaştırması
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Rakip adı"
            className="flex-1 rounded-xl border-[1.5px] border-border bg-background px-4 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
          <input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="domain.com"
            className="flex-1 rounded-xl border-[1.5px] border-border bg-background px-4 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
          <Button
            onClick={handleAdd}
            disabled={isPending || !newName.trim()}
            size="sm"
          >
            <PlusIcon className="mr-1 size-4" />
            Ekle
          </Button>
        </div>
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
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const mentionDiff = row.isUser
                  ? null
                  : row.mentionScore - (userRow?.mentionScore ?? 0);
                const readinessDiff = row.isUser
                  ? null
                  : row.readinessScore - (userRow?.readinessScore ?? 0);

                return (
                  <TableRow
                    key={row.id}
                    className={`${row.isUser ? "bg-primary/5" : ""} ${deletingId === row.id ? "opacity-30" : ""}`}
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
                    <TableCell>
                      {!row.isUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(row.id)}
                          disabled={isPending}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      )}
                    </TableCell>
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
