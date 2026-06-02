import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deriveQueries,
  collectForQuery,
  classifyAllSources,
  buildVisibilityText,
  assembleReport,
  type RunInput,
} from "@/lib/visibility-engine/run";
import { queryVerdicts } from "@/lib/visibility-engine/stage2/queryVerdicts";
import { analyzeOverview, analyzeQueryGap } from "@/lib/visibility-engine/stage2/analyze";
import { config } from "@/lib/visibility-engine/config";
import type { EngineResult, QuerySet } from "@/lib/visibility-engine/schema/types";
import type { Lang, GapItem } from "@/lib/report/types";
import type { OrderStatus } from "@/lib/panel-meta";

interface OrderForRun {
  id: string;
  report_lang: string;
  white_label: boolean;
  intake: Record<string, unknown> | null;
  clients: { name: string; domain: string | null; logo_url: string | null } | null;
  product_tiers: { prompt_count: number } | null;
}

type Admin = ReturnType<typeof createAdminClient>;

async function setStatus(admin: Admin, orderId: string, status: OrderStatus) {
  await admin.from("orders").update({ status }).eq("id", orderId);
}

/**
 * Durable order run. Each phase is a memoized step: if anything fails, Inngest
 * retries from the failed step — completed steps are NOT redone. Runs entirely
 * on Inngest's infra, so it survives Vercel timeouts, deploys and the operator
 * closing their laptop.
 */
export const orderRun = inngest.createFunction(
  {
    id: "order-run",
    concurrency: { limit: 3 },
    retries: 3,
    triggers: [{ event: "order/run.requested" }],
    onFailure: async ({ event }) => {
      const orderId = ((event.data as { event?: { data?: { orderId?: string } } })?.event?.data
        ?.orderId);
      if (orderId) await setStatus(createAdminClient(), orderId, "new");
    },
  },
  async ({ event, step }) => {
    const orderId = event.data.orderId as string;
    const admin = createAdminClient();

    // 1. Load order (memoized)
    const order = await step.run("load-order", async () => {
      const { data, error } = await admin
        .from("orders")
        .select(
          "id, report_lang, white_label, intake, clients(name, domain, logo_url), product_tiers(prompt_count)",
        )
        .eq("id", orderId)
        .single<OrderForRun>();
      if (error || !data) throw new Error("Sipariş bulunamadı.");
      if (!data.clients?.domain) throw new Error("Müşteri domaini tanımlı değil.");
      return data;
    });

    const domain = order.clients!.domain!;
    const brand = order.clients!.name ?? domain;
    const lang: Lang = order.report_lang === "en" ? "en" : "tr";
    const promptCount = order.product_tiers?.prompt_count ?? 10;
    const logoUrl = order.white_label ? order.clients!.logo_url ?? undefined : undefined;
    const competitorDomains = Array.isArray(order.intake?.competitorDomains)
      ? (order.intake!.competitorDomains as unknown[]).map(String)
      : [];
    const input: RunInput = { domain, brand, lang, competitorDomains, promptCount };
    if (logoUrl) input.logoUrl = logoUrl;

    await step.run("status-intake", () => setStatus(admin, orderId, "intake"));

    // 2. Stage 0 — queries (memoized)
    const { queries, business } = await step.run("stage0", () => deriveQueries(domain, promptCount));
    const qs: QuerySet = { business, brand, brandDomain: domain, competitors: competitorDomains, queries };

    await step.run("status-running", () => setStatus(admin, orderId, "running"));

    // 3. Stage 1 — one memoized step per query (resume skips done queries)
    const results: EngineResult[] = [];
    for (let i = 0; i < queries.length; i++) {
      const batch = await step.run(`collect-${i}`, async () => {
        const rs = await collectForQuery(queries[i], qs);
        // Drop bulky raw payloads from the memoized step output.
        return rs.map((r) => ({ ...r, raw: null }));
      });
      results.push(...(batch as EngineResult[]));
    }

    await step.run("status-analyzing", () => setStatus(admin, orderId, "analyzing"));

    // 4. Stage 1.5 + Stage 2
    const classified = await step.run("sources", () =>
      classifyAllSources(results, domain, competitorDomains),
    );
    const overview = await step.run("overview", () =>
      analyzeOverview({ brand, visibility: buildVisibilityText(results), classified }),
    );

    const verdicts = queryVerdicts(results, competitorDomains)
      .filter((v) => v.severity > 0)
      .slice(0, config.stage2.maxQueries);

    const gaps: GapItem[] = [];
    for (let i = 0; i < verdicts.length; i++) {
      const g = await step.run(`gap-${i}`, () =>
        analyzeQueryGap({ brand, brandDomain: domain, verdict: verdicts[i] }),
      );
      if (g) {
        gaps.push({
          query: g.query,
          diagnosis: g.diagnosis,
          contentGap: g.contentGap,
          faq: g.faq,
          jsonLd: g.jsonLd,
          actions: g.pageActions,
        });
      }
    }

    // 5. Assemble + persist
    const token = await step.run("write-report", async () => {
      const report = assembleReport(input, { results, classified, overview, gaps });
      const { data: rep, error } = await admin
        .from("reports")
        .insert({ order_id: orderId, lang, data: report })
        .select("token")
        .single<{ token: string }>();
      if (error || !rep) throw new Error("Rapor yazılamadı.");
      await admin
        .from("orders")
        .update({ status: "report", report_token: rep.token })
        .eq("id", orderId);
      return rep.token;
    });

    return { orderId, token };
  },
);
