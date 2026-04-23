/**
 * Template engine — statik string replacement (Brief H Aşama 1).
 *
 * Kullanım:
 *   renderTemplate("Merhaba {ad}, skorun {skor}/{toplam}", {
 *     ad: "Ali", skor: 17, toplam: 25
 *   })
 *   → "Merhaba Ali, skorun 17/25"
 *
 * - `{varName}` syntax (tek depth, iç içe değil)
 * - Koşullu bloklar: renderConditional
 * - Varyant seçimi: pickVariant (deterministic seed destekli)
 */

import type {
  ConditionalBlock,
  RenderOptions,
  TemplateVariables,
} from "./types";

const PLACEHOLDER_RE = /\{(\w+)\}/g;

/**
 * Template string içindeki `{key}` yer tutucularını variables'taki değerlerle
 * değiştirir. Bulunmayan key için:
 *   - strict=true ise Error fırlatır
 *   - fallback varsa onu koyar
 *   - Yoksa `{key}` olarak bırakır
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables,
  options: RenderOptions = {},
): string {
  return template.replace(PLACEHOLDER_RE, (match, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      if (options.strict) {
        throw new Error(`Template değişkeni bulunamadı: ${key}`);
      }
      return options.fallback ?? match;
    }
    return String(value);
  });
}

/**
 * Birden fazla koşullu bloktan ilk `condition === true` olanı render eder.
 * Hiçbiri match etmezse boş string döner.
 */
export function renderConditional(
  blocks: ConditionalBlock[],
  variables: TemplateVariables,
  options: RenderOptions = {},
): string {
  for (const block of blocks) {
    if (block.condition) {
      return renderTemplate(block.template, variables, options);
    }
  }
  return "";
}

/**
 * Varyant listesinden birini seçer.
 *  - seed verilirse deterministic (aynı seed → aynı varyant). Kullanıcı her
 *    seferinde aynı yorumu görsün istiyorsak kritik.
 *  - seed yoksa tamamen rastgele.
 *
 * Boş liste verilirse boş string döner (runtime güvenlik).
 */
export function pickVariant(variants: string[], seed?: string): string {
  if (variants.length === 0) return "";
  if (variants.length === 1) return variants[0]!;

  if (!seed) {
    return variants[Math.floor(Math.random() * variants.length)]!;
  }

  // djb2-lite hash — küçük string için yeterli
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return variants[Math.abs(hash) % variants.length]!;
}

/**
 * Shortcut: varyant seçip, seçileni renderTemplate ile değişkenlerle doldurur.
 */
export function renderVariant(
  variants: string[],
  variables: TemplateVariables,
  seed?: string,
  options: RenderOptions = {},
): string {
  const picked = pickVariant(variants, seed);
  if (!picked) return "";
  return renderTemplate(picked, variables, options);
}
