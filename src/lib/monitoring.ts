/**
 * GH7.ai Error Tracking
 *
 * Lightweight error tracking. Logs to console in dev,
 * can be extended with Sentry/LogRocket later.
 */

export interface ErrorContext {
  context: string;
  userId?: string;
  brandId?: string;
  extra?: Record<string, unknown>;
  /** Legacy: callers may pass arbitrary keys directly */
  [key: string]: unknown;
}

/**
 * Capture and log an error with optional context.
 *
 * Accepts both the new `ErrorContext` shape and the legacy
 * `Record<string, unknown>` shape so existing call-sites keep working.
 */
export function captureError(
  error: unknown,
  ctx?: ErrorContext | Record<string, unknown>,
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const contextLabel =
    ctx && "context" in ctx && typeof ctx.context === "string"
      ? ctx.context
      : "unknown";

  console.error(`[GH7 Error] ${contextLabel}:`, err.message);
  if (err.stack) console.error(err.stack);

  // Structured payload for future transport (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === "development") {
    console.error("[GH7-ERROR]", {
      message: err.message,
      stack: err.stack,
      ...ctx,
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: When Sentry is configured, uncomment:
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     tags: { context: contextLabel },
  //     extra: ctx,
  //   });
  // }
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  console.log(`[GH7 ${level}] ${message}`);
}
