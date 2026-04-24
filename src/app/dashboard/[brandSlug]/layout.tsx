/**
 * /dashboard/[brandSlug]/* layout (Brief H-ext Aşama 1).
 *
 * URL'deki brandSlug'ın user'a ait + gate=FIRMA olduğunu doğrular.
 * Aksi halde:
 *   - Brand bulunamadı → default brand'a redirect
 *   - Gate !== FIRMA → coming-soon fallback (ileride diğer kapılar eklenince aktif)
 */

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { GateComingSoon } from "./_components/gate-coming-soon";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandSlug: string }>;

export default async function BrandScopedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { brandSlug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/analiz");

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    select: { id: true, slug: true, gate: true, name: true },
  });

  if (!brand) {
    // Slug yanlış — default brand'a redirect
    const fallback = await prisma.brand.findFirst({
      where: { profileId: user.id },
      orderBy: { createdAt: "desc" },
      select: { slug: true },
    });
    if (fallback?.slug) redirect(`/dashboard/${fallback.slug}`);
    redirect("/analiz");
  }

  // Şimdilik sadece FIRMA kapısı aktif — diğer kapılar coming-soon
  if (brand.gate !== "FIRMA") {
    return <GateComingSoon gate={brand.gate} brandName={brand.name} />;
  }

  return <>{children}</>;
}

// Alt sayfaların notFound() çağırdığında Next.js bu seviyedeki
// not-found.tsx'i arar. Eklemiyoruz — global fallback yeterli.
export { notFound };
