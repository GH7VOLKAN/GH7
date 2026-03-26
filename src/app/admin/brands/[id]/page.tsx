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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────

interface BrandInfo {
  id: string;
  name: string;
  domain: string;
  type: string;
  sector: string | null;
  city: string | null;
  businessCategories: string[];
  serviceRegions: string[];
  strengths: string[];
  weaknesses: string[];
  competitorNames: string[];
  competitorDomains: string[];
  autoScan: boolean;
  scanInterval: string;
  createdAt: string;
  updatedAt: string;
}

interface Owner {
  email: string;
  fullName: string | null;
  plan: string;
}

interface PlatformResult {
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
}

interface BrandPrompt {
  id: string;
  text: string;
  category: string | null;
  isActive: boolean;
  lastScanAt: string | null;
  platformResults: Record<string, PlatformResult>;
}

interface BrandScan {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  resultCount: number;
}

interface ChecklistItem {
  id: string;
  layer: number;
  itemNumber: string;
  simpleTitle: string;
  simpleDescription: string;
  status: string;
  difficulty: string;
  impact: string;
  userMarkedDone: boolean;
}

interface CompetitorItem {
  id: string;
  name: string;
  domain: string;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<string, number> | null;
  relevance: string;
}

interface AuditCheck {
  id: string;
  label: string;
  status: string;
  score: number;
  detail: string | null;
  recommendation: string | null;
}

interface AuditCategoryItem {
  id: string;
  name: string;
  score: number;
  checks: AuditCheck[];
}

interface SourceDomainItem {
  id: string;
  domain: string;
  type: string;
  usagePercent: number;
  avgCitations: number;
  urls: string[];
  actionNote: string | null;
}

interface BrandData {
  brand: BrandInfo;
  owner: Owner;
  prompts: BrandPrompt[];
  scans: BrandScan[];
  platformSummary: Record<string, { mentioned: number; total: number }>;
  checklistItems: ChecklistItem[];
  competitors: CompetitorItem[];
  auditCategories: AuditCategoryItem[];
  sourceDomains: SourceDomainItem[];
}

// ─── Helpers ────────────────────────────────────────

const PLATFORMS = ["chatgpt", "claude", "gemini", "perplexity"];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  running: "outline",
  pending: "secondary",
  failed: "destructive",
};

const AUDIT_STATUS_ICON: Record<string, React.ReactNode> = {
  pass: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  partial: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  fail: <XCircle className="h-4 w-4 text-red-500" />,
};

const CHECKLIST_STATUS_ICON: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  missing: <XCircle className="h-4 w-4 text-red-500" />,
  locked: <Lock className="h-4 w-4 text-muted-foreground" />,
};

// ─── Component ──────────────────────────────────────

