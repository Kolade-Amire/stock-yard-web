import { type ZodType } from "zod";

import { buildStockYardApiUrl } from "@/lib/stock-yard/env";
import { errorEnvelopeSchema } from "@/lib/stock-yard/schemas";

export class StockYardApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "StockYardApiError";
  }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

function toStockYardError(response: Response, payload: unknown) {
  const parsed = errorEnvelopeSchema.safeParse(payload);

  if (parsed.success) {
    return new StockYardApiError(
      parsed.data.error.message,
      response.status,
      parsed.data.error.code,
      parsed.data.error.details,
    );
  }

  return new StockYardApiError(`Stock-Yard request failed with ${response.status}.`, response.status, "INTERNAL_ERROR");
}

async function parseStockYardResponse<T>(response: Response, schema: ZodType<T>) {
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw toStockYardError(response, payload);
  }

  return schema.parse(payload);
}

type FetchOptions = RequestInit & {
  revalidate?: number;
};

export async function fetchStockYardServer<T>(path: string, schema: ZodType<T>, options: FetchOptions = {}) {
  const { revalidate, headers, ...requestInit } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("accept", "application/json");

  if (requestInit.body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  const response = await fetch(buildStockYardApiUrl(path), {
    ...requestInit,
    headers: requestHeaders,
    next: revalidate ? { revalidate } : undefined,
    cache: requestInit.cache ?? (revalidate ? "force-cache" : "no-store"),
  });

  return parseStockYardResponse(response, schema);
}

export async function fetchStockYardBrowser<T>(
  path: string,
  schema: ZodType<T>,
  options: RequestInit = {},
) {
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.headers ?? {}),
    },
    cache: options.cache ?? "no-store",
  });

  return parseStockYardResponse(response, schema);
}

export function isStockYardApiError(error: unknown): error is StockYardApiError {
  return error instanceof StockYardApiError;
}
