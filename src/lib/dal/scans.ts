import { prisma } from "@/lib/db";
import { cache } from "react";

export const getLastScanInfo = cache(async (brandId: string) => {
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const runningScan = await prisma.scan.findFirst({
    where: { brandId, status: "running" },
  });

  return {
    lastCompletedAt: lastScan?.completedAt?.toISOString() ?? null,
    isRunning: !!runningScan,
    runningScanId: runningScan?.id ?? null,
  };
});
