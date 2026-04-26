"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoMark } from "@/components/ui/logo-mark";
import { compareRoute, homeRoute } from "@/lib/routes";
import { HeaderCommandSearch } from "@/components/shell/header-command-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: homeRoute, label: "Markets" },
  { href: compareRoute, label: "Compare" },
];

export function getActiveHeaderRoute(pathname: string | null) {
  if (pathname?.startsWith(compareRoute)) {
    return compareRoute;
  }
  return homeRoute;
}

export function SiteHeader() {
  const pathname = usePathname();
  const activeRoute = getActiveHeaderRoute(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-(--line-strong) bg-(--canvas)">
      <div className="mx-auto max-w-[1520px] flex items-center h-[54px] px-4 md:px-6 xl:px-8">
        <Link href={homeRoute} className="shrink-0 mr-9">
          <LogoMark />
        </Link>

        <nav className="flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={activeRoute === link.href ? "page" : undefined}
              className={cn(
                "text-xs px-[11px] py-[5px] rounded-md transition-colors",
                activeRoute === link.href
                  ? "bg-(--surface-muted) text-(--ink) font-medium"
                  : "text-(--ink-muted) hover:text-(--ink)",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <HeaderCommandSearch />
          </div>
          <Link href={homeRoute} className="xl:hidden">
            <Button
              variant="secondary"
              size="compact"
              className="border-(--line-strong) bg-(--surface-muted) px-3 py-1.5 text-(--ink) shadow-none text-xs"
            >
              Search
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
