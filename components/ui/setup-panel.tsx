import { Card } from "@/components/ui/card";

export function SetupPanel() {
  return (
    <Card variant="band" className="px-5 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-(--ink-soft)">Configuration</p>
        <h2 className="text-xl font-bold text-(--ink-strong) sm:text-2xl">Connect the Stock Yard API</h2>
        <p className="max-w-2xl text-sm leading-6 text-(--ink-muted) md:text-base">
          Set <code className="rounded bg-(--surface-strong) px-1.5 py-0.5">STOCK_YARD_API_BASE_URL</code> in your
          local environment to render live market data and chat responses.
        </p>
        <p className="max-w-2xl text-sm leading-6 text-(--ink-muted) md:text-base">
          Add <code className="rounded bg-(--surface-strong) px-1.5 py-0.5">LOGO_DEV_KEY</code> to enable ticker logos
          in the header and search previews.
        </p>
      </div>
    </Card>
  );
}
