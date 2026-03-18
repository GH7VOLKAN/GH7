"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Bell,
  Send,
  Mail,
  MailOpen,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Phone,
  FileText,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────

interface NotificationItem {
  id: string;
  brandName: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
}

// ── Constants ──────────────────────────────────────────

const NOTIFICATION_TYPES = [
  { value: "", label: "T\u00fcm\u00fc" },
  { value: "scan_completed", label: "Tarama Tamamland\u0131" },
  { value: "scan_failed", label: "Tarama Ba\u015far\u0131s\u0131z" },
  { value: "score_up", label: "Skor Artt\u0131" },
  { value: "score_down", label: "Skor D\u00fc\u015ft\u00fc" },
  { value: "call_request", label: "\u00c7a\u011fr\u0131 Talebi" },
  { value: "weekly_report", label: "Haftal\u0131k Rapor" },
  { value: "monthly_report", label: "Ayl\u0131k Rapor" },
];

const BROADCAST_OPTIONS = [
  { value: "all", label: "T\u00fcm PRO+ Kullan\u0131c\u0131lar" },
  { value: "pro", label: "Sadece PRO" },
  { value: "business", label: "Sadece Business" },
  { value: "agency", label: "Sadece Agency" },
];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  scan_completed: CheckCircle2,
  scan_failed: AlertCircle,
  score_up: TrendingUp,
  score_down: TrendingDown,
  call_request: Phone,
  weekly_report: FileText,
  monthly_report: FileText,
};

const TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scan_completed: "default",
  scan_failed: "destructive",
  score_up: "default",
  score_down: "destructive",
  call_request: "outline",
  weekly_report: "secondary",
  monthly_report: "secondary",
};

// ── Component ──────────────────────────────────────────

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Send form state
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendTarget, setSendTarget] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/notifications?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async () => {
    if (!sendTitle.trim() || !sendMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastTo: sendTarget,
          title: sendTitle,
          message: sendMessage,
          type: "monthly_report",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDialogOpen(false);
        setSendTitle("");
        setSendMessage("");
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to send notification", err);
    } finally {
      setSending(false);
    }
  };

  // ── Summary stats ────────────────────────────────────
  const total = data?.total ?? 0;
  const unreadCount = data?.notifications.filter((n) => !n.read).length ?? 0;
  const typeCounts: Record<string, number> = {};
  for (const n of data?.notifications ?? []) {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  }

  const totalPages = Math.ceil(total / 50);

  // ── Loading state ────────────────────────────────────
  if (loading && !data) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Bildirimler</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Send className="mr-2 h-4 w-4" />
            Bildirim G\u00f6nder
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bildirim G\u00f6nder</DialogTitle>
              <DialogDescription>
                Se\u00e7ili kullan\u0131c\u0131 grubuna bildirim g\u00f6nderin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Hedef
                </label>
                <select
                  value={sendTarget}
                  onChange={(e) => setSendTarget(e.target.value)}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {BROADCAST_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Ba\u015fl\u0131k
                </label>
                <Input
                  value={sendTitle}
                  onChange={(e) => setSendTitle(e.target.value)}
                  placeholder="Bildirim ba\u015fl\u0131\u011f\u0131..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Mesaj
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  placeholder="Bildirim mesaj\u0131..."
                  rows={4}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                \u0130ptal
              </DialogClose>
              <Button onClick={handleSend} disabled={sending || !sendTitle.trim() || !sendMessage.trim()}>
                {sending ? "G\u00f6nderiliyor..." : "G\u00f6nder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Bildirim
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Okunmam\u0131\u015f
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              T\u00fcr Da\u011f\u0131l\u0131m\u0131
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(typeCounts).map(([type, count]) => (
                <Badge key={type} variant={TYPE_COLORS[type] ?? "secondary"} className="text-xs">
                  {type.replace(/_/g, " ")} ({count})
                </Badge>
              ))}
              {Object.keys(typeCounts).length === 0 && (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        >
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Marka</th>
                  <th className="px-4 py-3 font-medium">T\u00fcr</th>
                  <th className="px-4 py-3 font-medium">Ba\u015fl\u0131k</th>
                  <th className="px-4 py-3 font-medium">Mesaj</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {(data?.notifications ?? []).map((n) => {
                  const Icon = TYPE_ICONS[n.type] ?? Bell;
                  return (
                    <tr key={n.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{n.brandName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={TYPE_COLORS[n.type] ?? "secondary"} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {n.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{n.title}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                        {n.message}
                      </td>
                      <td className="px-4 py-3">
                        {n.read ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
                {(data?.notifications ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Bildirim bulunamad\u0131.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages} ({total} bildirim)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              \u00d6nceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
