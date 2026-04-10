/**
 * GH7.ai Error Tracking & Monitoring
 *
 * Console logging + optional Sentry integration.
 * Install @sentry/nextjs and set NEXT_PUBLIC_SENTRY_DSN to enable Sentry.
 */

export interface ErrorContext {
  context: string;
  userId?: string;
  brandId?: string;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sentry: any = null;
let _sentryChecked = false;

async function trySentry() {
  if (_sentryChecked) return _sentry;
  _sentryChecked = true;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;
  try {
    _sentry = await (Function('return import("@sentry/nextjs")')());
  } catch {
    _sentry = null;
  }
  return _sentry;
}

/**
 * Capture and log an error with optional context.
 * Sends to Sentry when configured, always logs to console.
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
  if (err.stack && process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  trySentry().then((s) => {
    if (s?.captureException) {
      s.captureException(err, {
        tags: { context: contextLabel },
        extra: (ctx as Record<string, unknown>) ?? {},
      });
    }
  });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  console.log(`[GH7 ${level}] ${message}`);

  trySentry().then((s) => {
    if (s?.captureMessage) {
      s.captureMessage(message, level);
    }
  });
}
