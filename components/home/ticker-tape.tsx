import { formatCurrency, formatSignedPercent } from "@/lib/stock-yard/format";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type TickerTapeProps = {
  data: MoversResponse | null;
};

export function TickerTape({ data }: TickerTapeProps) {
  const items = data?.results ?? [];
  if (!items.length) return null;

  // Duplicate for seamless loop
  const tape = [...items, ...items];

  return (
    <div
      className="border-b border-(--line) overflow-hidden h-[34px] flex items-center bg-(--surface-muted)"
      aria-hidden="true"
    >
      <div className="ticker-tape-inner">
        {tape.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="inline-flex items-center gap-1.5 px-5 border-r border-(--line) h-[34px]"
          >
            <span
              className="text-[11px] font-medium text-(--ink)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {item.symbol}
            </span>
            <span
              className="text-[11px] text-(--ink-muted)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatCurrency(item.currentPrice)}
            </span>
            <span
              className={`text-[10px] ${item.percentChange !== null && item.percentChange >= 0 ? "text-(--positive)" : "text-(--negative)"}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatSignedPercent(item.percentChange)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
