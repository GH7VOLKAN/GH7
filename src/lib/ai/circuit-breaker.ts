/**
 * GH7.ai Circuit Breaker — Provider bazlı devre kesici
 *
 * 3 state: CLOSED (normal) → OPEN (hata, reddet) → HALF_OPEN (test)
 * failureThreshold: 3 ardışık hata → OPEN
 * resetTimeout: 60 saniye → HALF_OPEN (1 deneme)
 */

type CircuitState = "closed" | "open" | "half_open";

interface CircuitEntry {
  state: CircuitState;
  failures: number;
  lastFailure: Date | null;
  openedAt: Date | null;
}

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 60_000; // 60 saniye

const circuits = new Map<string, CircuitEntry>();

function getOrCreate(platform: string): CircuitEntry {
  let entry = circuits.get(platform);
  if (!entry) {
    entry = { state: "closed", failures: 0, lastFailure: null, openedAt: null };
    circuits.set(platform, entry);
  }
  return entry;
}

export function canExecute(platform: string): boolean {
  const entry = getOrCreate(platform);

  if (entry.state === "closed") return true;

  if (entry.state === "open") {
    // Check if reset timeout elapsed → transition to half_open
    if (entry.openedAt && Date.now() - entry.openedAt.getTime() >= RESET_TIMEOUT_MS) {
      entry.state = "half_open";
      return true; // Allow one test request
    }
    return false; // Still open, reject
  }

  // half_open: allow one test request
  return true;
}

export function recordSuccess(platform: string): void {
  const entry = getOrCreate(platform);
  entry.state = "closed";
  entry.failures = 0;
  entry.lastFailure = null;
  entry.openedAt = null;
}

export function recordFailure(platform: string): void {
  const entry = getOrCreate(platform);
  entry.failures++;
  entry.lastFailure = new Date();

  if (entry.state === "half_open") {
    // Test failed → back to open
    entry.state = "open";
    entry.openedAt = new Date();
    return;
  }

  if (entry.failures >= FAILURE_THRESHOLD) {
    entry.state = "open";
    entry.openedAt = new Date();
    console.warn(`[circuit-breaker] ${platform} circuit OPENED after ${entry.failures} failures`);
  }
}

export function getStatus(platform: string): CircuitState {
  return getOrCreate(platform).state;
}

export function getAllStatuses(): Record<string, { state: CircuitState; failures: number; lastFailure: string | null }> {
  const result: Record<string, { state: CircuitState; failures: number; lastFailure: string | null }> = {};
  for (const [platform, entry] of circuits) {
    result[platform] = {
      state: entry.state,
      failures: entry.failures,
      lastFailure: entry.lastFailure?.toISOString() ?? null,
    };
  }
  return result;
}
