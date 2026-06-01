/**
 * Extract a JSON object from a model's text answer.
 * Handles code fences and surrounding prose by grabbing the
 * first `{` to the last `}`.
 */
export function extractJson<T = unknown>(text: string): T | null {
  if (!text) return null;
  let t = text.trim();

  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;

  try {
    return JSON.parse(t.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
