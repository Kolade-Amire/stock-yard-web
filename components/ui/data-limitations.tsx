import { AlertCircle } from "lucide-react";

type DataLimitationsProps = {
  items: string[];
};

export function DataLimitations({ items }: DataLimitationsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface-strong) px-4 py-3 text-sm text-(--ink-muted)">
      <div className="mb-2 flex items-center gap-2 font-medium text-(--ink)">
        <AlertCircle className="size-4 text-(--accent)" />
        Data limitations
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
