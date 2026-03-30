import type { PlatformKey } from "@/lib/types";
import { PlatformDots } from "./PlatformDots";
import { FirmFavicon } from "./FirmFavicon";
import { VerifiedBadge } from "./VerifiedBadge";

interface FirmRankingData {
  firmName: string;
  firmWebsite: string | null;
  platforms: PlatformKey[];
  platformCount: number;
  rankPosition: number;
}

interface MentionData {
  firmName: string;
  firmWebsite: string | null;
  mentionedOnPlatforms: PlatformKey[];
  platformCount: number;
  rankPosition: number | null;
  isVerified: boolean;
}

interface SectionFirmRankingProps {
  ranking: FirmRankingData[];
  mentions: MentionData[];
}

export function SectionFirmRanking({
  ranking,
  mentions,
}: SectionFirmRankingProps) {
  // Merge ranking with mention verification data
  const mergedRanking = ranking.map((firm) => {
    const mention = mentions.find(
      (m) =>
        m.firmName.toLowerCase() === firm.firmName.toLowerCase(),
    );
    return {
      ...firm,
      isVerified: mention?.isVerified ?? false,
    };
  });

  if (mergedRanking.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Firma Siralamasi
        </h2>
        <p className="text-sm text-muted-foreground">
          Bu sorguda hicbir firma tespit edilemedi.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Firma Siralamasi
      </h2>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full max-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">#</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Firma</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Platformlar</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">
                Gorunum
              </th>
            </tr>
          </thead>
          <tbody>
            {mergedRanking.map((firm) => (
              <tr
                key={firm.firmName}
                className="border-b border-border/50"
              >
                <td className="py-3 pr-3 text-muted-foreground">
                  {firm.rankPosition}
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <FirmFavicon
                      domain={firm.firmWebsite}
                      firmName={firm.firmName}
                    />
                    <span className="font-medium text-foreground">
                      {firm.firmName}
                    </span>
                    {firm.isVerified && <VerifiedBadge />}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <PlatformDots activePlatforms={firm.platforms} />
                </td>
                <td className="py-3 pr-3 text-right font-medium text-foreground">
                  {firm.platformCount}/5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {mergedRanking.map((firm) => (
          <div
            key={firm.firmName}
            className="rounded-md border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  #{firm.rankPosition}
                </span>
                <FirmFavicon
                  domain={firm.firmWebsite}
                  firmName={firm.firmName}
                />
                <span className="font-medium text-foreground">
                  {firm.firmName}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {firm.platformCount}/5
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <PlatformDots activePlatforms={firm.platforms} />
              {firm.isVerified && <VerifiedBadge />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
