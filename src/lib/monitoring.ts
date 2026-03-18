/**
 * Simple error reporting wrapper.
 * For now, logs errors with context (can be replaced with Sentry later).
 */

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[GH7-ERROR]', {
    message: err.message,
    stack: err.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[GH7-${level.toUpperCase()}]`, message, new Date().toISOString());
}
