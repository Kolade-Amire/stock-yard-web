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
  const remainder = data?.news.slice(1, 4) ?? [];

  return (
    <Card variant="rail" material="glass" className="px-4 py-4">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">News</p>
        <h2 className="mt-1 text-lg font-semibold text-(--ink-strong)">Latest headlines</h2>
      </div>
      {lead ? (
        <div className="space-y-2">
          <article className="rounded-xl border border-(--line) bg-(--surface) p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{lead.publisher ?? formatDateTime(lead.published_at)}</p>
            <h3 className="mt-2 text-base font-bold leading-snug text-(--ink-strong)">{lead.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-(--ink-muted)">{lead.summary ?? "Summary unavailable."}</p>
            {lead.link ? (
              <a href={lead.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--accent)">
                Read source <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </article>
          {remainder.map((item) => (
            <article key={`${item.title}-${item.published_at}`} className="rounded-lg border border-(--line) bg-(--surface) px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-(--ink-soft)">{item.publisher ?? formatDateTime(item.published_at)}</p>
              <h4 className="mt-1.5 text-sm font-semibold text-(--ink)">{item.title}</h4>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-(--ink-muted) hover:text-(--accent)">
                  Open <ArrowUpRight className="size-3.5" />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-(--line-strong) px-4 py-8 text-center text-sm text-(--ink-muted)">
          No ticker news available right now.
        </div>
      )}
      <div className="mt-3">
        <DataLimitations items={data?.dataLimitations ?? []} />
      </div>
    </Card>
  );
}
