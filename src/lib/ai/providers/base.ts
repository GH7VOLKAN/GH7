import type { PlatformKey } from "@/lib/types";
import type { AIResponse } from "../types";

export interface AIProvider {
  platform: PlatformKey;
  isAvailable(): boolean;
  sendPrompt(promptText: string): Promise<AIResponse>;
}
