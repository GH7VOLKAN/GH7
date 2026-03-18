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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search, Play, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  domain: string;
  ownerEmail: string;
  plan: string;
  promptCount: number;
  scanCount: number;
  lastScanDate: string | null;
  lastScanStatus: string | null;
  createdAt: string;
}

interface BrandsResponse {
  brands: Brand[];
  total: number;
  page: number;
  totalPages: number;
}

const PLAN_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  free: "secondary",
  pro: "default",
  business: "outline",
  agency: "destructive",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  running: "outline",
  pending: "secondary",
  failed: "destructive",
};

const PLANS = ["", "free", "pro", "business", "agency"];

export default function AdminBrandsPage() {
  const router = useRouter();
  const [data, setData] = useState<BrandsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [plan, setPlan] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [triggeringBrand, setTriggeringBrand] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (plan) params.set("plan", plan);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/brands?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  }, [page, plan, search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const triggerScan = async (brandId: string) => {
    setTriggeringBrand(brandId);
    try {
      const res = await fetch("/api/admin/scan/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(`Scan trigger failed: ${json.error}`);
      } else {
        alert(`Scan started! ID: ${json.scanId}`);
        fetchBrands(); // Refresh
      }
    } catch (err) {
      alert(`Network error: ${err}`);
    } finally {
      setTriggeringBrand(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Brands</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or domain..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Plans</option>
          {PLANS.filter(Boolean).map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>

        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} brands total
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
      ) : data && data.brands.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Prompts</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <button
                      onClick={() => router.push(`/admin/brands/${brand.id}`)}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {brand.name}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {brand.domain}
                  </TableCell>
                  <TableCell className="text-xs">{brand.ownerEmail}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_COLORS[brand.plan] ?? "secondary"}>
                      {brand.plan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{brand.promptCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {brand.lastScanDate
                      ? new Date(brand.lastScanDate).toLocaleString("tr-TR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {brand.lastScanStatus ? (
                      <Badge
                        variant={
                          STATUS_COLORS[brand.lastScanStatus] ?? "secondary"
                        }
                      >
                        {brand.lastScanStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={triggeringBrand === brand.id}
                      onClick={() => triggerScan(brand.id)}
                    >
                      {triggeringBrand === brand.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      <span className="ml-1">Scan</span>
                    </Button>
                  </TableCell>
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
          No brands found.
        </p>
      )}
    </div>
  );
}
