"use client";

import { useState } from "react";
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
import { sourceTypeLabels, type SourceType } from "@/lib/types";
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, GlobeIcon } from "lucide-react";

interface SourceDomain {
  id: string;
  domain: string;
  type: SourceType;
  usagePercent: number;
  avgCitations: number;
  urls: string[];
  actionNote: string | null;
}

interface SourceTableProps {
  sourceDomains: SourceDomain[];
}

export function SourceTable({ sourceDomains }: SourceTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (sourceDomains.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GlobeIcon className="mx-auto size-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Henuz kaynak domain verisi yok. Tarama sonrasi yapay zekanin referans gosterdigi kaynaklar burada gorunecek.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaynak Domainler</CardTitle>
        <CardDescription>
          Yapay zekalarin yanitlarinda referans gosterdigi kaynaklar — satira tiklayarak URL&apos;leri gorun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Tur</TableHead>
                <TableHead>Kullanim</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Ort. Atif
                </TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceDomains.map((source) => {
                const isExpanded = expandedId === source.id;
                return (
                  <SourceRow
                    key={source.id}
                    source={source}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedId(isExpanded ? null : source.id)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SourceRow({
  source,
  isExpanded,
  onToggle,
}: {
  source: SourceDomain;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {source.urls.length > 0 ? (
              isExpanded ? (
                <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
              )
            ) : (
              <GlobeIcon className="size-4 text-muted-foreground shrink-0" />
            )}
            <div>
              <a
                href={`https://${source.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {source.domain}
              </a>
              {source.urls.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {source.urls.length} URL takip ediliyor
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-muted-foreground">
            {sourceTypeLabels[source.type]}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold tabular-nums">
              %{source.usagePercent}
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${source.usagePercent}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">
          {source.avgCitations.toFixed(1)}
        </TableCell>
        <TableCell className="text-right">
          {source.actionNote ? (
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-xs text-muted-foreground text-right max-w-[180px]">
                {source.actionNote}
              </p>
              <a
                href={`https://${source.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon className="size-3" />
                Siteye Git
              </a>
            </div>
          ) : (
            <a
              href={`https://${source.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </TableCell>
      </TableRow>
      {/* Expanded URL list */}
      {isExpanded && source.urls.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/30 py-3 px-6">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Referans gosterilen URL&apos;ler:
            </p>
            <div className="flex flex-col gap-1.5">
              {source.urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                >
                  <ExternalLinkIcon className="size-3 shrink-0" />
                  {url}
                </a>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
