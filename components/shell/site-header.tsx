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

  const navLinks = (
    <div className="flex items-center justify-center gap-0.5">
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
            "rounded-lg border px-3 py-1.5 transition-colors",
            activeRoute === link.href
              ? "text-[inherit] shadow-[var(--shadow-muted)]"
              : "glass-pill-link border-transparent text-(--ink-muted)",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-3 sm:pt-3 md:px-5 xl:px-7">
      <div className="glass-header-bar mx-auto max-w-[1540px] rounded-[1.2rem] sm:rounded-[1.35rem]">
        <div className="mx-auto max-w-[1520px] px-3 py-3 sm:px-4 md:px-6 xl:px-8">
          <div className="relative flex flex-col gap-3 lg:min-h-[3rem] lg:justify-center">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <Link href={homeRoute} className="min-w-0 shrink">
                <LogoMark />
              </Link>
              <div className="flex items-center gap-2 justify-self-end">
                <div className="hidden xl:block">
                  <HeaderCommandSearch />
                </div>
                <Link href={homeRoute} className="xl:hidden">
                  <Button
                    variant="secondary"
                    size="compact"
                    className="glass-control border-(--glass-rim) bg-transparent px-3 py-2 text-(--ink) shadow-none sm:px-3.5"
                  >
                    Search
                  </Button>
                </Link>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex justify-center lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2">
              <nav className="pointer-events-auto glass-pill-nav w-full max-w-full rounded-xl px-1.5 py-1 text-sm text-(--ink-muted) lg:w-auto">
                {navLinks}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
