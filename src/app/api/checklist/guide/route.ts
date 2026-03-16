import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

/**
 * POST /api/checklist/guide
 * "Adım adım yapayım" — Opus ile kullanıcıya özel DIY rehber üretimi.
 * Spec H: Tıklandığında üretilir, önceden değil (maliyet optimizasyonu).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brandId, checklistItemId } = body;

  if (!brandId || !checklistItemId) {
    return NextResponse.json(
      { error: "brandId and checklistItemId required" },
      { status: 400 },
    );
  }

  // Verify ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profile: { id: user.id } },
    include: { profile: { select: { plan: true } } },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (brand.profile?.plan === "free") {
    return NextResponse.json(
      { error: "Pro plan required" },
      { status: 403 },
    );
  }

  // Get checklist item
  const item = await prisma.checklistItem.findFirst({
    where: { id: checklistItemId, brandId },
  });

  if (!item) {
    return NextResponse.json(
      { error: "Checklist item not found" },
      { status: 404 },
    );
  }

  // Get latest audit and scan data for context
  const [latestAudit, latestScore] = await Promise.all([
    prisma.auditCategory.findMany({
      where: { brandId },
      include: { checks: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.scoreHistory.findFirst({
      where: { brandId },
      orderBy: { date: "desc" },
    }),
  ]);

  // Get top competitor for context
  const topCompetitor = await prisma.competitor.findFirst({
    where: { brandId },
    orderBy: { mentionScore: "desc" },
  });

  const technicalDetail =
    typeof item.technicalDetail === "object" && item.technicalDetail
      ? item.technicalDetail
      : {};

  // Generate DIY guide with Opus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 },
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `Sen GH7.ai'nin DIY (kendin yap) rehber yazarısın.

KULLANICI:
- İsim: ${brand.name}
- ${brand.type === "kisisel" ? `Meslek: ${brand.profession}` : `Sektör: ${brand.sector}`}
- Şehir: ${brand.city || "belirtilmedi"}
- Domain: ${brand.domain}
- Görünürlük Puanı: ${latestScore?.mentionScore ?? "bilinmiyor"}/100

MADDE:
- Başlık: ${item.simpleTitle}
- Açıklama: ${item.simpleDescription}
- Zorluk: ${item.difficulty}
- Etki: ${item.impact}
- Teknik Detay: ${JSON.stringify(technicalDetail)}
${item.competitorNote ? `- Rakip Durumu: ${item.competitorNote}` : ""}
${topCompetitor ? `- En Güçlü Rakip: ${topCompetitor.name} (${topCompetitor.mentionScore}/100)` : ""}

AUDIT DURUMU:
${latestAudit.map((cat) => `${cat.name}: ${cat.checks.map((c) => `${c.label}=${c.status}`).join(", ")}`).join("\n")}

Bu kullanıcı için adım adım, kişiselleştirilmiş uygulama rehberi yaz.

KURALLAR:
- Doktor abi dili — teknik terim kullanma
- Her adım somut ve yapılabilir olsun
- Adım sayısı: 5-12 arası
- Kullanıcının sektörüne/mesleğine özel örnekler ver
- Tahmini süre ver
- Zorluk belirt
- Sonunda: "Bu adımları tamamladıysan aşağıdaki butona bas"

JSON döndür — başka hiçbir şey yazma:
{
  "title": "rehber başlığı",
  "estimatedTime": "süre",
  "difficulty": "zorluk açıklaması",
  "steps": [
    {
      "stepNumber": 1,
      "title": "adım başlığı",
      "description": "detaylı açıklama",
      "tip": "ipucu veya null"
    }
  ],
  "completionMessage": "tamamlandı mesajı"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `${brand.name} için "${item.simpleTitle}" rehberini üret.`,
        },
      ],
      system: systemPrompt,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    // Parse JSON response
    const jsonStr = text
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const guide = JSON.parse(jsonStr);

    return NextResponse.json({ guide });
  } catch (err) {
    console.error("[checklist-guide] Opus call failed:", err);
    return NextResponse.json(
      { error: "Rehber oluşturulurken bir hata oluştu" },
      { status: 500 },
    );
  }
}
