"use client";

import { useEffect } from "react";

import { pushRecentSymbol } from "@/lib/recent-symbols";

type RecentSymbolTrackerProps = {
  symbol: string;
};

export function RecentSymbolTracker({ symbol }: RecentSymbolTrackerProps) {
  useEffect(() => {
    pushRecentSymbol(symbol);
  }, [symbol]);

  return null;
}
