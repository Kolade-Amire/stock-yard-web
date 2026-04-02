import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/shell/site-header";
import { Providers } from "@/app/providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stock-Yard",
  description: "Fast, research-heavy stock intelligence on top of the Stock-Yard API.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
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
