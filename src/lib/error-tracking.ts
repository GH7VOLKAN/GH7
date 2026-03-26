/**
 * GH7.ai Error Tracking — convenience re-export.
 *
 * The canonical implementation lives in `@/lib/monitoring`.
 * This module exists so code can import from either path.
 */
export { captureError, captureMessage } from "./monitoring";
export type { ErrorContext } from "./monitoring";
