import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/operator";
import { PanelNav } from "@/components/panel/PanelNav";

export default async function PanelAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOperator(user.email)) redirect("/panel/login");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Suspense fallback={<div style={{ width: 256, flexShrink: 0 }} />}>
        <PanelNav />
      </Suspense>
      <main style={{ flex: 1, padding: "40px 32px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
