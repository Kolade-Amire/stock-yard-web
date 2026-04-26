import Link from "next/link";

import { tickerRoute } from "@/lib/routes";
import type { NewsResponse } from "@/lib/stock-yard/schemas";

type NewsItem = NewsResponse["news"][number];

type NewsHeadlinesProps = {
  news: Array<{ symbol: string; item: NewsItem }>;
};

function timeAgo(published: string | null): string {
  if (!published) return "";
  const diff = Date.now() - new Date(published).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NewsHeadlines({ news }: NewsHeadlinesProps) {
  return (
    <div className="px-6 py-5">
      <p
        className="text-[9px] tracking-[0.12em] uppercase text-(--ink-soft) mb-3.5 pb-2.5 border-b border-(--line)"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Market headlines
      </p>

      {news.length ? (
        <div>
          {news.map(({ symbol, item }) => (
            <div
              key={`${symbol}-${item.published_at}`}
              className="py-2 border-b border-(--line) last:border-b-0"
            >
              <p className="text-[12px] font-medium text-(--ink) leading-[1.45] mb-1">
                <Link
                  href={tickerRoute(symbol)}
                  className="inline-block text-[9px] font-medium px-1.5 py-[2px] rounded mr-1.5 border align-middle"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--gold-soft)",
                    borderColor: "var(--gold-border)",
                    color: "var(--gold)",
                  }}
                >
                  {symbol}
                </Link>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-(--gold) transition-colors"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </p>
              <p
                className="text-[10px] text-(--ink-soft)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item.publisher && <span>{item.publisher} · </span>}
                {timeAgo(item.published_at)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-(--ink-muted) pt-2">Headlines will appear once the API is configured.</p>
      )}
    </div>
  );
}
