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
  const remainder = data?.news.slice(1, 6) ?? [];

  return (
    <Card className="px-5 py-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">News</p>
        <h2 className="mt-2 font-(family-name:--font-display) text-3xl text-(--ink)">Headline context</h2>
      </div>
      {lead ? (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[28px] bg-[linear-gradient(145deg,rgba(202,140,71,0.16),rgba(255,250,238,0.74))] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">{lead.publisher ?? "Story"}</p>
            <h3 className="mt-3 font-(family-name:--font-display) text-3xl text-(--ink)">{lead.title}</h3>
            <p className="mt-4 text-sm leading-6 text-(--ink-muted)">{lead.summary ?? "Summary unavailable."}</p>
            {lead.link ? (
              <a href={lead.link} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-(--ink)">
                Read source <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </article>
          <div className="space-y-3">
            {remainder.map((item) => (
              <article key={`${item.title}-${item.published_at}`} className="rounded-[24px] border border-(--line) px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">{item.publisher ?? formatDateTime(item.published_at)}</p>
                <h4 className="mt-2 text-base font-semibold text-(--ink)">{item.title}</h4>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-(--ink-muted)">
                    Open <ArrowUpRight className="size-4" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-(--line-strong) px-4 py-10 text-center text-sm text-(--ink-muted)">
          No ticker news available right now.
        </div>
      )}
      <div className="mt-4">
        <DataLimitations items={data?.dataLimitations ?? []} />
      </div>
    </Card>
  );
}
