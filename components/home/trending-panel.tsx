import Link from "next/link";

import { tickerRoute } from "@/lib/routes";
import { formatSignedPercent } from "@/lib/stock-yard/format";
import { compareRoute } from "@/lib/routes";
import type { MoversResponse } from "@/lib/stock-yard/schemas";

type TrendingPanelProps = {
  data: MoversResponse | null;
};

export function TrendingPanel({ data }: TrendingPanelProps) {
  const items = (data?.results ?? []).slice(0, 6);
  const maxVolume = Math.max(...items.map((i) => i.volume ?? 0), 1);

  return (
    <div className="border-b lg:border-b-0 border-r-0 lg:border-r border-(--line) px-6 py-5">
      <p
        className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft) mb-3.5 pb-2.5 border-b border-(--line)"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Trending · 24h
      </p>

      {items.length ? (
        <div>
          {items.map((item, i) => {
            const vol = item.volume ?? 0;
            const barPct = Math.round((vol / maxVolume) * 100);
            return (
              <Link
                key={item.symbol}
                href={tickerRoute(item.symbol)}
                className="flex items-center gap-2.5 py-[7px] border-b border-(--line) last:border-b-0 hover:bg-(--surface-muted) -mx-2 px-2 rounded transition-colors"
              >
                <span
                  className="text-[10px] text-(--ink-soft) min-w-[18px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-[12px] font-medium text-(--ink) min-w-[42px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.symbol}
                </span>
                <div className="flex-1 h-[3px] rounded-full bg-(--surface-strong)">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${barPct}%`, background: "var(--gold)" }}
                  />
                </div>
                <span
                  className={`text-[10px] shrink-0 ${item.percentChange !== null && item.percentChange >= 0 ? "text-(--positive)" : "text-(--negative)"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatSignedPercent(item.percentChange)}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-(--ink-muted) pt-2">Trending data will appear here when the API is configured.</p>
      )}

      {/* Editorial AI CTA */}
      <div className="mt-5 pt-4 border-t border-(--line)">
        <p
          className="text-[16px] font-normal leading-[1.3] text-(--ink-strong) mb-2 italic"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          "Why is the market moving today?"
        </p>
        <p className="text-[11px] text-(--ink-muted) leading-[1.6] mb-3">
          Ask the AI anything about a ticker — earnings, analyst targets, recent news, ownership. Grounded answers only.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={compareRoute}
            className="text-[11px] font-medium px-4 py-2 rounded-lg text-(--canvas) transition-colors"
            style={{ background: "var(--ink)" }}
          >
            ✦ Try AI Chat
          </Link>
          <span
            className="text-[10px] text-(--ink-soft)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            search any ticker first
          </span>
        </div>
      </div>
    </div>
  );
}
