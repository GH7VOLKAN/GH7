"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  plan: string;
  planStartDate: string | null;
  planEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserBrand {
  id: string;
  name: string;
  domain: string;
  promptCount: number;
  lastScanDate: string | null;
}

interface UserPayment {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  period: string;
  createdAt: string;
}

interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface UserStats {
  totalScans: number;
  totalPrompts: number;
  totalBrands: number;
}

interface UserData {
  profile: UserProfile;
  brands: UserBrand[];
  payments: UserPayment[];
  notifications: UserNotification[];
  stats: UserStats;
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

const PLANS = ["free", "pro", "business", "agency"];

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: UserData = await res.json();
      setData(json);
      setSelectedPlan(json.profile.plan);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handlePlanChange = async () => {
    if (!data || selectedPlan === data.profile.plan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(`Failed: ${json.error}`);
      } else {
        await fetchUser();
      }
    } catch (err) {
      alert(`Network error: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        User not found.
      </div>
    );
  }

  const { profile, brands, payments, notifications, stats } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Users
        </Button>
        <h1 className="text-2xl font-bold">
          {profile.fullName || profile.email}
        </h1>
      </div>

      {/* Profile Card */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-mono text-sm">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm">{profile.fullName ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm">{profile.phone ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Joined</span>
              <span className="text-sm">
                {new Date(profile.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan Start</span>
              <span className="text-sm">
                {profile.planStartDate
                  ? new Date(profile.planStartDate).toLocaleDateString("tr-TR")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan End</span>
              <span className="text-sm">
                {profile.planEndDate
                  ? new Date(profile.planEndDate).toLocaleDateString("tr-TR")
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan + Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Plan & Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan changer */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Current Plan:</span>
              <Badge variant={PLAN_COLORS[profile.plan] ?? "secondary"}>
                {profile.plan.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={selectedPlan === profile.plan || saving}
                onClick={handlePlanChange}
              >
                {saving ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3 w-3" />
                )}
                Save
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{stats.totalBrands}</div>
                <div className="text-xs text-muted-foreground">Brands</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{stats.totalScans}</div>
                <div className="text-xs text-muted-foreground">Scans</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{stats.totalPrompts}</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brands Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Brands ({brands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Prompts</TableHead>
                  <TableHead>Last Scan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="font-mono text-xs">{brand.domain}</TableCell>
                    <TableCell>{brand.promptCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {brand.lastScanDate
                        ? new Date(brand.lastScanDate).toLocaleString("tr-TR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/brands/${brand.id}`)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No brands yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PLAN_COLORS[payment.plan] ?? "secondary"}>
                        {payment.plan.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{payment.period}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.amount.toLocaleString("tr-TR")} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[payment.status] ?? "secondary"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No payments yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Read</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{n.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{n.title}</TableCell>
                    <TableCell>
                      {n.read ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge variant="default">Unread</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No notifications.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
