import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { reportClient } from "@/lib/report/supabase";
import { ReportRenderer } from "@/components/report/ReportRenderer";
import type { Report } from "@/lib/report/types";

// Link-only report — never index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();

  const supabase = reportClient();
  const { data, error } = await supabase.rpc("get_report", { p_token: token });
  if (error || !data) notFound();

  return <ReportRenderer report={data as Report} />;
}
