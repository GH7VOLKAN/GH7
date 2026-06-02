import { SourceStat } from '../pipeline/aggregateSources';
import { ClassifiedSource, SourceClass } from '../schema/stage2';
import { brandCore, trNorm } from '../util/match';

function bare(domain: string): string {
  return trNorm(domain).replace(/^www\./, '');
}

/** First domain label (before the TLD), alphanumeric only: formmuhendislik.com -> formmuhendislik */
function domainLabel(domain: string): string {
  return bare(domain).split('.')[0].replace(/[^a-z0-9]/g, '');
}

/**
 * Classify each cited source domain:
 *  - own        = the brand's own domain
 *  - competitor = a competitor's own domain. Matched against (a) the operator-
 *                 supplied competitor domains AND (b) the competitor NAMES that
 *                 emerged from the run (so e.g. "Form Mühendislik" -> the cited
 *                 formmuhendislik.com is correctly flagged, even when no
 *                 competitor domains were entered in the intake).
 *  - neutral    = everything else (the real "get listed here" targets).
 */
export function classifySources(
  sources: SourceStat[],
  brandDomain: string,
  competitorDomains: string[],
  competitorNames: string[] = [],
): ClassifiedSource[] {
  const own = bare(brandDomain);
  const comps = competitorDomains.map(bare).filter(Boolean);
  const nameKeys = competitorNames
    .map((n) => brandCore(n).replace(/\s+/g, ''))
    .filter((k) => k.length >= 4);

  return sources.map((s) => {
    const d = bare(s.domain);
    const label = domainLabel(s.domain);
    let klass: SourceClass = 'neutral';
    if (d === own || d.includes(own) || own.includes(d)) klass = 'own';
    else if (comps.some((c) => d === c || d.includes(c) || c.includes(d))) klass = 'competitor';
    else if (label && nameKeys.some((k) => label.includes(k) || k.includes(label)))
      klass = 'competitor';
    return { domain: s.domain, count: s.count, klass };
  });
}
