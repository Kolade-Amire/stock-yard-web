"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { mounted, resolvedTheme, toggleTheme } = useTheme();

  if (!mounted) {
    return <div aria-hidden="true" className="glass-control size-9 shrink-0 rounded-xl" />;
  }

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;
  const Icon = resolvedTheme === "dark" ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="secondary"
      size="compact"
      className="glass-control size-9 shrink-0 rounded-xl border-(--glass-rim) bg-transparent p-0 text-(--ink) shadow-none"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <Icon className="size-4" />
    </Button>
  );
}
