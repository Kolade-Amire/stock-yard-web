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
  return (
    <Card variant="panel" className="overflow-hidden">
      <div className="border-b border-(--line) px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">Calendar</p>
        <h3 className="mt-2 font-(family-name:--font-display) text-[2rem] text-(--ink)">Upcoming catalysts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.22em] text-(--ink-soft)">
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
            {data?.events.length ? (
              data.events.map((event) => (
                <tr key={`${event.symbol}-${event.earningsDate}`} className="border-t border-(--line) transition-colors hover:bg-(--surface-muted)">
                  <td className="px-5 py-4 font-semibold text-(--ink)">
                    <Link href={tickerRoute(event.symbol)} className="transition-colors hover:text-(--accent)">
                      {event.symbol}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-(--ink-muted)">{event.companyName}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{formatDateTime(event.earningsDate)}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{event.reportTime ?? "TBD"}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{event.epsEstimate ?? "Unavailable"}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{formatNumber(event.marketCap)}</td>
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
