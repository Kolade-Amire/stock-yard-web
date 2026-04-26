"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowUpRight, CalendarRange, ChevronRight, Newspaper, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { ChatPanel } from "@/components/ticker/chat-panel";
import { HistoryPanel } from "@/components/ticker/history-panel";
import { NewsPanel } from "@/components/ticker/news-panel";
import { ResearchSectionPanel, type ResearchTab } from "@/components/ticker/research-sections";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/stock-yard/format";
import type { HistoryResponse, NewsResponse } from "@/lib/stock-yard/schemas";
import { tickerRouteWithQuery } from "@/lib/routes";
import {
  DEFAULT_TICKER_TAB,
  DESKTOP_TICKER_TABS,
  isTickerWorkspaceTab,
  normalizeTickerWorkspaceTab,
  type TickerWorkspaceTab,
} from "@/lib/ticker-tabs";
import { cn } from "@/lib/utils";

type TickerWorkspaceProps = {
  symbol: string;
  currency: string;
  nextEarningsDate: string | null;
  initialHistoryData: HistoryResponse | null;
  initialNewsData: NewsResponse | null;
  initialTab: TickerWorkspaceTab;
};

const WORKSPACE_TAB_TRIGGER_CLASS =
  "relative inline-flex shrink-0 items-center gap-1 border-b-2 border-transparent pb-3 text-[15px] font-medium tracking-[-0.01em] text-(--ink-soft) transition-colors hover:text-(--ink) data-[state=active]:border-(--accent) data-[state=active]:text-(--ink-strong)";

