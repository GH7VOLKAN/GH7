import { NextResponse } from "next/server";
import { getAdminUser, ADMIN_EMAILS } from "@/lib/admin";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Environment variables to check
const ENV_VARS = [
  // Supabase
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  // Database
  "DATABASE_URL",
  "DIRECT_URL",
  // AI Providers
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_AI_API_KEY",
  "PERPLEXITY_API_KEY",
  // Payment
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  // Email
  "RESEND_API_KEY",
  // Redis
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  // App
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
];

const AI_PROVIDERS = [
  { name: "OpenAI (ChatGPT)", envKey: "OPENAI_API_KEY" },
  { name: "Anthropic (Claude)", envKey: "ANTHROPIC_API_KEY" },
  { name: "Google AI (Gemini)", envKey: "GOOGLE_AI_API_KEY" },
  { name: "Perplexity", envKey: "PERPLEXITY_API_KEY" },
];

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Environment variable status
  const envStatus = ENV_VARS.map((name) => ({
    name,
    set: !!process.env[name],
  }));

  // AI provider status
  const aiProviders = AI_PROVIDERS.map((p) => ({
    name: p.name,
    envKey: p.envKey,
    configured: !!process.env[p.envKey],
  }));

  // Cron jobs from vercel.json
  let cronJobs: { path: string; schedule: string }[] = [];
  try {
    const vercelJsonPath = path.join(process.cwd(), "vercel.json");
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, "utf-8"));
    cronJobs = vercelJson.crons ?? [];
  } catch {
    // vercel.json might not exist locally
  }

  // App version from package.json
  let appVersion = "unknown";
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    appVersion = pkg.version;
  } catch {
    // ignore
  }

  // Database status
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  return NextResponse.json({
    adminEmails: ADMIN_EMAILS,
    envStatus,
    aiProviders,
    cronJobs,
    appVersion,
    nodeVersion: process.version,
    dbStatus,
  });
}

export async function PUT() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error: "Admin emails are hardcoded. Edit src/lib/admin.ts to change.",
    },
    { status: 501 }
  );
}
