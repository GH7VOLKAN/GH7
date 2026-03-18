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
import { TrendingUp, AlertTriangle, UserMinus } from "lucide-react";

interface PaymentRow {
  id: string;
  email: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

interface AtRiskUser {
  id: string;
  email: string;
  plan: string;
  gracePeriodEnd: string;
}

interface ChurnedUser {
  id: string;
  email: string;
  planEndDate: string;
}

interface RevenueData {
  mrr: number;
  plans: Record<string, number>;
  payments: PaymentRow[];
  failedPayments: AtRiskUser[];
  churnedUsers: ChurnedUser[];
}

const PLAN_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  free: "secondary",
  pro: "default",
  business: "outline",
  agency: "destructive",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

function formatTRY(kurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(kurus / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Gelir</h1>
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
    return <p className="text-destructive">Gelir verileri yuklenemedi.</p>;
  }

  const totalPaid = data.plans.pro + data.plans.business + data.plans.agency;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Gelir</h1>

      {/* MRR card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="MRR (Aylik Tekrarlayan Gelir)"
          value={formatTRY(data.mrr)}
          icon={TrendingUp}
          description={`${totalPaid} odeme yapan kullanici`}
        />
        <StatCard
          title="Risk Altinda"
          value={data.failedPayments.length}
          icon={AlertTriangle}
          description="Odeme basarisiz / grace period"
        />
        <StatCard
          title="Son 30 Gun Churn"
          value={data.churnedUsers.length}
          icon={UserMinus}
          description="Free'ye dusen kullanicilar"
        />
      </div>

      {/* Plan distribution */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Plan Dagilimi</h2>
      <div className="flex flex-wrap gap-3">
        {Object.entries(data.plans).map(([plan, count]) => (
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

      {/* Payment history table */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Son Odemeler</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Henuz odeme kaydi yok.
                  </TableCell>
                </TableRow>
              )}
              {data.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.email}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_COLORS[p.plan] ?? "secondary"}>
                      {p.plan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: p.currency,
                      minimumFractionDigits: 2,
                    }).format(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[p.status] ?? "secondary"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* At-risk section */}
      {data.failedPayments.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Risk Altindaki Kullanicilar
          </h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Grace Period Bitis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.failedPayments.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={PLAN_COLORS[u.plan] ?? "secondary"}>
                          {u.plan.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(u.gracePeriodEnd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Churn section */}
      {data.churnedUsers.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-semibold flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-red-500" />
            Son 30 Gun Churn
          </h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan Bitis Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.churnedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(u.planEndDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
