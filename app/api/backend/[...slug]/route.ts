import { getStockYardApiOrigin } from "@/lib/stock-yard/env";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

function buildErrorResponse(message: string, status: number) {
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message,
        details: {},
      },
    },
    { status },
  );
}

async function forwardRequest(request: Request, { params }: RouteContext) {
  const origin = getStockYardApiOrigin();

  if (!origin) {
    return buildErrorResponse("STOCK_YARD_API_BASE_URL is not configured.", 500);
  }

  const { slug } = await params;
  const upstreamUrl = new URL(`${origin}/api/v1/${slug.join("/")}`);
  upstreamUrl.search = new URL(request.url).search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");

  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new Response(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forwardRequest(request, context);
}