export default function AdminBrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [editSector, setEditSector] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCompetitorNames, setEditCompetitorNames] = useState("");
  const [editCompetitorDomains, setEditCompetitorDomains] = useState("");

  // Scan expand state
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const fetchBrand = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: BrandData = await res.json();
      setData(json);
      // Init edit form
      setEditName(json.brand.name);
      setEditDomain(json.brand.domain);
      setEditSector(json.brand.sector ?? "");
      setEditCity(json.brand.city ?? "");
      setEditCompetitorNames(json.brand.competitorNames.join(", "));
      setEditCompetitorDomains(json.brand.competitorDomains.join(", "));
    } catch (err) {
      console.error("Failed to fetch brand:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          domain: editDomain,
          sector: editSector || null,
          city: editCity || null,
          competitorNames: editCompetitorNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          competitorDomains: editCompetitorDomains
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(`Failed: ${json.error}`);
      } else {
        await fetchBrand();
      }
    } catch (err) {
      alert(`Network error: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        alert(`Failed: ${json.error}`);
      } else {
        router.push("/admin/brands");
      }
    } catch (err) {
      alert(`Network error: ${err}`);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
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
        Brand not found.
      </div>
    );
  }

  const { brand, owner, prompts, scans, platformSummary, checklistItems, competitors, auditCategories, sourceDomains } = data;

  // Group checklist items by layer
  const checklistByLayer: Record<number, ChecklistItem[]> = {};
  for (const item of checklistItems) {
    if (!checklistByLayer[item.layer]) checklistByLayer[item.layer] = [];
    checklistByLayer[item.layer].push(item);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/brands")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Brands
        </Button>
        <h1 className="text-2xl font-bold">{brand.name}</h1>
        <Badge variant="outline">{brand.type}</Badge>
        <span className="text-sm text-muted-foreground">
          Owner: {owner.fullName ?? owner.email}
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="prompts">Sorular</TabsTrigger>
          <TabsTrigger value="scans">Taramalar</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="checklist">Gelişim Planı</TabsTrigger>
          <TabsTrigger value="competitors">Rakipler</TabsTrigger>
          <TabsTrigger value="sources">Kaynaklar</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ─── Genel Bakis ──────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Brand Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Info</CardTitle>
                <CardDescription>{brand.domain}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Type" value={brand.type} />
                <Row label="Sector" value={brand.sector ?? "-"} />
                <Row label="City" value={brand.city ?? "-"} />
                <Row label="Categories" value={brand.businessCategories.join(", ") || "-"} />
                <Row label="Regions" value={brand.serviceRegions.join(", ") || "-"} />
                <Row label="Strengths" value={brand.strengths.join(", ") || "-"} />
                <Row label="Weaknesses" value={brand.weaknesses.join(", ") || "-"} />
                <Row label="Auto Scan" value={brand.autoScan ? "Yes" : "No"} />
                <Row label="Scan Interval" value={brand.scanInterval} />
                <Row label="Created" value={new Date(brand.createdAt).toLocaleDateString("tr-TR")} />
              </CardContent>
            </Card>

            {/* Platform Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Mention Summary</CardTitle>
                <CardDescription>Latest completed scan results</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(platformSummary).length > 0 ? (
                  <div className="space-y-3">
                    {PLATFORMS.map((platform) => {
                      const ps = platformSummary[platform];
                      if (!ps) return null;
                      const pct = ps.total > 0 ? Math.round((ps.mentioned / ps.total) * 100) : 0;
                      return (
                        <div key={platform}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-medium capitalize">{platform}</span>
                            <span>
                              {ps.mentioned}/{ps.total} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No scan data yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4">
                  <StatBox label="Prompts" value={prompts.length} />
                  <StatBox label="Scans" value={scans.length} />
                  <StatBox label="Competitors" value={competitors.length} />
                  <StatBox label="Checklist Items" value={checklistItems.length} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Sorular ──────────────────────────────── */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompts ({prompts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {prompts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[300px]">Prompt</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Active</TableHead>
                        {PLATFORMS.map((p) => (
                          <TableHead key={p} className="text-center capitalize">
                            {p}
                          </TableHead>
                        ))}
                        <TableHead>Last Scan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                          <TableCell className="max-w-[400px] text-sm">
                            {prompt.text}
                          </TableCell>
                          <TableCell>
                            {prompt.category ? (
                              <Badge variant="outline">{prompt.category}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={prompt.isActive ? "default" : "secondary"}>
                              {prompt.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          {PLATFORMS.map((platform) => {
                            const r = prompt.platformResults[platform];
                            return (
                              <TableCell key={platform} className="text-center">
                                {r ? (
                                  r.mentioned ? (
                                    <span className="text-green-600" title={r.position ?? ""}>
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-red-400">✗</span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-xs text-muted-foreground">
                            {prompt.lastScanAt
                              ? new Date(prompt.lastScanAt).toLocaleDateString("tr-TR")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No prompts yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Taramalar ────────────────────────────── */}
        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle>Scan History (Last 5)</CardTitle>
            </CardHeader>
            <CardContent>
              {scans.length > 0 ? (
                <div className="space-y-2">
                  {scans.map((scan) => (
                    <div key={scan.id} className="rounded-lg border">
                      <button
                        onClick={() =>
                          setExpandedScan(expandedScan === scan.id ? null : scan.id)
                        }
                        className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={STATUS_COLORS[scan.status] ?? "secondary"}>
                            {scan.status}
                          </Badge>
                          <span className="text-sm">
                            {new Date(scan.startedAt).toLocaleString("tr-TR")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {scan.resultCount} results
                          </span>
                        </div>
                        {expandedScan === scan.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {expandedScan === scan.id && (
                        <div className="border-t p-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Started:</span>{" "}
                              {new Date(scan.startedAt).toLocaleString("tr-TR")}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Completed:</span>{" "}
                              {scan.completedAt
                                ? new Date(scan.completedAt).toLocaleString("tr-TR")
                                : "-"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Results:</span>{" "}
                              {scan.resultCount}
                            </div>
                            <div>
                              <span className="text-muted-foreground">ID:</span>{" "}
                              <span className="font-mono text-xs">{scan.id}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No scans yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Audit ────────────────────────────────── */}
        <TabsContent value="audit">
          {auditCategories.length > 0 ? (
            <div className="space-y-4">
              {auditCategories.map((cat) => (
                <Card key={cat.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                      <Badge variant="outline">Score: {cat.score}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Check</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Detail</TableHead>
                          <TableHead>Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.checks.map((check) => (
                          <TableRow key={check.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {AUDIT_STATUS_ICON[check.status] ?? check.status}
                                <span className="text-xs capitalize">{check.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{check.label}</TableCell>
                            <TableCell>{check.score}</TableCell>
                            <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                              {check.detail ?? "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                              {check.recommendation ?? "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No audit data yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Gelisim Plani ────────────────────────── */}
        <TabsContent value="checklist">
          {checklistItems.length > 0 ? (
            <div className="space-y-6">
              {[1, 2, 3].map((layer) => {
                const items = checklistByLayer[layer];
                if (!items || items.length === 0) return null;
                return (
                  <Card key={layer}>
                    <CardHeader>
                      <CardTitle>Layer {layer}</CardTitle>
                      <CardDescription>
                        {items.filter((i) => i.status === "complete").length}/{items.length} completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Impact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {CHECKLIST_STATUS_ICON[item.status] ?? item.status}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {item.itemNumber}
                              </TableCell>
                              <TableCell className="text-sm">{item.simpleTitle}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.difficulty === "EASY"
                                      ? "secondary"
                                      : item.difficulty === "HARD"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {item.difficulty}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.impact === "HIGH"
                                      ? "default"
                                      : item.impact === "LOW"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {item.impact}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No checklist items yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Rakipler ─────────────────────────────── */}
        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Competitors ({competitors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {competitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Mention Score</TableHead>
                      <TableHead>Readiness</TableHead>
                      <TableHead>Relevance</TableHead>
                      {PLATFORMS.map((p) => (
                        <TableHead key={p} className="text-center capitalize">
                          {p}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((c) => {
                      const platforms = (c.platforms ?? {}) as Record<string, number>;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="font-mono text-xs">{c.domain}</TableCell>
                          <TableCell>{c.mentionScore}</TableCell>
                          <TableCell>{c.readinessScore}</TableCell>
                          <TableCell>
                            <Badge variant={c.relevance === "direct" ? "default" : "secondary"}>
                              {c.relevance}
                            </Badge>
                          </TableCell>
                          {PLATFORMS.map((p) => (
                            <TableCell key={p} className="text-center text-sm">
                              {platforms[p] !== undefined ? platforms[p] : "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No competitors yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Kaynaklar ────────────────────────────── */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Source Domains ({sourceDomains.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceDomains.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage %</TableHead>
                      <TableHead>Avg Citations</TableHead>
                      <TableHead>URLs</TableHead>
                      <TableHead>Action Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceDomains.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.domain}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.type}</Badge>
                        </TableCell>
                        <TableCell>{s.usagePercent.toFixed(1)}%</TableCell>
                        <TableCell>{s.avgCitations.toFixed(1)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.urls.length} URLs
                        </TableCell>
                        <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                          {s.actionNote ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No source domains yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Ayarlar ──────────────────────────────── */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Edit Brand</CardTitle>
              <CardDescription>Update brand information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Domain</label>
                  <Input
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Sector</label>
                  <Input
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Competitor Names (comma-separated)
                  </label>
                  <Input
                    value={editCompetitorNames}
                    onChange={(e) => setEditCompetitorNames(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Competitor Domains (comma-separated)
                  </label>
                  <Input
                    value={editCompetitorDomains}
                    onChange={(e) => setEditCompetitorDomains(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Save Changes
                </Button>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger>
                    <Button variant="destructive">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete Brand
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Brand</DialogTitle>
                      <DialogDescription>
                        This will permanently delete &quot;{brand.name}&quot; and all associated
                        data (prompts, scans, results, competitors, etc.). This action cannot
                        be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
