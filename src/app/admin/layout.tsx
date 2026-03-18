import { redirect } from "next/navigation";
import { getAdminUser, ADMIN_EMAILS } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First check if user is logged in at all
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await getAdminUser();

  if (!admin) {
    // User is logged in but not admin — show access denied instead of redirect loop
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Erişim Reddedildi</h1>
          <p className="text-neutral-500">Bu sayfaya erişim yetkiniz yok.</p>
          <p className="text-sm text-neutral-400">Giriş yapılan email: {user.email}</p>
          <p className="text-xs text-neutral-300">İzin verilen: {ADMIN_EMAILS.join(", ")}</p>
          <a href="/dashboard/genel" className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm">
            Dashboard'a Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar email={admin.email ?? ""} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
