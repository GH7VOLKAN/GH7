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
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface HealthData {
  status: string;
  timestamp: string;
  checks: {
    database: boolean;
    envVars: Record<string, boolean>;
    providers: number;
  };
  version: string;
}

interface ProviderData {
  status: string;
  envVars: Record<string, boolean>;
  liveTests: Record<
    string,
    { ok: boolean; chars?: number; error?: string; ms: number }
  >;
  timestamp: string;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <Badge variant="default">
      <CheckCircle className="mr-1 h-3 w-3" />
      OK
    </Badge>
  ) : (
    <Badge variant="destructive">
      <XCircle className="mr-1 h-3 w-3" />
      FAIL
    </Badge>
  );
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [providers, setProviders] = useState<ProviderData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [testingProviders, setTestingProviders] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      setHealth(json);
    } catch (err) {
      console.error("Health check failed:", err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchProviders = async () => {
    setLoadingProviders(true);
    setTestingProviders(true);
    try {
      const res = await fetch("/api/debug/providers");
      const json = await res.json();
      setProviders(json);
    } catch (err) {
      console.error("Provider check failed:", err);
    } finally {
      setLoadingProviders(false);
      setTestingProviders(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchProviders();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">API Sağlığı</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>System Health</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchHealth}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingHealth ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant={
                      health.status === "healthy" ? "default" : "destructive"
                    }
                  >
                    {health.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Database:</span>
                  <StatusBadge ok={health.checks.database} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">AI Providers:</span>
                  <span className="text-sm">
                    {health.checks.providers} configured
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Version: {health.version} | Last checked:{" "}
                  {new Date(health.timestamp).toLocaleString("tr-TR")}
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">
                Failed to load health data.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Env Vars */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHealth ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : health ? (
              <div className="space-y-2">
                {Object.entries(health.checks.envVars).map(([key, ok]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <code className="text-xs">{key}</code>
                    <StatusBadge ok={ok} />
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Provider Tests */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI Provider Live Tests</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProviders}
            disabled={testingProviders}
          >
            {testingProviders ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Test All
          </Button>
        </CardHeader>
        <CardContent>
          {loadingProviders ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : providers ? (
            <div className="space-y-3">
              {/* Overall status */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium">Overall:</span>
                <Badge
                  variant={
                    providers.status === "ALL_OK" ? "default" : "destructive"
                  }
                >
                  {providers.status}
                </Badge>
              </div>

              {/* Env vars configured */}
              <div className="mb-4 flex flex-wrap gap-3">
                {Object.entries(providers.envVars).map(([key, ok]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                    {ok ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <code>{key}</code>
                  </div>
                ))}
              </div>

              {/* Live test results */}
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(providers.liveTests).map(
                  ([provider, result]) => (
                    <div
                      key={provider}
                      className="rounded-lg border border-border/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {provider.replace("_", " ")}
                        </span>
                        <StatusBadge ok={result.ok} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {result.ok ? (
                          <span>
                            {result.chars} chars | {result.ms}ms
                          </span>
                        ) : (
                          <span className="text-destructive">
                            {result.error}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Last tested:{" "}
                {new Date(providers.timestamp).toLocaleString("tr-TR")}
              </div>
            </div>
          ) : (
            <p className="text-sm text-destructive">
              Failed to load provider data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
