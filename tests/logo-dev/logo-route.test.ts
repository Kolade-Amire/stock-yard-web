import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stock-yard/env", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stock-yard/env")>("@/lib/stock-yard/env");

  return {
    ...actual,
    getLogoDevKey: vi.fn(),
    buildLogoDevTickerUrl: vi.fn(),
  };
});

import { buildLogoDevTickerUrl, getLogoDevKey } from "@/lib/stock-yard/env";
import { GET } from "@/app/api/logo/ticker/[symbol]/route";

describe("logo ticker proxy route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 404 when LOGO_DEV_KEY is missing", async () => {
    vi.mocked(getLogoDevKey).mockReturnValue(null);

    const response = await GET(new Request("http://localhost/api/logo/ticker/aapl?variant=search&theme=light"), {
      params: Promise.resolve({ symbol: "aapl" }),
    });

    expect(response.status).toBe(404);
  });

  it("forwards variant size and theme through the Logo.dev url builder", async () => {
    vi.mocked(getLogoDevKey).mockReturnValue("pk_test");
    vi.mocked(buildLogoDevTickerUrl).mockReturnValue(new URL("https://img.logo.dev/ticker/AAPL?token=pk_test&size=64&theme=light&format=png&fallback=404&retina=true"));

    const fetchMock = vi.fn().mockResolvedValue(
      new Response("image", {
        status: 200,
        headers: {
          "content-type": "image/png",
          "cache-control": "public, max-age=60",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/logo/ticker/aapl?variant=search&theme=light"), {
      params: Promise.resolve({ symbol: "aapl" }),
    });

    expect(buildLogoDevTickerUrl).toHaveBeenCalledWith("aapl", {
      size: 64,
      theme: "light",
    });
    expect(fetchMock).toHaveBeenCalledWith(expect.any(URL), { cache: "force-cache" });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("returns 404 when Logo.dev returns 404", async () => {
    vi.mocked(getLogoDevKey).mockReturnValue("pk_test");
    vi.mocked(buildLogoDevTickerUrl).mockReturnValue(new URL("https://img.logo.dev/ticker/MISSING?token=pk_test"));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    const response = await GET(new Request("http://localhost/api/logo/ticker/missing?variant=ticker&theme=dark"), {
      params: Promise.resolve({ symbol: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
