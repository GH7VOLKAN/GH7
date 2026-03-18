import { describe, it, expect, beforeEach, vi } from "vitest";
import { OpenAIProvider } from "./openai";

describe("OpenAIProvider", () => {
  beforeEach(() => {
    // Clear any API key from environment
    delete process.env.OPENAI_API_KEY;
  });

  it("instantiates without error", () => {
    const provider = new OpenAIProvider();
    expect(provider).toBeDefined();
  });

  it('has platform set to "chatgpt"', () => {
    const provider = new OpenAIProvider();
    expect(provider.platform).toBe("chatgpt");
  });

  it("isAvailable() returns false when no API key is set", () => {
    const provider = new OpenAIProvider();
    expect(provider.isAvailable()).toBe(false);
  });

  it("sendPrompt returns error when no API key", async () => {
    const provider = new OpenAIProvider();
    const result = await provider.sendPrompt("test");
    expect(result.platform).toBe("chatgpt");
    expect(result.error).toBeDefined();
    expect(result.content).toBe("");
  });
});
