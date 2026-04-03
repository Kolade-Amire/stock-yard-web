export type OwnershipDonutChartSourceItem = {
  id: string;
  label: string;
  value: number | null;
};

export type OwnershipDonutChartItem = {
  id: string;
  label: string;
  rawValue: number;
  normalizedValue: number;
  color: string;
};

const OWNERSHIP_COLOR_TOKENS = [
  "var(--ownership-1)",
  "var(--ownership-2)",
  "var(--ownership-3)",
  "var(--ownership-4)",
  "var(--ownership-5)",
] as const;

export function getOwnershipChartColor(index: number) {
  return OWNERSHIP_COLOR_TOKENS[Math.min(index, OWNERSHIP_COLOR_TOKENS.length - 1)];
}

export function buildOwnershipDonutChartItems(items: OwnershipDonutChartSourceItem[], limit = 5): OwnershipDonutChartItem[] {
  const validItems = items
    .slice(0, limit)
    .filter((item): item is OwnershipDonutChartSourceItem & { value: number } => item.value !== null && Number.isFinite(item.value) && item.value > 0);

  if (validItems.length < 2) {
    return [];
  }

  const total = validItems.reduce((sum, item) => sum + item.value, 0);

  if (!Number.isFinite(total) || total <= 0) {
    return [];
  }

  return validItems.map((item, index) => ({
    id: item.id,
    label: item.label,
    rawValue: item.value,
    normalizedValue: item.value / total,
    color: getOwnershipChartColor(index),
  }));
}
