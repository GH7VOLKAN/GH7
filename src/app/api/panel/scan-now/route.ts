/**
 * /api/panel/scan-now
 *
 * Authenticated kullanıcı kendi brand'i için manuel scan başlatır.
 * GET ile çalışır — browser'dan tek tıkla çağrılabilir.
 *
 * Kullanım: Kullanıcı /analiz yaptıktan sonra prompt'ları var ama
 * PromptResult boş ise (scan çalışmamış). Bu endpoint scan'i tetikler,
 * 5 AI provider'a 13 sorgu atar, sonuçları PromptResult tablosuna yazar.
 *
 * Background execution — response hemen döner.
 */

import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveBrand } from "@/lib/dal/brand";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function cleanupStuckScans(brandId: string) {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const stuck = await prisma.scan.updateMany({
    where: {
      brandId,
      status: "running",
      startedAt: { lt: tenMinutesAgo },
    },
    data: { status: "failed", completedAt: new Date() },
  });
  if (stuck.count > 0) {
    console.warn(`[scan-now] Cleaned up ${stuck.count} stuck scans`);
  }
}

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json(
        { error: "Oturum veya marka yok. /giris → /analiz yapın." },
        { status: 401 },
      );
    }

    const brand = activeBrand.brand;

    // Provider kontrol
    const platforms = getAvailablePlatforms();
    if (platforms.length === 0) {
      return NextResponse.json(
        {
          error:
            "Hiçbir AI provider aktif değil. Vercel env vars'da API key'ler eksik.",
        },
        { status: 503 },
      );
    }

    // Prompt var mı?
    const promptCount = await prisma.prompt.count({
      where: { brandId: brand.id, isActive: true },
    });
    if (promptCount === 0) {
      return NextResponse.json(
        {
          error:
            "Bu markada sorgu yok. Önce /analiz üzerinden analiz yaptırın.",
        },
        { status: 400 },
      );
    }

    // Stuck scan'leri temizle
    await cleanupStuckScans(brand.id);

    // Zaten running scan var mı?
    const running = await prisma.scan.findFirst({
      where: { brandId: brand.id, status: "running" },
    });
    if (running) {
      return NextResponse.json({
        info: "Zaten çalışan scan var",
        scanId: running.id,
        status: "running",
        startedAt: running.startedAt,
      });
    }

    // Yeni scan oluştur
    const scan = await prisma.scan.create({
      data: {
        brandId: brand.id,
        status: "pending",
        type: "manual",
      },
    });

    console.log(
      `[scan-now] Scan queued scanId=${scan.id} brandId=${brand.id} prompts=${promptCount} platforms=${platforms.length}`,
    );

    // Background execution
    after(async () => {
      const start = Date.now();
      try {
        console.log(`[scan-now] executeScan() başlıyor scanId=${scan.id}`);
        await executeScan(scan.id, brand.id);
        const elapsed = Date.now() - start;
        const finalScan = await prisma.scan.findUnique({
          where: { id: scan.id },
          include: { _count: { select: { results: true } } },
        });
        console.log(
          `[scan-now] ✅ Completed scanId=${scan.id} status=${finalScan?.status} results=${finalScan?._count.results} elapsed=${elapsed}ms`,
        );
      } catch (e) {
        const elapsed = Date.now() - start;
        console.error(
          `[scan-now] ❌ FAILED scanId=${scan.id} elapsed=${elapsed}ms error:`,
          e instanceof Error ? `${e.name}: ${e.message}` : String(e),
        );
        if (e instanceof Error && e.stack) {
          console.error(`[scan-now] Stack:`, e.stack.slice(0, 500));
        }
        try {
          await prisma.scan.update({
            where: { id: scan.id },
            data: { status: "failed", completedAt: new Date() },
          });
        } catch {}
      }
    });

    return NextResponse.json({
      success: true,
      scanId: scan.id,
      brandId: brand.id,
      brandName: brand.name,
      promptCount,
      platformCount: platforms.length,
      platforms,
      message:
        "Scan başlatıldı. Birkaç dakika sonra /api/panel/scan-diagnostic üzerinden kontrol edin. Sonuçlar /panel/aramalar sayfasında görünecek.",
      checkBackUrl: "/api/panel/scan-diagnostic",
      startedAt: scan.startedAt,
    });
  } catch (err) {
    console.error("[scan-now] Error:", err);
    return NextResponse.json(
      {
        error: "Scan başlatılamadı",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
