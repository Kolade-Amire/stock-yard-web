import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Mono, DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";

import { SiteHeader } from "@/components/shell/site-header";
import { Providers } from "@/app/providers";
import { getThemeBootstrapScript } from "@/lib/theme";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Stock Yard",
  description: "Fast, research-heavy stock intelligence on top of the Stock Yard API.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeBootstrapScript()}
        </Script>
        <Providers>
          <div className="min-h-screen text-(--ink)">
            <SiteHeader />
            <main className="relative mx-auto max-w-[1520px] flex flex-col">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
