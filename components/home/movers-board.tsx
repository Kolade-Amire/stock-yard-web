import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatSignedPercent } from "@/lib/stock-yard/format";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type MoversBoardProps = {
  data: MoversResponse | null;
  label: string;
};

export function MoversBoard({ data, label }: MoversBoardProps) {
  return (
    <Card className="px-5 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-display) text-2xl text-(--ink)">{label}</h3>
        <p className="text-xs uppercase tracking-[0.28em] text-(--ink-soft)">Movers</p>
      </div>
      {data ? (
        <div className="space-y-3">
          {data.results.slice(0, 6).map((item) => (
            <div key={item.symbol} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-(--line) px-4 py-3">
              <div>
                <p className="font-semibold text-(--ink)">{item.symbol}</p>
                <p className="truncate text-sm text-(--ink-muted)">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-(--ink)">{formatCurrency(item.currentPrice)}</p>
                <p className={item.percentChange !== null && item.percentChange >= 0 ? "text-sm text-(--positive)" : "text-sm text-(--negative)"}>
                  {formatSignedPercent(item.percentChange)}
                </p>
                <p className="text-xs text-(--ink-soft)">{formatNumber(item.volume)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-(--ink-muted)">Mover data will appear here when the API is configured.</p>
      )}
    </Card>
  );
}
