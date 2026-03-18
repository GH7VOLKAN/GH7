"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Shield,
  Server,
  Database,
  Clock,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Power,
  Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────

interface SettingsData {
  adminEmails: string[];
  envStatus: { name: string; set: boolean }[];
  aiProviders: { name: string; envKey: string; configured: boolean }[];
  cronJobs: { path: string; schedule: string }[];
  appVersion: string;
  nodeVersion: string;
  dbStatus: string;
}

// ── Helpers ────────────────────────────────────────────

function cronToHuman(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;
  const [min, hour, dom, , dow] = parts;

  const days: Record<string, string> = {
    "0": "Pazar",
    "1": "Pazartesi",
    "2": "Sal\u0131",
    "3": "\u00c7ar\u015famba",
    "4": "Per\u015fembe",
    "5": "Cuma",
    "6": "Cumartesi",
  };

  let schedule = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

  if (dom !== "*") {
    schedule += ` - Ay\u0131n ${dom}. g\u00fcn\u00fc`;
  } else if (dow !== "*") {
    const dayNames = dow.split(",").map((d) => days[d] ?? d).join(", ");
    schedule += ` - ${dayNames}`;
  } else {
    schedule += " - Her g\u00fcn";
  }

  return schedule;
}

// ── Component ──────────────────────────────────────────

export default function AdminSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [providerResults, setProviderResults] = useState<Record<string, "ok" | "error">>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const testProvider = async (envKey: string) => {
    setTestingProvider(envKey);
    try {
      const res = await fetch("/api/debug/providers");
      if (res.ok) {
        const json = await res.json();
        // Try to determine status from response
        const providerMap: Record<string, string> = {
          OPENAI_API_KEY: "openai",
          ANTHROPIC_API_KEY: "anthropic",
          GOOGLE_AI_API_KEY: "google",
          PERPLEXITY_API_KEY: "perplexity",
        };
        const key = providerMap[envKey];
        if (key && json[key]) {
          setProviderResults((prev) => ({
            ...prev,
            [envKey]: json[key].status === "ok" ? "ok" : "error",
          }));
        } else {
          setProviderResults((prev) => ({ ...prev, [envKey]: "ok" }));
        }
      } else {
        setProviderResults((prev) => ({ ...prev, [envKey]: "error" }));
      }
    } catch {
      setProviderResults((prev) => ({ ...prev, [envKey]: "error" }));
    } finally {
      setTestingProvider(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Ayarlar</h1>
        <div className="grid gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-destructive">Ayarlar y\u00fcklenemedi.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Ayarlar</h1>

      <div className="grid gap-6">
        {/* Admin Emails */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Admin E-postalar\u0131</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {email}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Admin e-postalar\u0131 <code className="rounded bg-muted px-1">src/lib/admin.ts</code> dosyas\u0131nda hardcoded olarak tan\u0131mlanm\u0131\u015ft\u0131r.
            </p>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Ortam De\u011fi\u015fkenleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.envStatus.map((env) => (
                <div
                  key={env.name}
                  className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  {env.set ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span className="truncate font-mono text-xs">{env.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Sa\u011flay\u0131c\u0131lar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.aiProviders.map((provider) => (
                <div
                  key={provider.envKey}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {provider.configured ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {provider.envKey}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {providerResults[provider.envKey] && (
                      <Badge
                        variant={
                          providerResults[provider.envKey] === "ok"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {providerResults[provider.envKey] === "ok" ? "OK" : "Hata"}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!provider.configured || testingProvider === provider.envKey}
                      onClick={() => testProvider(provider.envKey)}
                    >
                      {testingProvider === provider.envKey ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cron Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Zamanlanm\u0131\u015f G\u00f6revler (Cron)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.cronJobs.length > 0 ? (
              <div className="space-y-2">
                {data.cronJobs.map((cron) => (
                  <div
                    key={cron.path}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-mono text-sm">{cron.path}</p>
                      <p className="text-xs text-muted-foreground">
                        {cronToHuman(cron.schedule)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {cron.schedule}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                vercel.json i\u00e7inde cron job bulunamad\u0131.
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Sistem Bilgisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Uygulama Versiyonu</p>
                <p className="text-sm font-semibold">v{data.appVersion}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Node.js Versiyonu</p>
                <p className="text-sm font-semibold">{data.nodeVersion}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Veritaban\u0131 Durumu</p>
                <div className="flex items-center gap-1.5">
                  {data.dbStatus === "connected" ? (
                    <Database className="h-4 w-4 text-green-500" />
                  ) : (
                    <Database className="h-4 w-4 text-red-500" />
                  )}
                  <p className="text-sm font-semibold">
                    {data.dbStatus === "connected" ? "Ba\u011fl\u0131" : "Ba\u011flant\u0131 Yok"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base text-destructive">Tehlikeli B\u00f6lge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">\u00d6nbellek Temizle</p>
                  <p className="text-xs text-muted-foreground">
                    T\u00fcm \u00f6nbellekleri temizle
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Temizle
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Bak\u0131m Modu</p>
                  <p className="text-xs text-muted-foreground">
                    Uygulamay\u0131 bak\u0131m moduna al
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  <Power className="mr-1 h-3 w-3" />
                  Etkinle\u015ftir
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Bu \u00f6zellikler hen\u00fcz aktif de\u011fildir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
