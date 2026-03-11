"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Priority } from "@/lib/types";
import { completeActionTask } from "@/lib/actions";

export interface ActionTaskItem {
  id: string;
  priority: Priority;
  title: string;
  impact: string;
  source: string;
  detail: string | null;
  completed: boolean;
  raasEligible: boolean;
}

const priorityLabel: Record<Priority, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

interface ActionTableProps {
  brandId: string;
  tasks: ActionTaskItem[];
  raasSelected: Set<string>;
  onRaasToggle: (id: string) => void;
}

export function ActionTable({
  brandId,
  tasks,
  raasSelected,
  onRaasToggle,
}: ActionTableProps) {
  const [isPending, startTransition] = useTransition();
  const completedCount = tasks.filter((t) => t.completed).length;

  function handleComplete(taskId: string) {
    startTransition(async () => {
      await completeActionTask(brandId, taskId);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Görevler</CardTitle>
        <CardDescription>
          {tasks.length} görev · {completedCount} tamamlandı
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Öncelik</TableHead>
                <TableHead>Görev</TableHead>
                <TableHead className="hidden sm:table-cell">Etki</TableHead>
                <TableHead className="hidden md:table-cell">Kaynak</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">RaaS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={task.completed ? "opacity-50" : ""}
                >
                  <TableCell>
                    <Badge
                      variant={task.priority === "high" ? "default" : "outline"}
                      className={
                        task.priority !== "high" ? "text-muted-foreground" : ""
                      }
                    >
                      {priorityLabel[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`font-medium max-w-[250px] ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {task.impact}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {task.source}
                  </TableCell>
                  <TableCell>
                    {task.completed ? (
                      <Badge variant="secondary">Tamamlandı</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleComplete(task.id)}
                      >
                        {isPending ? "..." : "Tamamla"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {task.raasEligible && !task.completed ? (
                      <Checkbox
                        checked={raasSelected.has(task.id)}
                        onCheckedChange={() => onRaasToggle(task.id)}
                      />
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
