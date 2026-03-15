export const DEFAULT_TICKER_HISTORY_PERIOD = "6mo";
export const DEFAULT_TICKER_HISTORY_INTERVAL = "1d";
export const DEFAULT_COMPARE_SYMBOLS = ["AAPL", "MSFT", "SPY"] as const;
export const DEFAULT_COMPARE_PERIOD = "6mo";
export const DEFAULT_COMPARE_INTERVAL = "1d";

export const HISTORY_PERIODS = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "ytd"] as const;
export const HISTORY_INTERVALS = ["1d", "1wk", "1mo"] as const;

export const HISTORY_INTERVALS_BY_PERIOD: Record<(typeof HISTORY_PERIODS)[number], (typeof HISTORY_INTERVALS)[number][]> = {
  "1mo": ["1d", "1wk"],
  "3mo": ["1d", "1wk", "1mo"],
  "6mo": ["1d", "1wk", "1mo"],
  "1y": ["1d", "1wk", "1mo"],
  "2y": ["1d", "1wk", "1mo"],
  "5y": ["1wk", "1mo"],
  ytd: ["1d", "1wk", "1mo"],
};

export const HOME_MOVER_SCREENS = [
  { key: "gainers", label: "Leaders" },
  { key: "losers", label: "Lagging" },
  { key: "most_active", label: "Most Active" },
] as const;
