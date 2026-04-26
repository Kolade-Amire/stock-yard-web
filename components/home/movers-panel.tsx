"use client";

import Link from "next/link";
import { useState } from "react";

import { formatCurrency, formatSignedPercent } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type Tab = "gainers" | "losers" | "active";

type MoversPanelProps = {
  gainers: MoversResponse | null;
  losers: MoversResponse | null;
  mostActive: MoversResponse | null;
};

const TABS: { key: Tab; label: string }[] = [
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
  { key: "active", label: "Active" },
];

export function MoversPanel({ gainers, losers, mostActive }: MoversPanelProps) {
  const [active, setActive] = useState<Tab>("gainers");

  const dataMap: Record<Tab, MoversResponse | null> = {
    gainers,
    losers,
    active: mostActive,
  };

  const data = dataMap[active];

  return (
    <div className="border-b lg:border-b-0 border-r-0 lg:border-r border-(--line) px-6 py-5">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-(--line)">
        <p
          className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft)"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Top movers
        </p>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "text-[10px] px-[9px] py-[3px] rounded cursor-pointer border-0 transition-colors",
                active === tab.key
                  ? "text-(--canvas) font-medium"
                  : "border border-(--line-strong) text-(--ink-muted) bg-transparent hover:bg-(--surface-muted)",
              )}
              style={
                active === tab.key
                  ? { fontFamily: "var(--font-mono)", background: "var(--ink)" }
                  : { fontFamily: "var(--font-mono)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {data?.results.length ? (
        <div>
          {data.results.slice(0, 6).map((item) => (
            <Link
              key={item.symbol}
              href={tickerRoute(item.symbol)}
              className="flex items-center justify-between py-2 border-b border-(--line) last:border-b-0 hover:bg-(--surface-muted) -mx-2 px-2 rounded transition-colors"
            >
              <div className="min-w-0">
                <p
                  className="text-[13px] font-medium text-(--ink)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.symbol}
                </p>
                <p className="text-[10px] text-(--ink-soft) truncate max-w-[140px]">{item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[12px] text-(--ink-muted)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCurrency(item.currentPrice)}
                </p>
                <p
                  className={`text-[12px] font-medium ${item.percentChange !== null && item.percentChange >= 0 ? "text-(--positive)" : "text-(--negative)"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatSignedPercent(item.percentChange)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-(--ink-muted) pt-2">Mover data will appear here when the API is configured.</p>
      )}
    </div>
  );
}
