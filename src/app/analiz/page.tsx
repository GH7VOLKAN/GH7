import Link from "next/link";
import { GH7Logo } from "@/components/gh7-logo";
import { FlowContainer } from "./_components/flow-container";
import { isValidDomain, normalizeDomain } from "@/lib/analiz/domain";
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
  force?: string;
};

/**
 * /analiz sayfası — landing kapı section'undan buraya yönlendiriliyor.
 * Query paramları:
 *   type: firma | kisi | eticaret | export
 *   domain | name | input: input değeri (tipine göre)
 *   force: "1" ise cache bypass (Pro kullanıcı)
 */
export default async function AnalizPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const door: Door =
    sp.type === "kisi" || sp.type === "eticaret" || sp.type === "export"
      ? sp.type
      : "firma";

  const rawInput = sp.domain ?? sp.name ?? sp.input ?? "";
  const domain = normalizeDomain(rawInput);
  const valid = isValidDomain(domain);
  const forceRefresh = sp.force === "1";

  return (
    <main className={s.page}>
      <div className={s.topbar}>
        <Link
          href="/"
          style={{ color: "var(--black)", textDecoration: "none" }}
        >
          <GH7Logo size="sm" />
        </Link>
        <span className={s.topbarStep}>
          ücretsiz analiz · {door}
        </span>
      </div>

      {!valid ? (
        <div className={s.errorBox}>
          <strong>Geçersiz giriş.</strong> Lütfen ana sayfaya dönüp tekrar dene.
          <br />
          <Link
            href="/#test"
            style={{
              display: "inline-block",
              marginTop: 12,
              color: "var(--black)",
              textDecoration: "underline",
            }}
          >
            ← Ana sayfa
          </Link>
        </div>
      ) : (
        <FlowContainer
          domain={domain}
          door={door}
          forceRefresh={forceRefresh}
        />
      )}
    </main>
  );
}
