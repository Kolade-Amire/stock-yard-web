import { Card } from "@/components/ui/card";

export function SetupPanel() {
  return (
    <Card className="px-6 py-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-(--ink-soft)">Configuration</p>
        <h2 className="font-(family-name:--font-display) text-3xl text-(--ink)">Connect the Stock-Yard API</h2>
        <p className="max-w-2xl text-sm text-(--ink-muted) md:text-base">
          Set <code className="rounded bg-(--surface-strong) px-1.5 py-0.5">STOCK_YARD_API_BASE_URL</code> in your
          local environment to render live market data and chat responses.
        </p>
      </div>
    </Card>
  );
}
