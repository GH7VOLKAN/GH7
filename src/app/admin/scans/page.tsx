"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScanRow {
  id: string;
  brandName: string;
  brandDomain: string;
  status: string;
  type: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  resultCount: number;
}

interface ScansResponse {
  scans: ScanRow[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  running: "outline",
  pending: "secondary",
  failed: "destructive",
};

const STATUSES = ["", "pending", "running", "completed", "failed"];

function formatDuration(ms: number | null): string {
  if (ms === null) return "-";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}

export default function AdminScansPage() {
  const [data, setData] = useState<ScansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const fetchScans = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (status) params.set("status", status);

    try {
      const res = await fetch(`/api/admin/scans?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch scans:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Taramalar</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={fetchScans}>
          Refresh
        </Button>

        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} scans total
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : data && data.scans.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scan ID</TableHead>
                <TableHead>Marka</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Başlangıç</TableHead>
                <TableHead>Süre</TableHead>
                <TableHead>Sonuç</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-mono text-xs">
                    {scan.id.slice(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{scan.brandName}</div>
                    <div className="text-xs text-muted-foreground">
                      {scan.brandDomain}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[scan.status] ?? "secondary"}>
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{scan.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(scan.startedAt).toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDuration(scan.durationMs)}
                  </TableCell>
                  <TableCell>{scan.resultCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          No scans found.
        </p>
      )}
    </div>
  );
}
