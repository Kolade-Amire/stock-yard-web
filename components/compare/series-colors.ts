const COMPARE_SERIES_COLOR_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function getCompareSeriesColor(index: number) {
  return COMPARE_SERIES_COLOR_TOKENS[index] ?? COMPARE_SERIES_COLOR_TOKENS[COMPARE_SERIES_COLOR_TOKENS.length - 1];
}
