"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, UserPlus, Handshake, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  brandId: string;
  brandName: string;
  brandDomain: string;
  phone: string;
  timeSlot: string;
  status: string;
  createdAt: string;
}

interface Pipeline {
  new: number;
  contacted: number;
  agreed: number;
  completed: number;
}

interface LeadsData {
  leads: Lead[];
  pipeline: Pipeline;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "Iletisimde",
  agreed: "Anlasildi",
  completed: "Tamamlandi",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "destructive",
  contacted: "outline",
  agreed: "default",
  completed: "secondary",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PipelineCard({
  title,
  count,
  icon: Icon,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
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
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminAgencyPage() {
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleStatusChange(leadId: string, newStatus: string) {
    setUpdating(leadId);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        // Update local state
        setData((prev) => {
          if (!prev) return prev;
          const updatedLeads = prev.leads.map((l) =>
            l.id === leadId ? { ...l, status: newStatus } : l
          );
          // Recalculate pipeline
          const pipeline: Pipeline = { new: 0, contacted: 0, agreed: 0, completed: 0 };
          for (const lead of updatedLeads) {
            const s = lead.status as keyof Pipeline;
            if (s in pipeline) pipeline[s]++;
          }
          return { leads: updatedLeads, pipeline };
        });
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Ajans / Leadler</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-destructive">Lead verileri yuklenemedi.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Ajans / Leadler</h1>

      {/* Pipeline cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PipelineCard title="Yeni" count={data.pipeline.new} icon={UserPlus} />
        <PipelineCard title="Iletisimde" count={data.pipeline.contacted} icon={Phone} />
        <PipelineCard title="Anlasildi" count={data.pipeline.agreed} icon={Handshake} />
        <PipelineCard title="Tamamlandi" count={data.pipeline.completed} icon={CheckCircle} />
      </div>

      {/* Leads table */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Tum Leadler</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marka</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Istenen Zaman</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Henuz lead yok.
                  </TableCell>
                </TableRow>
              )}
              {data.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link
                      href={`/admin/brands/${lead.brandId}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {lead.brandName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {lead.brandDomain}
                    </p>
                  </TableCell>
                  <TableCell>{lead.phone || "-"}</TableCell>
                  <TableCell>{lead.timeSlot || "-"}</TableCell>
                  <TableCell>
                    {updating === lead.id ? (
                      <Badge variant="secondary">Guncelleniyor...</Badge>
                    ) : (
                      <Select
                        value={lead.status}
                        onValueChange={(val) => {
                          if (val) handleStatusChange(lead.id, val);
                        }}
                      >
                        <SelectTrigger size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <Badge
                                variant={STATUS_COLORS[value] ?? "secondary"}
                              >
                                {label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
