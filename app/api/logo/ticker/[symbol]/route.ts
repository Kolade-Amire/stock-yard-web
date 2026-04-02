import { buildLogoDevTickerUrl, getLogoDevKey } from "@/lib/stock-yard/env";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

const VARIANT_TO_SIZE = {
  ticker: 128,
  search: 64,
} as const;

function getVariant(value: string | null) {
  return value === "search" ? "search" : "ticker";
}

function getTheme(value: string | null) {
  return value === "light" ? "light" : "dark";
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!getLogoDevKey()) {
    return new Response(null, { status: 404 });
  }

  const { symbol } = await params;
  const requestUrl = new URL(request.url);
  const variant = getVariant(requestUrl.searchParams.get("variant"));
  const theme = getTheme(requestUrl.searchParams.get("theme"));

  let upstreamUrl: URL;

  try {
    upstreamUrl = buildLogoDevTickerUrl(symbol, {
      size: VARIANT_TO_SIZE[variant],
      theme,
    });
  } catch {
    return new Response(null, { status: 404 });
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    cache: "force-cache",
  });

  if (!upstreamResponse.ok) {
    return new Response(null, { status: upstreamResponse.status === 404 ? 404 : 502 });
  }

  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");
  const cacheControl = upstreamResponse.headers.get("cache-control");
  const etag = upstreamResponse.headers.get("etag");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  if (cacheControl) {
    responseHeaders.set("cache-control", cacheControl);
  }

  if (etag) {
    responseHeaders.set("etag", etag);
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
