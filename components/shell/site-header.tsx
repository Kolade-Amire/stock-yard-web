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
  { href: homeRoute, label: "Discover" },
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
    <header className="sticky top-0 z-40 border-b border-(--line) bg-(--surface-header) backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1520px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-6 xl:px-8">
        <Link href={homeRoute} className="shrink-0">
          <LogoMark />
        </Link>
        <nav className="justify-self-center rounded-lg border border-(--line) bg-(--surface-float) px-1.5 py-1 text-sm text-(--ink-muted)">
          <div className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activeRoute === link.href ? "page" : undefined}
                style={
                  activeRoute === link.href
                    ? {
                        backgroundColor: "var(--accent)",
                        color: "var(--accent-contrast)",
                        borderColor: "var(--accent)",
                      }
                    : undefined
                }
                className={cn(
                  "rounded-md border px-3 py-1.5 transition-colors",
                  activeRoute === link.href
                    ? "text-[inherit]"
                    : "border-transparent text-(--ink-muted) hover:bg-(--surface-strong) hover:text-(--ink)",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <div className="hidden md:block">
            <HeaderCommandSearch />
          </div>
          <Link href={homeRoute} className="md:hidden">
            <Button variant="secondary" size="compact">Search</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
