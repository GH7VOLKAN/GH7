import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { FlowContainer } from "./_components/flow-container";
import { normalizeDomain } from "@/lib/analiz/domain";
import type { Door } from "@/lib/analiz/types";
import s from "./analiz.module.css";

export const metadata = {
  title: "Analiz — GH7.ai",
  description: "Yapay zekada markanın görünürlüğü — 60 saniyede.",
};

type SearchParams = {
  type?: string;
  domain?: string;
  name?: string;
  input?: string;
};

/**
 * /analiz sayfası — landing kapı section'undan buraya yönlendiriliyor.
 * Query paramları:
 *   type: firma | kisi | eticaret | yurtdisi (eski "export" → "yurtdisi" map)
 *   domain | name | input: prefill değeri (firma/eticaret/yurtdisi için)
 * Gerçek input toplama + validation InputStage component'inde.
 */
export default async function AnalizPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const door: Door = (() => {
    if (sp.type === "kisi" || sp.type === "eticaret" || sp.type === "yurtdisi") {
      return sp.type;
    }
    if (sp.type === "export") return "yurtdisi"; // geriye uyumluluk
    return "firma";
  })();

  const rawInput = sp.domain ?? sp.name ?? sp.input ?? "";
  const initialDomain = rawInput ? normalizeDomain(rawInput) : undefined;

  return (
    <main className={s.page}>
      <div className={s.topbar}>
        <Link
          href="/"
          style={{ color: "var(--black)", textDecoration: "none" }}
        >
          <GH7Logo size="sm" />
        </Link>
        <span className={s.topbarStep}>ücretsiz analiz · {door}</span>
      </div>

      <FlowContainer initialDoor={door} initialDomain={initialDomain} />
    </main>
  );
}
