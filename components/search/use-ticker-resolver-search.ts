"use client";

import { useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, useId, useMemo, useState } from "react";

import { stockYardClient } from "@/lib/stock-yard/client";
import type { SearchResult } from "@/lib/stock-yard/schemas";

const MIN_QUERY_LENGTH = 2;
const EMPTY_RESULTS: SearchResult[] = [];

type UseTickerResolverSearchOptions = {
  maxResults?: number;
  onResolve: (result: SearchResult) => boolean | void;
};

export function useTickerResolverSearch({ maxResults = 6, onResolve }: UseTickerResolverSearchOptions) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = useId();

  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const searchQuery = useQuery({
    queryKey: ["ticker-search", trimmedQuery],
    queryFn: () => stockYardClient.searchTickers(trimmedQuery),
    enabled: shouldSearch,
    staleTime: 60_000,
  });

  const results = useMemo(
    () => searchQuery.data?.results.slice(0, maxResults) ?? EMPTY_RESULTS,
    [maxResults, searchQuery.data?.results],
  );

  const shouldShowResults = isOpen && shouldSearch;
  const resolvedActiveIndex = results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1);
  const activeResult = results[resolvedActiveIndex] ?? results[0] ?? null;
  const activeDescendantId = activeResult ? getOptionId(listboxId, resolvedActiveIndex) : undefined;
  const canSubmit = activeResult !== null;

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setActiveIndex(0);
    setIsOpen(nextQuery.trim().length >= MIN_QUERY_LENGTH);
  }

  function resolveSelection(result: SearchResult) {
    const shouldReset = onResolve(result);

    if (shouldReset === false) {
      return false;
    }

    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
    return true;
  }

  function submitActiveResult() {
    if (activeResult === null) {
      return false;
    }

    return resolveSelection(activeResult);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        if (results.length === 0) {
          return;
        }

        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => (isOpen ? Math.min(current + 1, results.length - 1) : 0));
        return;
      case "ArrowUp":
        if (results.length === 0) {
          return;
        }

        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => (isOpen ? Math.max(current - 1, 0) : 0));
        return;
      case "Enter":
        if (!canSubmit) {
          return;
        }

        event.preventDefault();
        submitActiveResult();
        return;
      case "Escape":
        if (!shouldShowResults) {
          return;
        }

        event.preventDefault();
        setIsOpen(false);
        return;
      default:
        return;
    }
  }

  function handleInputFocus() {
    if (shouldSearch) {
      setIsOpen(true);
    }
  }

  function handleResultMouseEnter(index: number) {
    setActiveIndex(index);
  }

  function handleResultSelect(result: SearchResult) {
    resolveSelection(result);
  }

  return {
    query,
    setQuery: updateQuery,
    results,
    activeIndex: resolvedActiveIndex,
    activeDescendantId,
    canSubmit,
    errorMessage: searchQuery.error instanceof Error ? searchQuery.error.message : null,
    handleInputFocus,
    handleInputKeyDown,
    handleResultMouseEnter,
    handleResultSelect,
    isPending: searchQuery.isPending,
    listboxId,
    shouldSearch,
    shouldShowResults,
    submitActiveResult,
  };
}

export function getOptionId(listboxId: string, index: number) {
  return `${listboxId}-option-${index}`;
}
