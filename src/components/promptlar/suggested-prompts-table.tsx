"use client";

import { useTransition } from "react";
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
import { addPromptFromSuggested } from "@/lib/actions";

interface SuggestedPrompt {
  id: string;
  text: string;
  volume: number;
}

interface SuggestedPromptsTableProps {
  suggestedPrompts: SuggestedPrompt[];
  brandId: string;
}

export function SuggestedPromptsTable({
  suggestedPrompts,
  brandId,
}: SuggestedPromptsTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(suggestedId: string) {
    startTransition(async () => {
      await addPromptFromSuggested(brandId, suggestedId);
    });
  }

  if (suggestedPrompts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Önerilen Sorular</CardTitle>
        <CardDescription>
          Sektörünüzle ilgili yeni soru önerileri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Soru</TableHead>
                <TableHead>Hacim</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestedPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.text}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`inline-block size-1.5 rounded-full ${
                            j < prompt.volume
                              ? "bg-foreground"
                              : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleAdd(prompt.id)}
                    >
                      {isPending ? "..." : "Ekle"}
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
