import { Card } from "@/components/ui/card";

export default function TickerLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card variant="band" className="h-[250px] animate-pulse" />
        <Card variant="panel" className="h-[500px] animate-pulse" />
        <Card variant="band" className="h-[520px] animate-pulse" />
      </div>
      <div className="space-y-6">
        <Card variant="rail" className="h-[280px] animate-pulse" />
        <Card variant="rail" className="h-[420px] animate-pulse" />
      </div>
    </div>
  );
}
