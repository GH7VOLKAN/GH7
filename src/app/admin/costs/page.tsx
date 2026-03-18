"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Cpu, UserCheck } from "lucide-react";

interface PlatformData {
  calls: { today: number; week: number; month: number };
  cost: { today: number; week: number; month: number };
}

interface CostsData {
  platforms: Record<string, PlatformData>;
  totals: {
    today: { calls: number; cost: number };
    week: { calls: number; cost: number };
    month: { calls: number; cost: number };
  };
  perUser: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

const PLATFORM_RATE: Record<string, string> = {
  chatgpt: "$0.005",
  claude: "$0.007",
  gemini: "$0.003",
  perplexity: "$0.005",
  google_aio: "$0.005",
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function AdminCostsPage() {
  const [data, setData] = useState<CostsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/costs")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">AI Maliyetleri</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-destructive">Maliyet verileri yuklenemedi.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">AI Maliyetleri</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Aylik Toplam Maliyet"
          value={fmt(data.totals.month.cost)}
          icon={DollarSign}
          description={`Bu hafta: ${fmt(data.totals.week.cost)} / Bugun: ${fmt(data.totals.today.cost)}`}
        />
        <StatCard
          title="Kullanici Basina Maliyet"
          value={fmt(data.perUser)}
          icon={UserCheck}
          description="Aylik maliyet / aktif kullanici"
        />
        <StatCard
          title="Toplam API Cagrilari"
          value={data.totals.month.calls.toLocaleString("tr-TR")}
          icon={Cpu}
          description={`Bu hafta: ${data.totals.week.calls.toLocaleString("tr-TR")} / Bugun: ${data.totals.today.calls.toLocaleString("tr-TR")}`}
        />
      </div>

      {/* Platform breakdown table */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Platform Detaylari</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Birim Fiyat</TableHead>
                <TableHead className="text-right">Bugun</TableHead>
                <TableHead className="text-right">Bu Hafta</TableHead>
                <TableHead className="text-right">Bu Ay</TableHead>
                <TableHead className="text-right">Aylik Maliyet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.platforms).map(([platform, pd]) => (
                <TableRow key={platform}>
                  <TableCell>
                    <Badge variant="outline">
                      {PLATFORM_LABELS[platform] ?? platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {PLATFORM_RATE[platform] ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {pd.calls.today.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {pd.calls.week.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {pd.calls.month.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {fmt(pd.cost.month)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="font-semibold bg-muted/30">
                <TableCell colSpan={2}>Toplam</TableCell>
                <TableCell className="text-right">
                  {data.totals.today.calls.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right">
                  {data.totals.week.calls.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right">
                  {data.totals.month.calls.toLocaleString("tr-TR")}
                </TableCell>
                <TableCell className="text-right">
                  {fmt(data.totals.month.cost)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost trend hint */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Maliyet Trendi</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Bugun</p>
              <p className="text-xl font-bold">{fmt(data.totals.today.cost)}</p>
              <p className="text-xs text-muted-foreground">
                {data.totals.today.calls} cagri
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bu Hafta</p>
              <p className="text-xl font-bold">{fmt(data.totals.week.cost)}</p>
              <p className="text-xs text-muted-foreground">
                {data.totals.week.calls} cagri
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bu Ay</p>
              <p className="text-xl font-bold">{fmt(data.totals.month.cost)}</p>
              <p className="text-xs text-muted-foreground">
                {data.totals.month.calls} cagri
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
