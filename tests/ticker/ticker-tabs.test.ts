import { describe, expect, it } from "vitest";

import { DEFAULT_TICKER_TAB, MOBILE_TICKER_TABS, normalizeTickerWorkspaceTab } from "@/lib/ticker-tabs";

describe("ticker tab helpers", () => {
  it("defaults invalid or missing values to overview", () => {
    expect(normalizeTickerWorkspaceTab(undefined)).toBe(DEFAULT_TICKER_TAB);
    expect(normalizeTickerWorkspaceTab("unknown")).toBe(DEFAULT_TICKER_TAB);
  });

  it("keeps desktop tabs intact", () => {
    expect(normalizeTickerWorkspaceTab("news", true)).toBe("news");
    expect(normalizeTickerWorkspaceTab("ai-chat", true)).toBe("ai-chat");
  });

  it("falls back from desktop-only chat on mobile", () => {
    expect(normalizeTickerWorkspaceTab("ai-chat", false)).toBe(DEFAULT_TICKER_TAB);
    expect(MOBILE_TICKER_TABS.map((tab) => tab.key as string)).not.toContain("ai-chat");
  });
});
