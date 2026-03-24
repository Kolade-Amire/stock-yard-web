"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { pushRecentSymbol } from "@/lib/recent-symbols";
import { tickerRoute } from "@/lib/routes";

export function HeaderCommandSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const symbol = query.trim().toUpperCase();

    if (!symbol) {
      return;
    }

    pushRecentSymbol(symbol);

    startTransition(() => {
      router.push(tickerRoute(symbol));
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-[260px] items-center gap-2 rounded-lg border border-(--line) bg-(--surface) px-3 py-2"
    >
      <Search className="size-4 text-(--ink-soft)" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search symbol…"
        className="w-full bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-soft)"
      />
      <Button type="submit" variant="secondary" size="compact">
        Go
      </Button>
    </form>
  );
}
