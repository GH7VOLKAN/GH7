/**
 * STAGE 0 PROMPTS — the rigorous core ("prompt strategy").
 * Two steps: (1) extract a structured business intake from site text,
 * (2) generate a correct, scoped query set from that intake.
 *
 * The single most important rule lives here: businessModel + geographyMode
 * must be classified explicitly, because they decide whether queries get a
 * location attached. This is the guard against "wrong-scope" query sets.
 */

export const INTAKE_SYSTEM = `You are a market analyst. From a business's website text you produce a precise, structured "intake" describing what the business actually is. You never guess wildly; when unsure you mark low confidence and explain. You output ONLY a JSON object, no prose, no markdown fences.`;

export function buildIntakePrompt(siteText: string, url: string): string {
  return [
    `Website: ${url}`,
    '',
    'Website text (homepage + key pages):',
    '"""',
    siteText,
    '"""',
    '',
    'Produce a JSON object with EXACTLY these fields:',
    '{',
    '  "businessName": "legal/display name",',
    '  "brand": "the name customers would say (for matching in AI answers)",',
    '  "brandDomain": "primary domain, e.g. example.com",',
    '  "summary": "one sentence: what they sell/do",',
    '  "categories": ["distinct product or service categories"],',
    '  "useCases": ["concrete real-world use cases / problems they solve"],',
    '  "channels": ["sales/presence channels you can detect: own e-commerce, Trendyol, Hepsiburada, marketplace, B2B project quotes, LinkedIn, Instagram, etc."],',
    '  "audiences": ["b2c" and/or "b2b"],',
    '  "businessModel": "local_service | national_product | national_b2b | mixed",',
    '  "geographyMode": "local | national | global",',
    '  "locations": ["if local: cities/regions served; if national: the country"],',
    '  "language": "primary content language code, e.g. tr",',
    '  "authorityClaims": ["claims like first/oldest/#1/largest — AEO authority signals"],',
    '  "candidateCompetitors": ["likely competitors IF clearly implied; otherwise empty — these are GUESSES to verify, not facts"],',
    '  "confidence": "high | medium | low",',
    '  "uncertaintyNotes": "what you were unsure about and why"',
    '}',
    '',
    'CRITICAL RULES:',
    '- businessModel and geographyMode are mandatory and must be reasoned carefully. Signals:',
    '  • e-commerce / marketplace links (Trendyol, Hepsiburada) / "tüm Türkiye" / nationwide shipping => national_product (geographyMode national).',
    '  • project-based quotes, industrial/engineering, B2B references nationwide => national_b2b.',
    '  • "X şehrinde hizmet", local address as service area, local-only service => local_service (geographyMode local).',
    '  • both selling products nationally AND doing local/B2B projects => mixed.',
    '- Do NOT assume a business is local just because it has a city in its address. A nationwide seller headquartered in a city is still national.',
    '- candidateCompetitors: only if the site itself implies them; never invent well-known names as fact.',
    '- Output ONLY the JSON object.',
  ].join('\n');
}

export const QUERYGEN_SYSTEM = `You design the set of questions that REAL near-purchase customers actually type into AI assistants (ChatGPT, Gemini, Perplexity) when they are about to buy a product or commission a project in this business's space. The purpose is to measure whether the business gets recommended at the moment of buying intent — so the questions must be ones whose natural answer would NAME a vendor, product, or solution. You output ONLY a JSON object, no prose, no markdown fences.`;

export function buildQueryGenPrompt(intakeJson: string): string {
  return [
    'Business intake (authoritative — base everything on this):',
    '"""',
    intakeJson,
    '"""',
    '',
    'The goal is SALES (product/service/project), not brand awareness. Generate the',
    'questions that capture buyers at the moment of intent.',
    '',
    'Output JSON:',
    '{',
    '  "goal": "one line: what selling outcome these queries serve",',
    '  "queries": [',
    '    { "query": "the actual question, in natural language", "intent": "decision|sourcing|comparison|reputation", "revenueLine": "which product/project line a win here sells" }',
    '  ]',
    '}',
    '',
    'HARD RULES — a query is only allowed if it passes ALL of these:',
    '1. VENDOR-ELICITING (applies to EVERY query, including comparisons): the natural AI',
    '   answer MUST name a vendor, brand, manufacturer, or solution provider. If a question',
    '   would normally be answered with only a price, a number, a how-to, or a system-vs-system',
    '   explanation that names no one, you MUST attach an explicit vendor-asking clause so the',
    '   answer names someone (e.g. add "...peki bunu yapan/satan hangi firma/marka iyi?").',
    '   BANNED unless rewritten this way:',
    '     • pure cost — "...m² maliyeti", "...fiyatı ne kadar"',
    '     • pure spec / how-to — "...kaç derece olmalı", "...kaç watt", "...nasıl yapılır"',
    '     • pure system comparison with no vendor — "yerden ısıtma mı kombi mi ekonomik"',
    '   GOOD vendor-eliciting forms: "...kim yapıyor", "...nereden alırım", "...hangi firma/marka",',
    '   "...yaptırsam kimi tercih etmeliyim".',
    '2. REAL, NATURAL PHRASING: write exactly how a real person types to an AI — usually SHORT',
    '   and conversational, sometimes lowercase or a little messy, NOT a polished marketing',
    '   sentence. Hit the sweet spot between a bare Google keyword and an over-complete essay.',
    '     • BAD (keyword fragment): "yerden ısıtma kablosu fiyatları"',
    '     • BAD (artificially long/formal): "Evime elektrikli yerden ısıtma yaptırmak istiyorum,',
    '       Türkiye\'de hangi marka ve firmayı önerirsiniz?"',
    '     • GOOD (real + vendor-eliciting): "yerden ısıtma yaptırsam hangi firma iyi?",',
    '       "proses tankı ısı ceketi nereden alırım?", "rampa kar eritmeyi kim uyguluyor?"',
    '3. HIGH INTENT: the asker is close to buying or sourcing, not idly curious.',
    '4. GEOGRAPHY: if geographyMode is "local", attach the location; if "national"/"global",',
    '   the query MUST be geo-agnostic (no city). Adding a city to a national business is WRONG.',
    '5. TAGGING: set intent (decision=B2C buying, sourcing=B2B/project vendor, comparison=a',
    '   real buyer decision that STILL ends by asking for a vendor like "elektrikli mi sulu mu,',
    '   ve hangi marka/firma iyi?", reputation=brand trust), and map each to the revenueLine it',
    '   would sell. A comparison query that names no vendor violates Rule 1 — fix it or drop it.',
    '',
    'COVERAGE: produce ~15-25 queries total, spread across the business\'s real revenue',
    'lines and across decision/sourcing/comparison. Include AT MOST 2 reputation queries',
    '(e.g. "<brand> güvenilir mi") — these monitor reputation, they do NOT measure',
    'discovery visibility, so keep them few.',
    '',
    'Output ONLY the JSON object.',
  ].join('\n');
}
