# Stock Insight Frontend Blueprint

Build-first UI blueprint for the backend currently implemented in this repository.

This document is intentionally product- and implementation-oriented rather than visual. It defines:

- route structure
- page sections
- widget-to-endpoint mapping
- loading, empty, error, and `dataLimitations` behavior
- chat session handling

Use this as the source of truth before low-fi wireframes or visual design.

## Core Decisions

- V1 frontend should have **three primary routes**:
  - `/`
  - `/ticker/[symbol]`
  - `/compare`
- V1 chat should be **embedded on the ticker page**, not a separate `/chat/[symbol]` route.
  - Reason: the backend chat is single-symbol, the data modules are already ticker-scoped, and embedded chat keeps research context visible.
- Market discovery and ticker research should stay separate in the UI.
  - The market landing page is for exploration.
  - The ticker page is for deep research.
- The frontend must treat sparse and partial data as normal, especially for ETFs.

## Shared Frontend Rules

### Shared data-state contract

Every data widget should support these states explicitly:

- `loading`
  - render skeletons with the final layout footprint
- `success`
  - render the normalized data
- `partial`
  - render available data plus an inline limitations treatment from `dataLimitations`
- `empty`
  - render a calm empty-state card when the endpoint succeeds but usable rows are absent
- `error`
  - render a recoverable error state with retry

### Shared error handling

- `400` / `422`
  - treat as request or client-state issues
  - for search and filters, show inline validation feedback
- `404 DATA_UNAVAILABLE`
  - do not treat as a crash
  - render section-level empty states such as:
    - `No analyst data available for this symbol`
    - `Ownership data is not materially available for this symbol`
- `502 PROVIDER_ERROR`
  - show a retryable section-level failure, not a full-page app crash

### Shared `dataLimitations` treatment

- Surface `dataLimitations` at the widget level, not as a global toast.
- Use a compact info row or muted callout under the widget heading.
- If multiple sections have limitations, keep them local to those sections.

### Shared client data strategy

- Cache by endpoint + normalized query params.
- Use independent queries per major widget rather than one giant ticker-page request.
- Prioritize above-the-fold queries first:
  - overview
  - history
  - news
- Defer lower-priority research sections until initial layout is stable:
  - financials
  - earnings
  - analyst
  - ownership
  - options

## Route Map

### `/`

Purpose: market discovery and entry into ticker research.

Sections:

1. Hero search
   - ticker search input
   - recent searches or pinned symbols on the client if desired
2. Market movers
3. Benchmark funds
4. Earnings calendar
5. Sector pulse

Widget map:

| Widget | Endpoint |
| --- | --- |
| Search autocomplete | `GET /api/v1/tickers/search?q=` |
| Movers strip | `GET /api/v1/market/movers` |
| Benchmark cards | `GET /api/v1/market/benchmarks` |
| Earnings calendar table | `GET /api/v1/market/earnings-calendar` |
| Sector pulse grid | `GET /api/v1/market/sectors/pulse` |

Interaction notes:

- Search selection routes directly to `/ticker/[symbol]`.
- Earnings calendar should support pagination using:
  - `limit`
  - `offset`
- Sector cards can link to filtered market exploration later, but in V1 they can stay informational.

States:

- If movers fail, benchmark and earnings widgets should still render.
- If earnings calendar returns empty for the chosen range, show `No scheduled earnings found for this window.`

### `/ticker/[symbol]`

Purpose: deep ticker research.

Page order:

1. Ticker header
2. Price and recent context
3. News
4. Financials
5. Earnings
6. Analyst view
7. Ownership
8. Options
9. Embedded chat

#### 1. Ticker header

Primary endpoint:

- `GET /api/v1/tickers/{symbol}`

Content:

- display name
- symbol
- quote type
- exchange
- currency
- sector
- industry
- current price
- day range
- 52-week range
- market cap
- PE metrics
- dividend yield
- earnings date when available

Behavior:

- This section is the authoritative symbol validation point.
- If overview returns `404 NOT_FOUND` or `400 INVALID_SYMBOL`, route to a ticker not-found page state.

