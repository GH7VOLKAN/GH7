import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Confirm text check
    const { confirmText } = await req.json();
    if (confirmText !== "HESABIMI SİL") {
      return NextResponse.json(
        { error: "Onay metni yanlış. 'HESABIMI SİL' yazın." },
        { status: 400 }
      );
    }

    // 3. Get profile
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });
    if (!profile)
      return NextResponse.json(
        { error: "Profil bulunamadı" },
        { status: 404 }
      );

    // 4. Cancel İyzico subscription if active
    if (profile.iyzicoSubscriptionRef) {
      try {
        console.log(
          `[account-delete] İyzico abonelik iptal: ${profile.iyzicoSubscriptionRef}`
        );
        // TODO: İyzico subscription cancellation integration
      } catch (err) {
        console.error("[account-delete] İyzico iptal hatası:", err);
        // Continue with deletion even if İyzico cancel fails
      }
    }

    // 5. Delete profile (cascades to brands, payments, and all related data)
    await prisma.profile.delete({ where: { id: user.id } });

    // 6. Delete from Supabase Auth using admin client
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error(
        "[account-delete] Supabase Auth silme hatası:",
        authDeleteError
      );
    }

    // 7. Send confirmation email (best effort)
    try {
      const { sendAccountDeletionEmail } = await import(
        "@/lib/email/resend"
      );
      await sendAccountDeletionEmail(profile.email, {
        deletionDate: new Date().toLocaleDateString("tr-TR"),
        confirmUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://gh7.ai",
      });
    } catch {
      // Email failure is not critical
    }

    // 8. Sign out the session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[account-delete] Hata:", error);
    return NextResponse.json(
      { error: "Hesap silinemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
