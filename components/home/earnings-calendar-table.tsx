import Link from "next/link";

import { DataLimitations } from "@/components/ui/data-limitations";
import { tickerRoute } from "@/lib/routes";
import type { EarningsCalendarResponse } from "@/lib/stock-yard/schemas";

type EarningsCalendarTableProps = {
  data: EarningsCalendarResponse | null;
};

function formatEarningsDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getUTCDate(),
    month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
}

export function EarningsCalendarTable({ data }: EarningsCalendarTableProps) {
  const events = data?.events ?? [];

  return (
    <div className="border-r border-(--line) px-6 py-5">
      <p
        className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft) mb-3.5 pb-2.5 border-b border-(--line)"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Earnings calendar · This week
      </p>

      {events.length ? (
        <div>
          {events.slice(0, 8).map((event) => {
            const { day, month } = formatEarningsDate(event.earningsDate);
            const reportTimeBadge = event.reportTime?.toLowerCase().includes("before") ? "BMO"
              : event.reportTime?.toLowerCase().includes("after") ? "AMC"
              : event.reportTime ?? null;
            const isAmc = reportTimeBadge === "AMC";

            return (
              <div
                key={`${event.symbol}-${event.earningsDate}`}
                className="flex items-center gap-3 py-2 border-b border-(--line) last:border-b-0"
              >
                <div
                  className="rounded-md text-center px-2 py-1 min-w-[38px] shrink-0 bg-(--surface-muted)"
                >
                  <p
                    className="text-[13px] font-medium text-(--ink) leading-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {day}
                  </p>
                  <p
                    className="text-[9px] text-(--ink-soft) uppercase leading-none mt-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {month}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={tickerRoute(event.symbol)}
                      className="text-[12px] font-medium text-(--ink) hover:text-(--gold) transition-colors"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {event.symbol}
                    </Link>
                    <span className="text-[10px] text-(--ink-soft) truncate">{event.companyName}</span>
                  </div>
                  {event.epsEstimate !== null && (
                    <p
                      className="text-[10px] text-(--ink-muted) mt-0.5"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Est. EPS ${event.epsEstimate.toFixed(2)}
                    </p>
                  )}
                </div>

                {reportTimeBadge && (
                  <span
                    className={`shrink-0 text-[9px] px-1.5 py-[3px] rounded border ${
                      isAmc
                        ? "border-(--gold-border) bg-(--gold-soft) text-(--gold)"
                        : "border-(--line-strong) bg-(--surface-muted) text-(--ink-muted)"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {reportTimeBadge}
                  </span>
                )}
              </div>
            );
          })}
          <div className="mt-3">
            <DataLimitations items={data?.dataLimitations ?? []} />
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-(--ink-muted) pt-2">No scheduled earnings found for this window.</p>
      )}
    </div>
  );
}
