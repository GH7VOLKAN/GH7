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
import { Trash2Icon, PlusIcon } from "lucide-react";
import { platformLabels, type PlatformKey, type Sentiment } from "@/lib/types";
import { addCustomPrompt, deletePrompt } from "@/lib/actions";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface PromptItem {
  id: string;
  text: string;
  tags: string[];
  visibility: number;
  position: string;
  sentiment: Sentiment;
  topCompetitor: string;
  modelResults: Record<PlatformKey, boolean>;
}

interface PromptTableProps {
  promptItems: PromptItem[];
  brandId: string;
}

export function PromptTable({ promptItems, brandId }: PromptTableProps) {
  const [newText, setNewText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!newText.trim()) return;
    startTransition(async () => {
      await addCustomPrompt(brandId, newText);
      setNewText("");
    });
  }

  function handleDelete(promptId: string) {
    setDeletingId(promptId);
    startTransition(async () => {
      await deletePrompt(brandId, promptId);
      setDeletingId(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktif Promptlar</CardTitle>
        <CardDescription>
          Takip edilen {promptItems.length} prompt ve AI platformlarındaki
          görünürlükleri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Yeni prompt yazın..."
            className="flex-1 rounded-xl border-[1.5px] border-border bg-background px-4 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
          <Button
            onClick={handleAdd}
            disabled={isPending || !newText.trim()}
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
                <TableHead>Prompt</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Etiketler
                </TableHead>
                <TableHead>Görünürlük</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Pozisyon
                </TableHead>
                <TableHead className="hidden md:table-cell">Duygu</TableHead>
                <TableHead className="hidden md:table-cell">Rakip</TableHead>
                {PLATFORMS.map((p) => (
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
              {promptItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={deletingId === item.id ? "opacity-30" : ""}
                >
                  <TableCell className="max-w-[250px] truncate font-medium">
                    &ldquo;{item.text}&rdquo;
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold tabular-nums">
                      %{item.visibility}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-muted-foreground">
                      {item.position ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-muted-foreground">
                      {item.sentiment ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {item.topCompetitor ?? "—"}
                  </TableCell>
                  {PLATFORMS.map((p) => (
                    <TableCell
                      key={p}
                      className="hidden lg:table-cell text-center"
                    >
                      <span
                        className={
                          item.modelResults[p]
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.modelResults[p] ? "✓" : "✗"}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
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
