"use client";

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

interface SuggestedPrompt {
  id: string;
  text: string;
  volume: number;
}

interface SuggestedPromptsTableProps {
  suggestedPrompts: SuggestedPrompt[];
}

export function SuggestedPromptsTable({
  suggestedPrompts,
}: SuggestedPromptsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Önerilen Promptlar</CardTitle>
        <CardDescription>
          Sektörünüzle ilgili yeni prompt önerileri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Prompt</TableHead>
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
                    <Button variant="outline" size="sm">
                      Ekle
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
