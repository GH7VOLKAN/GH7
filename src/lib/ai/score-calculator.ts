import { prisma } from "@/lib/db";

export async function calculateAndStoreScore(
  scanId: string,
  brandId: string,
): Promise<void> {
  const results = await prisma.promptResult.findMany({
    where: { scanId },
  });

  if (results.length === 0) return;

  // Weighted scoring: 1st=100, 2nd=75, 3rd=50, mentioned=25, not=0
  let totalPoints = 0;
  for (const r of results) {
    if (!r.mentioned) continue;
    switch (r.position) {
      case "1. sıra":
        totalPoints += 100;
        break;
      case "2. sıra":
        totalPoints += 75;
        break;
      case "3. sıra":
        totalPoints += 50;
        break;
      default:
        totalPoints += 25;
        break;
    }
  }

  const mentionScore = Math.round((totalPoints / (results.length * 100)) * 100);

  // Get current readinessScore from latest entry
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });
  const readinessScore = latestScore?.readinessScore ?? 0;

  // Upsert today's score
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.scoreHistory.upsert({
    where: { brandId_date: { brandId, date: today } },
    update: { mentionScore },
    create: { brandId, date: today, mentionScore, readinessScore },
  });
}
