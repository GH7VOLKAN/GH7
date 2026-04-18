import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { AdminResetButton } from "./admin-reset-button";

export const dynamic = "force-dynamic";

export default async function AdminTestToolsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/giris");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Test Araçları
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Geliştirme ve test için. Her işlem loglanır.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Giriş yapan: {admin.email}
          </p>
        </header>

        <section className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-900">⚠️ Tüm Veriyi Sıfırla</h2>
          <p className="mt-2 text-sm text-red-800">
            Bu işlem <strong>GERİ ALINAMAZ</strong>. Tüm kayıtları siler:
          </p>
          <ul className="mt-2 ml-5 list-disc text-sm text-red-800 space-y-0.5">
            <li>Tüm Supabase auth.users (senin hesabın dahil)</li>
            <li>Tüm Profile, Brand, GeoAudit, Scan, Prompt, Competitor</li>
            <li>Tüm Payment, Notification, VerificationCode, RateLimit</li>
          </ul>
          <p className="mt-3 text-sm text-red-800">
            Temizlik sonrası <code className="bg-white/50 px-1 py-0.5 rounded">/analiz</code>&apos;dan
            yeniden kayıt olabilirsin (free kullanıcı olarak).
          </p>
          <div className="mt-5">
            <AdminResetButton />
          </div>
        </section>
      </div>
    </div>
  );
}
