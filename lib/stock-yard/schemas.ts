import { z } from "zod";

const nullableString = z.string().nullable().optional().transform((value) => value ?? null);
const nullableNumber = z.number().nullable().optional().transform((value) => value ?? null);
const nullableBoolean = z.boolean().nullable().optional().transform((value) => value ?? null);

const paginationSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  returnedCount: z.number(),
  totalAvailable: z.number().nullable().optional().transform((value) => value ?? null),
  hasMore: z.boolean(),
  nextOffset: z.number().nullable().optional().transform((value) => value ?? null),
});

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).default({}),
  }),
});

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(
    z.object({
      symbol: z.string(),
      name: z.string(),
      exchange: nullableString,
      quoteType: z.string(),
    }),
  ),
});

export type SearchResult = z.infer<typeof searchResponseSchema>["results"][number];

export const tickerOverviewSchema = z.object({
  symbol: z.string(),
  overview: z.object({
    display_name: z.string(),
    quote_type: z.string(),
    exchange: nullableString,
    currency: nullableString,
    sector: nullableString,
    industry: nullableString,
    website: nullableString,
    summary: nullableString,
    current_price: nullableNumber,
    previous_close: nullableNumber,
    open_price: nullableNumber,
    day_low: nullableNumber,
    day_high: nullableNumber,
    fifty_two_week_low: nullableNumber,
    fifty_two_week_high: nullableNumber,
    volume: nullableNumber,
    average_volume: nullableNumber,
    market_cap: nullableNumber,
    trailing_pe: nullableNumber,
    forward_pe: nullableNumber,
    dividend_yield: nullableNumber,
    beta: nullableNumber,
    shares_outstanding: nullableNumber,
    analyst_target_mean: nullableNumber,
    earnings_date: nullableString,
    is_etf: z.boolean(),
  }),
  dataLimitations: z.array(z.string()).default([]),
});

