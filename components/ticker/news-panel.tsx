import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { DataLimitations } from "@/components/ui/data-limitations";
import { formatDateTime } from "@/lib/stock-yard/format";
import type { NewsResponse } from "@/lib/stock-yard/schemas";

type NewsPanelProps = {
  data: NewsResponse | null;
};

export function NewsPanel({ data }: NewsPanelProps) {
  const lead = data?.news[0] ?? null;
  const remainder = data?.news.slice(1) ?? [];
  const dataLimitations = data?.dataLimitations ?? [];

  return (
    <Card variant="band" className="overflow-hidden px-0 py-0">
      <div className="border-b border-(--line) px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--ink-soft)">News</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-(--ink-strong)">Latest headlines</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">Keep narrative context separate from the financial tabs, but available in one dedicated reading surface.</p>
      </div>
      {lead ? (
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <article className="border-b border-(--line) px-5 py-5 xl:border-b-0 xl:border-r">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-(--ink-soft)">{lead.publisher ?? formatDateTime(lead.published_at)}</p>
            <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-(--ink-strong)">{lead.title}</h3>
            <p className="mt-3 text-sm leading-7 text-(--ink-muted)">{lead.summary ?? "Summary unavailable."}</p>
            {lead.link ? (
              <a href={lead.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--accent)">
                Read source <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </article>
          <div className="divide-y divide-(--line)">
            {remainder.map((item) => (
              <article key={`${item.title}-${item.published_at}`} className="px-5 py-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-(--ink-soft)">{item.publisher ?? formatDateTime(item.published_at)}</p>
                <h4 className="mt-2 text-sm font-semibold leading-snug text-(--ink) sm:text-base">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">{item.summary ?? "Summary unavailable."}</p>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-(--ink-muted) hover:text-(--accent)">
                    Open
                    <ArrowUpRight className="size-3.5" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-(--ink-muted)">
          No ticker news available right now.
        </div>
      )}
      {dataLimitations.length ? (
        <div className="border-t border-(--line) px-5 py-4">
          <DataLimitations items={dataLimitations} />
        </div>
      ) : null}
    </Card>
  );
}
