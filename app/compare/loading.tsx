import { Card } from "@/components/ui/card";

export default function CompareLoading() {
  return (
    <div className="space-y-6">
      <Card variant="band" className="h-[220px] animate-pulse" />
      <Card variant="panel" className="h-[560px] animate-pulse" />
    </div>
  );
}
