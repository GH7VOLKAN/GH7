import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/dashboard");
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
