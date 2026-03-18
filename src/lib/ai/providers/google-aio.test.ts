import { describe, it, expect, beforeEach } from "vitest";
import { GoogleAIOProvider } from "./google-aio";

describe("GoogleAIOProvider", () => {
  beforeEach(() => {
    delete process.env.SERPAPI_KEY;
  });

  it("instantiates without error", () => {
    const provider = new GoogleAIOProvider();
    expect(provider).toBeDefined();
  });

  it('has platform set to "google_aio"', () => {
    const provider = new GoogleAIOProvider();
    expect(provider.platform).toBe("google_aio");
  });

  it("isAvailable() returns false when no SERPAPI_KEY is set", () => {
    const provider = new GoogleAIOProvider();
    expect(provider.isAvailable()).toBe(false);
  });

  it("sendPrompt returns error when no SERPAPI_KEY", async () => {
    const provider = new GoogleAIOProvider();
    const result = await provider.sendPrompt("test query");
    expect(result.platform).toBe("google_aio");
    expect(result.error).toBeDefined();
    expect(result.content).toBe("");
  });
});
