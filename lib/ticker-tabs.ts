export const DESKTOP_TICKER_TABS = [
  { key: "overview", label: "Overview" },
  { key: "financials", label: "Financials" },
  { key: "earnings", label: "Earnings" },
  { key: "analyst", label: "Analyst" },
  { key: "ownership", label: "Ownership" },
  { key: "options", label: "Options" },
  { key: "news", label: "News" },
  { key: "ai-chat", label: "AI Chat" },
] as const;

export const MOBILE_TICKER_TABS = DESKTOP_TICKER_TABS.filter((tab) => tab.key !== "ai-chat");

export type TickerWorkspaceTab = (typeof DESKTOP_TICKER_TABS)[number]["key"];

export const DEFAULT_TICKER_TAB: TickerWorkspaceTab = "overview";

export function isTickerWorkspaceTab(value: string | string[] | null | undefined): value is TickerWorkspaceTab {
  return typeof value === "string" && DESKTOP_TICKER_TABS.some((tab) => tab.key === value);
}

export function normalizeTickerWorkspaceTab(
  value: string | string[] | null | undefined,
  isDesktop = true,
): TickerWorkspaceTab {
  const resolved = isTickerWorkspaceTab(value) ? value : DEFAULT_TICKER_TAB;

  if (!isDesktop && resolved === "ai-chat") {
    return DEFAULT_TICKER_TAB;
  }

  return resolved;
}
