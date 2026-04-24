/**
 * Template engine — shared types (Brief H).
 */

export type TemplateVariables = Record<string, string | number>;

export type ConditionalBlock = {
  condition: boolean;
  template: string;
};

export type RenderOptions = {
  /** Değişken bulunamadığında kullanılacak değer. Default: `{varName}` (match olduğu gibi). */
  fallback?: string;
  /** `true` ise bulunmayan değişken için hata fırlatır. Default: false. */
  strict?: boolean;
};