export const historyResponseSchema = z.object({
  symbol: z.string(),
  period: z.string(),
  interval: z.string(),
  bars: z.array(
    z.object({
      timestamp: z.string(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      adj_close: z.number(),
      volume: z.number(),
    }),
  ),
});

export const newsResponseSchema = z.object({
  symbol: z.string(),
  news: z.array(
    z.object({
      title: z.string(),
      publisher: nullableString,
      link: nullableString,
      published_at: nullableString,
      summary: nullableString,
      source_type: nullableString,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const financialSummaryResponseSchema = z.object({
  symbol: z.string(),
  financialSummary: z.object({
    revenue_ttm: nullableNumber,
    net_income_ttm: nullableNumber,
    ebitda: nullableNumber,
    gross_margins: nullableNumber,
    operating_margins: nullableNumber,
    profit_margins: nullableNumber,
    free_cash_flow: nullableNumber,
    total_cash: nullableNumber,
    total_debt: nullableNumber,
    debt_to_equity: nullableNumber,
    return_on_equity: nullableNumber,
    return_on_assets: nullableNumber,
  }),
  dataLimitations: z.array(z.string()).default([]),
});

const financialTrendPointSchema = z.object({
  periodEnd: z.string(),
  revenue: nullableNumber,
  netIncome: nullableNumber,
  operatingCashFlow: nullableNumber,
  capitalExpenditure: nullableNumber,
  freeCashFlow: nullableNumber,
});

export const financialTrendsResponseSchema = z.object({
  symbol: z.string(),
  annual: z.array(financialTrendPointSchema),
  quarterly: z.array(financialTrendPointSchema),
  dataLimitations: z.array(z.string()).default([]),
});

export const earningsHistoryResponseSchema = z.object({
  symbol: z.string(),
  events: z.array(
    z.object({
      reportDate: z.string(),
      quarter: z.string(),
      epsEstimate: nullableNumber,
      epsActual: nullableNumber,
      surprisePercent: nullableNumber,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const earningsEstimatesResponseSchema = z.object({
  symbol: z.string(),
  epsEstimates: z.array(
    z.object({
      period: z.string(),
      avg: nullableNumber,
      low: nullableNumber,
      high: nullableNumber,
      yearAgoEps: nullableNumber,
      numberOfAnalysts: nullableNumber,
      growth: nullableNumber,
    }),
  ),
  revenueEstimates: z.array(
    z.object({
      period: z.string(),
      avg: nullableNumber,
      low: nullableNumber,
      high: nullableNumber,
      numberOfAnalysts: nullableNumber,
      yearAgoRevenue: nullableNumber,
      growth: nullableNumber,
    }),
  ),
  growthEstimates: z.array(
    z.object({
      period: z.string(),
      stockTrend: nullableNumber,
      indexTrend: nullableNumber,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const analystSummaryResponseSchema = z.object({
  symbol: z.string(),
  analystSummary: z.object({
    currentPriceTarget: nullableNumber,
    targetLow: nullableNumber,
    targetHigh: nullableNumber,
    targetMean: nullableNumber,
    targetMedian: nullableNumber,
    recommendationSummary: z.object({
      period: nullableString,
      strongBuy: nullableNumber,
      buy: nullableNumber,
      hold: nullableNumber,
      sell: nullableNumber,
      strongSell: nullableNumber,
    }),
    recentActionCount: nullableNumber,
    recentActionWindowDays: nullableNumber,
  }),
  dataLimitations: z.array(z.string()).default([]),
});

export const analystHistoryResponseSchema = z.object({
  symbol: z.string(),
  recommendationHistory: z.array(
    z.object({
      period: z.string(),
      strongBuy: nullableNumber,
      buy: nullableNumber,
      hold: nullableNumber,
      sell: nullableNumber,
      strongSell: nullableNumber,
    }),
  ),
  actions: z.array(
    z.object({
      gradedAt: z.string(),
      firm: nullableString,
      toGrade: nullableString,
      fromGrade: nullableString,
      action: nullableString,
      priceTargetAction: nullableString,
      currentPriceTarget: nullableNumber,
      priorPriceTarget: nullableNumber,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const ownershipResponseSchema = z.object({
  symbol: z.string(),
  requestedSection: z.string(),
  limit: z.number(),
  offset: z.number(),
  majorHolders: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      value: nullableNumber,
    }),
  ),
  institutionalHolders: z.array(
    z.object({
      dateReported: z.string(),
      holder: z.string(),
      pctHeld: nullableNumber,
      shares: nullableNumber,
      value: nullableNumber,
      pctChange: nullableNumber,
    }),
  ),
  mutualFundHolders: z.array(
    z.object({
      dateReported: z.string(),
      holder: z.string(),
      pctHeld: nullableNumber,
      shares: nullableNumber,
      value: nullableNumber,
      pctChange: nullableNumber,
    }),
  ),
  insiderRoster: z.array(
    z.object({
      name: z.string().optional().default("Unknown insider"),
      relation: nullableString,
      latestTransDate: nullableString,
      positionDirectDate: nullableString,
      sharesOwnedDirectly: nullableNumber,
      positionIndirectDate: nullableString,
      sharesOwnedIndirectly: nullableNumber,
    }),
  ),
  institutionalPagination: paginationSchema.nullable().optional().transform((value) => value ?? null),
  mutualFundPagination: paginationSchema.nullable().optional().transform((value) => value ?? null),
  insiderRosterPagination: paginationSchema.nullable().optional().transform((value) => value ?? null),
  dataLimitations: z.array(z.string()).default([]),
});

export const optionsExpirationsResponseSchema = z.object({
  symbol: z.string(),
  expirations: z.array(z.string()),
});

const optionRowSchema = z.object({
  contractSymbol: z.string(),
  lastTradeDate: nullableString,
  strike: nullableNumber,
  lastPrice: nullableNumber,
  bid: nullableNumber,
  ask: nullableNumber,
  change: nullableNumber,
  percentChange: nullableNumber,
  volume: nullableNumber,
  openInterest: nullableNumber,
  impliedVolatility: nullableNumber,
  inTheMoney: nullableBoolean,
  contractSize: nullableString,
  currency: nullableString,
});

export const optionsChainResponseSchema = z.object({
  symbol: z.string(),
  expiration: z.string(),
  underlyingPrice: nullableNumber,
  calls: z.array(optionRowSchema),
  puts: z.array(optionRowSchema),
  dataLimitations: z.array(z.string()).default([]),
});

export const compareResponseSchema = z.object({
  symbols: z.array(z.string()),
  period: z.string(),
  interval: z.string(),
  series: z.array(
    z.object({
      symbol: z.string(),
      displayName: z.string(),
      currentPrice: nullableNumber,
      changePercent: nullableNumber,
      bars: z.array(
        z.object({
          timestamp: z.string(),
          open: z.number(),
          high: z.number(),
          low: z.number(),
          close: z.number(),
          adj_close: z.number(),
          volume: z.number(),
        }),
      ),
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const moversResponseSchema = z.object({
  screen: z.string(),
  marketScope: z.string(),
  asOf: z.string(),
  results: z.array(
    z.object({
      symbol: z.string(),
      name: z.string(),
      exchange: nullableString,
      quoteType: z.string(),
      currentPrice: nullableNumber,
      change: nullableNumber,
      percentChange: nullableNumber,
      volume: nullableNumber,
      marketCap: nullableNumber,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const benchmarksResponseSchema = z.object({
  asOf: z.string(),
  funds: z.array(
    z.object({
      symbol: z.string(),
      benchmarkKey: z.string(),
      benchmarkName: z.string(),
      category: z.string(),
      displayName: z.string(),
      currentPrice: nullableNumber,
      previousClose: nullableNumber,
      dayChange: nullableNumber,
      dayChangePercent: nullableNumber,
      currency: nullableString,
      expenseRatio: nullableNumber,
      netAssets: nullableNumber,
      yield: nullableNumber,
      fundFamily: nullableString,
      topHoldings: z.array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          holdingPercent: nullableNumber,
        }),
      ),
      sectorWeights: z.array(
        z.object({
          sector: z.string(),
          weight: nullableNumber,
        }),
      ),
      dataLimitations: z.array(z.string()).default([]),
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const earningsCalendarResponseSchema = z.object({
  start: z.string(),
  end: z.string(),
  limit: z.number(),
  offset: z.number(),
  activeOnly: z.boolean(),
  returnedCount: z.number(),
  hasMore: z.boolean(),
  nextOffset: z.number().nullable().optional().transform((value) => value ?? null),
  events: z.array(
    z.object({
      symbol: z.string(),
      companyName: z.string(),
      earningsDate: z.string(),
      reportTime: nullableString,
      epsEstimate: nullableNumber,
      reportedEps: nullableNumber,
      surprisePercent: nullableNumber,
      marketCap: nullableNumber,
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const sectorPulseResponseSchema = z.object({
  asOf: z.string(),
  sectors: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      symbol: nullableString,
      overview: z.object({
        companiesCount: nullableNumber,
        marketCap: nullableNumber,
        messageBoardId: nullableString,
        description: nullableString,
        industriesCount: nullableNumber,
        marketWeight: nullableNumber,
        employeeCount: nullableNumber,
      }),
      topEtfs: z.array(
        z.object({
          symbol: z.string(),
          name: z.string(),
        }),
      ),
      topMutualFunds: z.array(
        z.object({
          symbol: z.string(),
          name: z.string(),
        }),
      ),
      topCompanies: z.array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          rating: nullableString,
          marketWeight: nullableNumber,
        }),
      ),
      dataLimitations: z.array(z.string()).default([]),
    }),
  ),
  dataLimitations: z.array(z.string()).default([]),
});

export const chatResponseSchema = z.object({
  symbol: z.string(),
  sessionId: z.string(),
  answer: z.string(),
  highlights: z.array(z.string()).default([]),
  usedTools: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type TickerOverviewResponse = z.infer<typeof tickerOverviewSchema>;
export type HistoryResponse = z.infer<typeof historyResponseSchema>;
export type NewsResponse = z.infer<typeof newsResponseSchema>;
export type FinancialSummaryResponse = z.infer<typeof financialSummaryResponseSchema>;
export type FinancialTrendsResponse = z.infer<typeof financialTrendsResponseSchema>;
export type EarningsHistoryResponse = z.infer<typeof earningsHistoryResponseSchema>;
export type EarningsEstimatesResponse = z.infer<typeof earningsEstimatesResponseSchema>;
export type AnalystSummaryResponse = z.infer<typeof analystSummaryResponseSchema>;
export type AnalystHistoryResponse = z.infer<typeof analystHistoryResponseSchema>;
export type OwnershipResponse = z.infer<typeof ownershipResponseSchema>;
export type OptionsExpirationsResponse = z.infer<typeof optionsExpirationsResponseSchema>;
export type OptionsChainResponse = z.infer<typeof optionsChainResponseSchema>;
export type CompareResponse = z.infer<typeof compareResponseSchema>;
export type MoversResponse = z.infer<typeof moversResponseSchema>;
export type BenchmarksResponse = z.infer<typeof benchmarksResponseSchema>;
export type EarningsCalendarResponse = z.infer<typeof earningsCalendarResponseSchema>;
export type SectorPulseResponse = z.infer<typeof sectorPulseResponseSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
