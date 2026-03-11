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

interface RecentMention {
  platform: PlatformKey;
  timeAgo: string;
  prompt: string;
  excerpt: string;
  position: string;
  sentiment: Sentiment;
}

interface RecentMentionsTableProps {
  recentMentions: RecentMention[];
}

export function RecentMentionsTable({
  recentMentions,
}: RecentMentionsTableProps) {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Son AI Bahsedilmeleri</CardTitle>
          <CardDescription>
            AI platformlarındaki en son bahsedilmeleriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Pozisyon
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Duygu</TableHead>
                  <TableHead className="text-right">Zaman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMentions.map((mention, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {platformLabels[mention.platform].name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {mention.prompt}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-muted-foreground">
                        {mention.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-muted-foreground">
                        {mention.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {mention.timeAgo}
                    </TableCell>
                  </TableRow>
                ))}
                {recentMentions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Henüz bahsedilme verisi yok. İlk tarama sonrası burada görünecek.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
