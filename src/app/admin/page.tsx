"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Globe, Scan, FileText, TrendingUp, Building2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  plans: Record<string, number>;
  scansToday: number;
  scansThisWeek: number;
  totalPrompts: number;
  totalBrands: number;
  revenueEstimate: number;
}

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

const PLAN_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  free: "secondary",
  pro: "default",
  business: "outline",
  agency: "destructive",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-destructive">Failed to load stats.</p>;
  }

  const revenueFormatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(stats.revenueEstimate / 100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      {/* Top-level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Active Brands"
          value={stats.totalBrands}
          icon={Globe}
        />
        <StatCard
          title="Total Prompts"
          value={stats.totalPrompts}
          icon={FileText}
        />
        <StatCard
          title="Scans Today"
          value={stats.scansToday}
          icon={Scan}
          description={`${stats.scansThisWeek} this week`}
        />
        <StatCard
          title="Revenue Estimate (MRR)"
          value={revenueFormatted}
          icon={TrendingUp}
          description="Based on current paid users"
        />
        <StatCard
          title="Paid Users"
          value={stats.plans.pro + stats.plans.business + stats.plans.agency}
          icon={Building2}
          description={`${stats.plans.free} free users`}
        />
      </div>

      {/* Plan distribution */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Plan Distribution</h2>
      <div className="flex flex-wrap gap-3">
        {Object.entries(stats.plans).map(([plan, count]) => (
          <Card key={plan} className="min-w-[140px]">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-4">
                <Badge variant={PLAN_COLORS[plan] ?? "secondary"}>
                  {plan.toUpperCase()}
                </Badge>
                <span className="text-xl font-bold">{count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
