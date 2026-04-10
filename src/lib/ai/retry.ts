/**
 * GH7.ai Retry with Exponential Backoff
 *
 * maxRetries: 2 (toplam 3 deneme)
 * baseDelay: 1000ms
 * maxDelay: 10000ms
 * Jitter: 0.5-1.0x delay
 * Sadece transient hatalarda retry (timeout, 429, 500-503)
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Timeout errors
    if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("aborted")) return true;
    // Rate limit
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) return true;
    // Server errors
    if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("internal server")) return true;
    // Network errors
    if (msg.includes("econnreset") || msg.includes("econnrefused") || msg.includes("network")) return true;
  }
  // Check for fetch response-like errors
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 429 || (status >= 500 && status <= 503);
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 2;
  const baseDelay = options?.baseDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 10000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on non-transient errors or last attempt
      if (attempt === maxRetries || !isTransientError(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5);

      console.warn(
        `[retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(jitteredDelay)}ms...`,
        error instanceof Error ? error.message : String(error),
      );

      await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
}
