import { SourceStat } from '../pipeline/aggregateSources';
import { ClassifiedSource, SourceClass } from '../schema/stage2';
import { trNorm } from '../util/match';

function bare(domain: string): string {
  return trNorm(domain).replace(/^www\./, '');
}

/**
 * Classify each cited source domain:
 *  - own        = the brand's own domain
 *  - competitor = a known competitor's own domain (user-supplied list)
 *  - neutral    = everything else (the real "get listed here" targets)
 *
 * The competitor list is supplied by the human — this is exactly the
 * knowledge the system cannot guess and must be told.
 */
export function classifySources(
  sources: SourceStat[],
  brandDomain: string,
  competitorDomains: string[],
): ClassifiedSource[] {
  const own = bare(brandDomain);
  const comps = competitorDomains.map(bare).filter(Boolean);

  return sources.map((s) => {
    const d = bare(s.domain);
    let klass: SourceClass = 'neutral';
    if (d === own || d.includes(own) || own.includes(d)) klass = 'own';
    else if (comps.some((c) => d === c || d.includes(c) || c.includes(d)))
      klass = 'competitor';
    return { domain: s.domain, count: s.count, klass };
  });
}
