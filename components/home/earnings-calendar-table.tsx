import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatDateTime, formatNumber } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import type { EarningsCalendarResponse } from "@/lib/stock-yard/schemas";

type EarningsCalendarTableProps = {
  data: EarningsCalendarResponse | null;
};

export function EarningsCalendarTable({ data }: EarningsCalendarTableProps) {
  const hasEvents = Boolean(data?.events.length);

  return (
    <Card variant="panel" className="overflow-hidden">
      <div className="border-b border-(--line) px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Calendar</p>
        <h3 className="mt-1 text-lg font-semibold text-(--ink-strong)">Upcoming earnings</h3>
      </div>
      {hasEvents ? (
        <div className="md:hidden space-y-2 px-4 py-4">
          {data?.events.map((event) => (
            <article
              key={`${event.symbol}-${event.earningsDate}`}
              className="rounded-lg border border-(--line) bg-(--surface-muted) px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={tickerRoute(event.symbol)} className="text-sm font-semibold text-(--ink-strong) transition-colors hover:text-(--accent)">
                    {event.symbol}
                  </Link>
                  <p className="truncate text-sm text-(--ink-muted)">{event.companyName}</p>
                </div>
                <p className="shrink-0 text-xs font-medium uppercase tracking-wider text-(--ink-soft)">
                  {event.reportTime ?? "TBD"}
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DetailBlock label="Schedule" value={formatDateTime(event.earningsDate)} />
                <DetailBlock label="EPS Est." value={event.epsEstimate ?? "—"} />
                <DetailBlock label="Market Cap" value={formatNumber(event.marketCap)} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="px-4 py-5 text-sm text-(--ink-muted) md:hidden">
          No scheduled earnings found for this window.
        </div>
      )}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-(--ink-soft)">
            <tr>
              <th className="px-5 py-3 font-medium">Symbol</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Schedule</th>
              <th className="px-5 py-3 font-medium">Report</th>
              <th className="px-5 py-3 font-medium">EPS Est.</th>
              <th className="px-5 py-3 font-medium">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {hasEvents ? (
              data?.events.map((event) => (
                <tr key={`${event.symbol}-${event.earningsDate}`} className="border-t border-(--line) transition-colors hover:bg-(--surface-muted)">
                  <td className="px-5 py-3 font-semibold text-(--ink-strong)">
                    <Link href={tickerRoute(event.symbol)} className="transition-colors hover:text-(--accent)">
                      {event.symbol}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-(--ink-muted)">{event.companyName}</td>
                  <td className="px-5 py-3 text-(--ink-muted)">{formatDateTime(event.earningsDate)}</td>
                  <td className="px-5 py-3 text-(--ink-muted)">{event.reportTime ?? "TBD"}</td>
                  <td className="px-5 py-3 text-(--ink-muted)">{event.epsEstimate ?? "—"}</td>
                  <td className="px-5 py-3 text-(--ink-muted)">{formatNumber(event.marketCap)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-(--ink-muted)">
                  No scheduled earnings found for this window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-(--line) px-5 py-4">
        <DataLimitations items={data?.dataLimitations ?? []} />
      </div>
    </Card>
  );
}

function DetailBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-(--line) bg-(--surface) px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{label}</p>
      <p className="mt-1 text-sm text-(--ink)">{value}</p>
    </div>
  );
}