export function TickerWorkspace({
  symbol,
  currency,
  nextEarningsDate,
  initialHistoryData,
  initialNewsData,
  initialTab,
}: TickerWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useDesktopBreakpoint();
  const rawTab = searchParams.get("tab");
  const activeTab = isTickerWorkspaceTab(rawTab) ? rawTab : initialTab;
  const headlines = useMemo(() => initialNewsData?.news.slice(0, 4) ?? [], [initialNewsData]);

  useEffect(() => {
    if (isDesktop || activeTab !== "ai-chat") {
      return;
    }

    syncTickerTabUrl({
      router,
      searchParams: searchParams.toString(),
      symbol,
      nextTab: DEFAULT_TICKER_TAB,
    });
  }, [activeTab, isDesktop, router, searchParams, symbol]);

  function handleTabChange(nextTab: string) {
    if (!isTickerWorkspaceTab(nextTab)) {
      return;
    }

    const normalizedTab = normalizeTickerWorkspaceTab(nextTab, isDesktop);

    syncTickerTabUrl({
      router,
      searchParams: searchParams.toString(),
      symbol,
      nextTab: normalizedTab,
    });
  }

  return (
    <section className="relative isolate">
      <Tabs.Root
        value={activeTab}
        onValueChange={handleTabChange}
        className={cn(
          "flex flex-col overflow-hidden rounded-[1.8rem] border border-(--line-strong) bg-(--surface-strong) shadow-[var(--shadow-band)]",
          activeTab === "ai-chat"
            ? "h-[min(84dvh,68rem)] min-h-[38rem]"
            : "h-[min(72dvh,58rem)] min-h-[32rem]",
        )}
      >
        <div className="border-b border-(--line) bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_100%)] px-4 pt-4 sm:px-5 md:px-6">
          <div className="overflow-x-auto overflow-y-hidden">
            <Tabs.List aria-label="Single stock views" className="flex min-w-max gap-7">
              {DESKTOP_TICKER_TABS.map((tab) => (
                <Tabs.Trigger
                  key={tab.key}
                  value={tab.key}
                  className={cn(WORKSPACE_TAB_TRIGGER_CLASS, tab.key === "ai-chat" ? "hidden xl:inline-flex" : undefined)}
                >
                  {tab.key === "ai-chat" ? <Sparkles className="size-3.5" /> : null}
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {DESKTOP_TICKER_TABS.map((tab) => (
            <Tabs.Content key={tab.key} value={tab.key} className="h-full data-[state=inactive]:hidden">
              <div
                className={cn(
                  "h-full",
                  tab.key === "ai-chat"
                    ? "overflow-hidden px-2 py-2 sm:px-3 sm:py-3 md:px-4"
                    : "overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6",
                )}
              >
                {renderTickerTabPanel({
                  activeTab: tab.key,
                  symbol,
                  currency,
                  nextEarningsDate,
                  initialHistoryData,
                  initialNewsData,
                  headlines,
                })}
              </div>
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>

      <ChatPanel key={`${symbol}-mobile-chat`} symbol={symbol} desktopLayout="none" />
    </section>
  );
}

type RenderTickerTabPanelProps = {
  activeTab: TickerWorkspaceTab;
  symbol: string;
  currency: string;
  nextEarningsDate: string | null;
  initialHistoryData: HistoryResponse | null;
  initialNewsData: NewsResponse | null;
  headlines: NewsResponse["news"];
};

function renderTickerTabPanel({
  activeTab,
  symbol,
  currency,
  nextEarningsDate,
  initialHistoryData,
  initialNewsData,
  headlines,
}: RenderTickerTabPanelProps) {
  switch (activeTab) {
    case "overview":
      return (
        <OverviewPanel
          symbol={symbol}
          currency={currency}
          nextEarningsDate={nextEarningsDate}
          initialHistoryData={initialHistoryData}
          headlines={headlines}
        />
      );
    case "news":
      return <NewsPanel data={initialNewsData} />;
    case "ai-chat":
      return (
        <>
          <div className="hidden h-full xl:block">
            <ChatPanel key={`${symbol}-desktop-chat`} symbol={symbol} desktopLayout="workspace" showMobileLauncher={false} />
          </div>
          <Card variant="muted" className="px-5 py-5 xl:hidden">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">AI Chat</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-(--ink-strong)">Mobile shortcut only</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--ink-muted)">
              On mobile, AI Chat stays in the floating chat drawer so the research rail keeps room for the core stock tabs.
            </p>
          </Card>
        </>
      );
    default:
      return <ResearchSectionPanel tab={activeTab as ResearchTab} symbol={symbol} nextEarningsDate={nextEarningsDate} />;
  }
}

type OverviewPanelProps = {
  symbol: string;
  currency: string;
  nextEarningsDate: string | null;
  initialHistoryData: HistoryResponse | null;
  headlines: NewsResponse["news"];
};

function OverviewPanel({ symbol, currency, nextEarningsDate, initialHistoryData, headlines }: OverviewPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <HistoryPanel symbol={symbol} currency={currency} initialData={initialHistoryData} />
      <div className="space-y-4">
        <Card variant="panel" className="px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">Upcoming</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-(--ink-strong)">Next checkpoint</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">
                Keep the tab rail fixed while you move between long-form research views. The upcoming earnings date is the next hard catalyst in this workflow.
              </p>
            </div>
            <div className="rounded-full border border-(--line) bg-(--surface) p-3 text-(--accent)">
              <CalendarRange className="size-5" />
            </div>
          </div>
          <div className="mt-5 rounded-[1.1rem] border border-(--line) bg-(--surface) px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-(--ink-soft)">Next earnings date</p>
            <p className="mt-2 text-2xl font-semibold text-(--ink-strong)">{formatDate(nextEarningsDate)}</p>
            <p className="mt-1 text-sm text-(--ink-muted)">Use `Earnings`, `Analyst`, and `News` together when the next report gets close.</p>
          </div>
        </Card>

        <Card variant="panel" className="overflow-hidden px-0 py-0">
          <div className="border-b border-(--line) px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">Briefing</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-(--ink-strong)">Headlines in view</h3>
              </div>
              <div className="rounded-full border border-(--line) bg-(--surface) p-3 text-(--accent)">
                <Newspaper className="size-5" />
              </div>
            </div>
          </div>
          {headlines.length ? (
            <div className="divide-y divide-(--line)">
              {headlines.map((item, index) => (
                <article key={`${item.title}-${item.published_at}-${index}`} className="px-5 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-(--ink-soft)">
                    {item.publisher ?? formatDateTime(item.published_at)}
                  </p>
                  <h4 className="mt-2 text-base font-semibold leading-snug text-(--ink-strong)">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">{item.summary ?? "Summary unavailable."}</p>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--accent)"
                    >
                      Open source
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-sm text-(--ink-muted)">No headlines are available for this symbol right now.</div>
          )}
          <div className="border-t border-(--line) px-5 py-3 text-sm text-(--ink-muted)">
            Full coverage lives under the News tab.
          </div>
        </Card>

        <Card variant="muted" className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">Flow</p>
              <h3 className="mt-1 text-base font-semibold text-(--ink-strong)">Use-case path</h3>
            </div>
            <ChevronRight className="mt-1 size-4 text-(--ink-soft)" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">
            Start with `Overview`, move into the fundamental tabs for evidence, then shift to `News` or desktop `AI Chat` when you need narrative context.
          </p>
        </Card>
      </div>
    </div>
  );
}

type SyncTickerTabUrlOptions = {
  router: ReturnType<typeof useRouter>;
  searchParams: string;
  symbol: string;
  nextTab: TickerWorkspaceTab;
};

function syncTickerTabUrl({ router, searchParams, symbol, nextTab }: SyncTickerTabUrlOptions) {
  const params = new URLSearchParams(searchParams);

  if (nextTab === DEFAULT_TICKER_TAB) {
    params.delete("tab");
  } else {
    params.set("tab", nextTab);
  }

  startTransition(() => {
    router.replace(tickerRouteWithQuery(symbol, params.toString()));
  });
}

function useDesktopBreakpoint() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const syncBreakpoint = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    syncBreakpoint();
    mediaQuery.addEventListener("change", syncBreakpoint);

    return () => {
      mediaQuery.removeEventListener("change", syncBreakpoint);
    };
  }, []);

  return isDesktop;
}
