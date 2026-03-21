import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/shell/site-header";
import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Stock-Yard",
  description: "Fast, research-heavy stock intelligence on top of the Stock-Yard API.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen text-(--ink)">
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,0.32),transparent_28%),radial-gradient(circle_at_top_left,rgba(229,196,142,0.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,78,69,0.1),transparent_30%)]" />
            <SiteHeader />
            <main className="relative mx-auto flex max-w-[1520px] flex-col gap-8 px-4 py-6 md:px-6 md:py-8 xl:px-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
