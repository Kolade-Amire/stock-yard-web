import { Card } from "@/components/ui/card";
import { formatDateTime, formatNumber } from "@/lib/stock-yard/format";
import type { EarningsCalendarResponse } from "@/lib/stock-yard/schemas";

type EarningsCalendarTableProps = {
  data: EarningsCalendarResponse | null;
};

export function EarningsCalendarTable({ data }: EarningsCalendarTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-(--line) px-5 py-4">
        <h3 className="font-(family-name:--font-display) text-2xl text-(--ink)">Earnings calendar</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
            <tr>
              <th className="px-5 py-3 font-medium">Symbol</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Schedule</th>
              <th className="px-5 py-3 font-medium">EPS Est.</th>
              <th className="px-5 py-3 font-medium">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {data?.events.length ? (
              data.events.map((event) => (
                <tr key={`${event.symbol}-${event.earningsDate}`} className="border-t border-(--line)">
                  <td className="px-5 py-4 font-semibold text-(--ink)">{event.symbol}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{event.companyName}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{formatDateTime(event.earningsDate)}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{event.epsEstimate ?? "Unavailable"}</td>
                  <td className="px-5 py-4 text-(--ink-muted)">{formatNumber(event.marketCap)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-(--ink-muted)">
                  No scheduled earnings found for this window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
