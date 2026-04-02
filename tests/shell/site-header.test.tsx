import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/shell/site-header";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/shell/header-command-search", () => ({
  HeaderCommandSearch: () => <div data-testid="header-search" />,
}));

describe("SiteHeader", () => {
  it("marks Discover as active on home", () => {
    mockUsePathname.mockReturnValue("/");

    render(<SiteHeader />);

    const discoverLink = screen.getByRole("link", { name: "Discover" });
    const compareLink = screen.getByRole("link", { name: "Compare" });

    expect(discoverLink).toHaveAttribute("aria-current", "page");
    expect(compareLink).not.toHaveAttribute("aria-current");
  });

  it("marks Discover as active on ticker routes", () => {
    mockUsePathname.mockReturnValue("/ticker/AAPL");

    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
  });

  it("marks Compare as active on compare routes", () => {
    mockUsePathname.mockReturnValue("/compare");

    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Discover" })).not.toHaveAttribute("aria-current");
  });

  it("applies explicit contrast styles to the active route", () => {
    mockUsePathname.mockReturnValue("/compare");

    render(<SiteHeader />);

    const activeLink = screen.getByRole("link", { name: "Compare" });
    const style = activeLink.getAttribute("style");

    expect(style).toContain("background-color: var(--accent)");
    expect(style).toContain("color: var(--accent-contrast)");
    expect(style).toContain("border-color: var(--accent)");
  });
});
