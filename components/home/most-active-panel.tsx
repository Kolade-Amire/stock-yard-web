import Link from "next/link";

import { formatCurrency, formatNumber, formatSignedPercent } from "@/lib/stock-yard/format";
import { tickerRoute } from "@/lib/routes";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type MostActivePanelProps = {
  data: MoversResponse | null;
};

export function MostActivePanel({ data }: MostActivePanelProps) {
  const items = (data?.results ?? []).slice(0, 6);

  return (
    <div className="px-6 py-5">
      <p
        className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft) mb-3.5 pb-2.5 border-b border-(--line)"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Most active · Volume
      </p>

      {items.length ? (
        <div>
          {items.map((item) => (
            <Link
              key={item.symbol}
              href={tickerRoute(item.symbol)}
              className="flex items-center justify-between py-2 border-b border-(--line) last:border-b-0 hover:bg-(--surface-muted) -mx-2 px-2 rounded transition-colors"
            >
              <div className="min-w-0">
                <p
                  className="text-[12px] font-medium text-(--ink)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.symbol}
                </p>
                <p className="text-[10px] text-(--ink-soft) truncate max-w-[120px]">{item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[11px] text-(--ink-soft)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.volume !== null ? formatNumber(item.volume) : "—"}
                </p>
                <p
                  className={`text-[11px] font-medium ${item.percentChange !== null && item.percentChange >= 0 ? "text-(--positive)" : "text-(--negative)"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatSignedPercent(item.percentChange)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-(--ink-muted) pt-2">Volume data will appear here when the API is configured.</p>
      )}
    </div>
  );
}
