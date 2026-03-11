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
import { platformLabels, type PlatformKey, type Sentiment } from "@/lib/types";

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
}

export function PromptTable({ promptItems }: PromptTableProps) {
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {promptItems.map((item) => (
                <TableRow key={item.id}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
