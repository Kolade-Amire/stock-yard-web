import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MicroBarChart } from "@/components/charts/micro-bar-chart";

describe("MicroBarChart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not emit duplicate-key warnings when labels collide but ids differ", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MicroBarChart
        items={[
          { id: "consumer-cyclical", label: "Cons", value: 12 },
          { id: "consumer-defensive", label: "Cons", value: 18 },
        ]}
      />,
    );

    const duplicateKeyWarningLogged = consoleError.mock.calls.some((args) =>
      args.some((value) => String(value).includes("Encountered two children with the same key")),
    );

    expect(duplicateKeyWarningLogged).toBe(false);
    expect(screen.getAllByText("Cons")).toHaveLength(2);
  });
});
