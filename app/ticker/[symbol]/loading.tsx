import { Card } from "@/components/ui/card";

export default function TickerLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card className="h-[320px] animate-pulse bg-(--surface)" />
        <Card className="h-[520px] animate-pulse bg-(--surface)" />
        <Card className="h-[380px] animate-pulse bg-(--surface)" />
      </div>
      <Card className="h-[420px] animate-pulse bg-(--surface)" />
    </div>
  );
}
