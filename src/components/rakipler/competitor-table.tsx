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
import {
  PlusIcon,
  Trash2Icon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { addCompetitor, removeCompetitor } from "@/lib/actions";
import { DiscoverCompetitorsButton } from "./discover-competitors-button";
import { CompetitorDetailDialog } from "./competitor-detail-dialog";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
  reason: string | null;
  products: string[];
  relevance: string;
  source: string;
}

interface CompetitorTableProps {
  rows: CompetitorRow[];
  brandId: string;
}

function scoreColor(score: number): string {
  if (score >= 50) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 25) return "text-amber-600 dark:text-amber-400";
  if (score > 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

export function CompetitorTable({ rows, brandId }: CompetitorTableProps) {
  const userRow = rows.find((r) => r.isUser) ?? null;
  const competitorRows = rows.filter((r) => !r.isUser);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CompetitorRow | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addCompetitor(brandId, { name: newName, domain: newDomain });
      setNewName("");
      setNewDomain("");
    });
  }

  function handleRemove(competitorId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(competitorId);
    startTransition(async () => {
      await removeCompetitor(brandId, competitorId);
      setDeletingId(null);
    });
  }

  return (
    <>
      <Card className="border border-border/50 shadow-sm rounded-2xl">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Rakip Karşılaştırma</CardTitle>
            <CardDescription>
              Yapay zekalardaki görünürlük karşılaştırması — satıra tıklayarak detayları görün
            </CardDescription>
          </div>
          <DiscoverCompetitorsButton
            brandId={brandId}
            hasCompetitors={competitorRows.length > 0}
          />
        </CardHeader>
        <CardContent>
          {/* Manual add form */}
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
                  <TableHead>Görünürlük</TableHead>
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
                {/* User row — always first, highlighted */}
                {userRow && (
                  <TableRow className="bg-primary/5">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{userRow.name}</span>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Siz
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {userRow.domain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ScoreCell score={userRow.mentionScore} diff={null} />
                    </TableCell>
                    {platforms.map((p) => (
                      <TableCell
                        key={p}
                        className={`hidden lg:table-cell text-center tabular-nums font-medium ${scoreColor(userRow.platforms[p])}`}
                      >
                        %{userRow.platforms[p]}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                )}

                {/* Competitor rows — clickable */}
                {competitorRows.map((row) => {
                  const mentionDiff = row.mentionScore - (userRow?.mentionScore ?? 0);

                  return (
                    <TableRow
                      key={row.id}
                      className={`cursor-pointer hover:bg-accent/50 transition-colors ${deletingId === row.id ? "opacity-30" : ""}`}
                      onClick={() => setSelected(row)}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium">{row.name}</span>
                            {row.source === "ai_discovered" ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 gap-0.5 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                              >
                                <SparklesIcon className="size-2.5" />
                                Otomatik
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 gap-0.5"
                              >
                                <UserIcon className="size-2.5" />
                                Manuel
                              </Badge>
                            )}
                            {row.relevance === "indirect" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                Dolaylı
                              </Badge>
                            )}
                          </div>
                          {row.reason && (
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                              {row.reason}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {row.domain}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ScoreCell score={row.mentionScore} diff={mentionDiff} />
                      </TableCell>
                      {platforms.map((p) => (
                        <TableCell
                          key={p}
                          className={`hidden lg:table-cell text-center tabular-nums font-medium ${scoreColor(row.platforms[p])}`}
                        >
                          %{row.platforms[p]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleRemove(row.id, e)}
                          disabled={isPending}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {competitorRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Henüz rakip yok. &quot;Rakipleri Otomatik Keşfet&quot; butonuna tıklayarak sektörünüzdeki gerçek rakipleri otomatik bulun.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <CompetitorDetailDialog
        competitor={selected}
        userRow={userRow}
        brandId={brandId}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function ScoreCell({ score, diff }: { score: number; diff: number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tabular-nums">{score}</span>
        {diff !== null && diff !== 0 && (
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${
              diff > 0
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {diff}
          </Badge>
        )}
      </div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
