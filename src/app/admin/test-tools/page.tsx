import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { AdminTestToolsContent } from "./admin-test-tools-content";

export const dynamic = "force-dynamic";

export default async function AdminTestToolsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/giris");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Test Araçları
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Geliştirme ve test için. Yapılan her işlem loglanır.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Giriş yapan: {admin.email}
          </p>
        </header>

        <AdminTestToolsContent adminEmail={admin.email ?? ""} />
      </div>
    </div>
  );
}
