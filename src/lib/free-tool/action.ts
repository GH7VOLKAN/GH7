"use server";

import type { FreeToolInput, FreeToolResult } from "./types";
import { generateMockResults } from "./mock-results";

export async function runFreeToolQuery(
  input: FreeToolInput
): Promise<FreeToolResult> {
  // Validate input
  if (!input.name.trim() || !input.field.trim() || !input.city.trim()) {
    throw new Error("Tüm alanları doldurun.");
  }

  // Simulate network delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  return generateMockResults(input);
}
