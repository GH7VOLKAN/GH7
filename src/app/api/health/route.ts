import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableProviders } from "@/lib/ai/provider-registry";
import { getAllStatuses } from "@/lib/ai/circuit-breaker";

const ENV_VARS_TO_CHECK = [
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_AI_API_KEY",
  "PERPLEXITY_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

export async function GET() {
  const timestamp = new Date().toISOString();

  // 1. Check database connection
  let databaseOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch {
    // database unreachable
  }

  // 2. Check env vars
  const envVars: Record<string, boolean> = {};
  for (const key of ENV_VARS_TO_CHECK) {
    envVars[key] = Boolean(process.env[key]);
  }

  // 3. Check AI providers configured
  let providerCount = 0;
  try {
    providerCount = getAvailableProviders().length;
  } catch {
    // provider registry error
  }

  // 4. Circuit breaker statuses
  const circuitBreakers = getAllStatuses();
  const openCircuits = Object.entries(circuitBreakers).filter(
    ([, v]) => v.state === "open"
  );

  const isHealthy = databaseOk && providerCount > 0;
  const isDegraded = openCircuits.length > 0;

  const body = {
    status: isHealthy ? (isDegraded ? "degraded" : "healthy") : "unhealthy",
    timestamp,
    checks: {
      database: databaseOk,
      envVars,
      providers: providerCount,
      circuitBreakers,
    },
    version: "1.0.0",
  };

  return NextResponse.json(body, { status: isHealthy ? 200 : 500 });
}
