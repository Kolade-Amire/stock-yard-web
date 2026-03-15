const API_PREFIX = "/api/v1";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function getStockYardApiOrigin() {
  const configured = process.env.STOCK_YARD_API_BASE_URL?.trim();

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
