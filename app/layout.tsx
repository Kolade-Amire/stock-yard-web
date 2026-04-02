import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Dancing_Script, Inter } from "next/font/google";
import Script from "next/script";

import { SiteHeader } from "@/components/shell/site-header";
import { Providers } from "@/app/providers";
import { getThemeBootstrapScript } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-wordmark",
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
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeBootstrapScript()}
        </Script>
        <Providers>
          <div className="min-h-screen text-(--ink)">
            <SiteHeader />
            <main className="relative mx-auto flex max-w-[1520px] flex-col gap-8 px-4 py-6 md:px-6 md:py-8 xl:px-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
