import Link from "next/link";

import { LogoMark } from "@/components/ui/logo-mark";
import { compareRoute, homeRoute } from "@/lib/routes";

const NAV_LINKS = [
  { href: homeRoute, label: "Discover" },
  { href: compareRoute, label: "Compare" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-(--line) bg-[color:rgba(244,236,216,0.82)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-4 md:px-6 xl:px-10">
        <Link href={homeRoute} className="shrink-0">
          <LogoMark />
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-(--line) bg-(--surface) px-2 py-2 text-sm text-(--ink-muted)">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 transition-colors hover:bg-(--surface-strong) hover:text-(--ink)"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
