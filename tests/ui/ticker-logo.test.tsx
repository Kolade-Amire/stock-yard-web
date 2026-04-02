import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TickerLogo } from "@/components/ui/ticker-logo";

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from "@/components/theme/theme-provider";

describe("TickerLogo", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("builds a proxy url for the active app theme", () => {
    vi.mocked(useTheme).mockReturnValue({
      mounted: true,
      resolvedTheme: "light",
      themePreference: "light",
      setThemePreference: vi.fn(),
      toggleTheme: vi.fn(),
    });

    const { container } = render(<TickerLogo symbol="aapl" variant="search" />);

    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    expect(image).toHaveAttribute("src", "/api/logo/ticker/AAPL?variant=search&theme=light");
  });

  it("hides itself after an image load failure", () => {
    vi.mocked(useTheme).mockReturnValue({
      mounted: true,
      resolvedTheme: "dark",
      themePreference: "dark",
      setThemePreference: vi.fn(),
      toggleTheme: vi.fn(),
    });

    const { container } = render(<TickerLogo symbol="aapl" variant="ticker" />);

    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(container).toBeEmptyDOMElement();
  });
});
