const API_PREFIX = "/api/v1";
const LOGO_DEV_ORIGIN = "https://img.logo.dev";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

function normalizeEnvValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getStockYardApiOrigin() {
  const configured = normalizeEnvValue(process.env.STOCK_YARD_API_BASE_URL);

  return configured ? normalizeBaseUrl(configured) : null;
}

export function isStockYardConfigured() {
  return Boolean(getStockYardApiOrigin());
}

export function buildStockYardApiUrl(path: string) {
  const origin = getStockYardApiOrigin();

  if (!origin) {
    throw new Error("STOCK_YARD_API_BASE_URL is not configured.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(`${origin}${API_PREFIX}${normalizedPath}`);
}

export function getLogoDevKey() {
  return normalizeEnvValue(process.env.LOGO_DEV_KEY);
}

export function buildLogoDevTickerUrl(symbol: string, options: {
  size: number;
  theme: "light" | "dark";
}) {
  const token = getLogoDevKey();

  if (!token) {
    throw new Error("LOGO_DEV_KEY is not configured.");
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error("Ticker symbol is required.");
  }

  const url = new URL(`${LOGO_DEV_ORIGIN}/ticker/${encodeURIComponent(normalizedSymbol)}`);
  url.searchParams.set("token", token);
  url.searchParams.set("size", String(options.size));
  url.searchParams.set("format", "png");
  url.searchParams.set("fallback", "404");
  url.searchParams.set("retina", "true");
  url.searchParams.set("theme", options.theme);

  return url;
}