#### 2. Price and recent context

Primary endpoint:

- `GET /api/v1/tickers/{symbol}/history`

Default chart query:

- `period=6mo`
- `interval=1d`

UI:

- main price chart
- interval/period controls
- compact recent-stat row

Allowed default controls for V1:

- periods: `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `ytd`
- intervals:
  - daily and above for most users
  - intraday only when the selected period supports it

Behavior:

- Disable invalid period/interval combos in the UI instead of relying on API errors.
- If history is unavailable, keep the page alive and show a section-level chart fallback.

#### 3. News

Primary endpoint:

- `GET /api/v1/tickers/{symbol}/news?limit=10`

UI:

- lead story card
- stacked recent headlines
- article timestamps and publishers when available

Behavior:

- Show the first 5 by default with a `Show more` expansion if desired.
- If news is sparse, render fewer cards rather than a placeholder grid.

#### 4. Financials

Primary endpoints:

- `GET /api/v1/tickers/{symbol}/financial-summary`
- `GET /api/v1/tickers/{symbol}/financials/trends`

UI:

- summary KPI row
  - revenue TTM
  - net income TTM
  - free cash flow
  - margins where present
- trend charts
  - annual trend chart
  - quarterly trend chart

Behavior:

- Financial summary and trends should be independent widgets inside the same section.
- If summary succeeds and trends fail, keep the summary visible.
- If the symbol is ETF-like or sparse, show `Financial statements are not materially available for this symbol.`

#### 5. Earnings

Primary endpoints:

- `GET /api/v1/tickers/{symbol}/earnings/history`
- `GET /api/v1/tickers/{symbol}/earnings/estimates`
- use overview `earnings_date` when present for the next known date

UI:

- next earnings date callout
- recent surprise history table
- estimate trend cards or compact chart

Behavior:

- Render history and estimates independently.
- If there is no next date but historical earnings exist, do not collapse the section.
- If both endpoints are unavailable, show an earnings empty state instead of hiding the section completely.

#### 6. Analyst view

Primary endpoints:

- `GET /api/v1/tickers/{symbol}/analyst/summary`
- `GET /api/v1/tickers/{symbol}/analyst/history`

UI:

- analyst target summary
- recommendation summary
- recent analyst action timeline or table

Behavior:

- Summary is the primary card.
- History is secondary and can be collapsible on mobile.
- Sparse coverage should show `Analyst coverage is limited for this symbol.`

#### 7. Ownership

Primary endpoint:

- `GET /api/v1/tickers/{symbol}/ownership`

UI:

- major holder metrics
- segmented tabs:
  - institutional
  - mutual funds
  - insider roster
- paginated tables per section

Behavior:

- Default request:
  - `section=all&limit=5&offset=0`
- If the user opens a specific tab or paginates deeper, request:
  - `section=<tab>&limit=<pageSize>&offset=<offset>`
- Keep `majorHolders` visible even when a section tab is empty.
- Treat `404 DATA_UNAVAILABLE` as a valid empty-state outcome for ETFs and sparse symbols.

#### 8. Options

Primary endpoints:

- `GET /api/v1/tickers/{symbol}/options/expirations`
- `GET /api/v1/tickers/{symbol}/options/chain?expiration=...`

UI:

- expiration selector
- calls/puts table
- compact summary row above the chain if useful

Behavior:

- Load expirations first.
- Load the chain only after an expiration is selected.
- Default to the nearest available expiration.
- Do not attempt advanced chain filtering in V1 unless the frontend implements it entirely client-side.

#### 9. Embedded chat

Primary endpoint:

- `POST /api/v1/chat`

Placement:

- right rail on desktop or bottom sheet / accordion on mobile

Behavior:

- The chat is always scoped to the active ticker symbol.
- First request omits `sessionId`.
- Store returned `sessionId` in local page state for that ticker thread.
- Reuse `sessionId` on follow-up turns for the same symbol.
- If the user navigates to another symbol, start a fresh chat session.
- The frontend supplies conversation history; the backend does not persist it.

Chat request contract for V1:

```json
{
  "symbol": "AAPL",
  "sessionId": "optional-returned-session-id",
  "message": "What are the near-term risks?",
  "conversation": [
    {
      "role": "user",
      "content": "Earlier question"
    },
    {
      "role": "assistant",
      "content": "Earlier answer"
    }
  ]
}
```

Chat UX notes:

- Display `usedTools` only if you want a debug or transparency affordance.
- Treat empty `usedTools` as normal.
- Do not mix market-wide discovery prompts into ticker chat UI.

### `/compare`

Purpose: side-by-side price performance comparison for a small set of symbols.

Primary endpoint:

- `GET /api/v1/tickers/compare?symbols=AAPL,MSFT,SPY&period=6mo&interval=1d`

UI:

- symbol input with search-assisted add/remove
- normalized comparison chart
- legend and current relative-performance summary

Behavior:

- Limit V1 to a small symbol count in the UI, such as 2 to 5.
- Reuse the same curated history controls as the ticker chart.
- If one symbol fails validation, show inline field feedback before submitting.

## Widget Matrix

| Route | Widget | Endpoint | Priority |
| --- | --- | --- | --- |
| `/` | Search | `/tickers/search` | High |
| `/` | Movers | `/market/movers` | High |
| `/` | Benchmarks | `/market/benchmarks` | Medium |
| `/` | Earnings calendar | `/market/earnings-calendar` | Medium |
| `/` | Sector pulse | `/market/sectors/pulse` | Medium |
| `/ticker/[symbol]` | Header | `/tickers/{symbol}` | High |
| `/ticker/[symbol]` | Price chart | `/tickers/{symbol}/history` | High |
| `/ticker/[symbol]` | News | `/tickers/{symbol}/news` | High |
| `/ticker/[symbol]` | Financial summary | `/tickers/{symbol}/financial-summary` | Medium |
| `/ticker/[symbol]` | Financial trends | `/tickers/{symbol}/financials/trends` | Medium |
| `/ticker/[symbol]` | Earnings | `/tickers/{symbol}/earnings/history`, `/earnings/estimates` | Medium |
| `/ticker/[symbol]` | Analyst | `/tickers/{symbol}/analyst/summary`, `/analyst/history` | Medium |
| `/ticker/[symbol]` | Ownership | `/tickers/{symbol}/ownership` | Medium |
| `/ticker/[symbol]` | Options expirations | `/tickers/{symbol}/options/expirations` | Low |
| `/ticker/[symbol]` | Options chain | `/tickers/{symbol}/options/chain` | Low |
| `/ticker/[symbol]` | Chat | `/chat` | High |
| `/compare` | Comparison chart | `/tickers/compare` | High |

## Sparse and ETF-Specific UX Rules

These rules are mandatory for V1.

- Never collapse the full ticker page just because one research section is unavailable.
- Always keep these sections alive if overview succeeds:
  - header
  - price chart
  - news
  - chat
- For sparse sections, prefer explicit empty states over omission.
- Suggested empty-state copy:
  - financials: `Financial statement detail is not materially available for this symbol.`
  - earnings: `Earnings data is limited or unavailable for this symbol.`
  - analyst: `Analyst coverage is limited for this symbol.`
  - ownership: `Ownership data is limited or unavailable for this symbol.`

## Implementation Readiness Checklist

A frontend implementation is ready to start when:

- each route has a stable section order
- each widget has a single owning endpoint or explicit multi-endpoint pairing
- each widget has defined loading, empty, error, and `dataLimitations` behavior
- ticker chat stores and reuses `sessionId` correctly
- compare UI uses normalized symbol lists and curated history controls
- no market-discovery widget is incorrectly embedded into ticker chat

## Recommended Next Artifact

After this blueprint, the next artifact should be:

1. low-fi wireframes for `/`, `/ticker/[symbol]`, and `/compare`
2. visual direction brief
3. frontend implementation scaffold

If you bring Figma, screenshots, or product references next, adapt them to this blueprint rather than replacing it.
