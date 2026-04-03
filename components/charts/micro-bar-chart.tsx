"use client";

import { useState } from "react";

import { formatPercent } from "@/lib/stock-yard/format";
import { cn } from "@/lib/utils";

export type BarDatum = {
  id: string;
  label: string;
  value: number | null;
  meta?: string;
  a11yLabel?: string;
};

export type BarValueFormat = {
  style: "number" | "currency" | "percent";
  digits?: number;
  currency?: string;
};

type MicroBarChartProps = {
  items: BarDatum[];
  height?: number;
  className?: string;
  variant?: "temporal" | "ranked";
  valueFormat?: BarValueFormat;
  tickFormat?: BarValueFormat;
  emphasizeLatest?: boolean;
};

type BarChartScale = {
  min: number;
  max: number;
  ticks: number[];
  zeroRatio: number;
};

const SVG_WIDTH = 420;

export function buildBarChartScale(values: number[], targetTickCount = 4): BarChartScale {
  const numericValues = values.filter((value) => Number.isFinite(value));

  if (!numericValues.length) {
    return {
      min: 0,
      max: 1,
      ticks: [0, 0.5, 1],
      zeroRatio: 1,
    };
  }

  const rawMin = Math.min(...numericValues, 0);
  const rawMax = Math.max(...numericValues, 0);
  const roughRange = rawMax - rawMin || Math.max(Math.abs(rawMax), Math.abs(rawMin), 1);
  const step = getNiceStep(roughRange, targetTickCount);

  const min = Math.floor(rawMin / step) * step;
  let max = Math.ceil(rawMax / step) * step;

  if (min === max) {
    max = min + step;
  }

  const ticks: number[] = [];

  for (let value = min; value <= max + step / 2; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }

  const zeroRatio = clamp((max) / (max - min), 0, 1);

  return {
    min,
    max,
    ticks,
    zeroRatio,
  };
}

export function MicroBarChart({
  items,
  height = 180,
  className,
  variant = "temporal",
  valueFormat,
  tickFormat,
  emphasizeLatest = true,
}: MicroBarChartProps) {
  if (!items.length) {
    return null;
  }

  const valueFormatter = createVisibleValueFormatter(valueFormat);
  const detailFormatter = createDetailValueFormatter(valueFormat);
  const tickFormatter = createTickFormatter(tickFormat);

  if (variant === "ranked") {
    return <RankedBarChart className={className} items={items} valueFormatter={valueFormatter} />;
  }

  return (
    <TemporalBarChart
      className={className}
      detailFormatter={detailFormatter}
      emphasizeLatest={emphasizeLatest}
      height={height}
      items={items}
      tickFormatter={tickFormatter}
      valueFormatter={valueFormatter}
    />
  );
}

function TemporalBarChart({
  items,
  height,
  className,
  detailFormatter,
  valueFormatter,
  tickFormatter,
  emphasizeLatest,
}: {
  items: BarDatum[];
  height: number;
  className?: string;
  detailFormatter: (value: number | null, item: BarDatum) => string;
  valueFormatter: (value: number | null, item: BarDatum) => string;
  tickFormatter: (value: number) => string;
  emphasizeLatest: boolean;
}) {
  const defaultActiveId = getDefaultActiveId(items);
  const [activeId, setActiveId] = useState(defaultActiveId);
  const [showExactDetail, setShowExactDetail] = useState(false);
  const resolvedActiveId = items.some((item) => item.id === activeId) ? activeId : defaultActiveId;
  const activeItem = items.find((item) => item.id === resolvedActiveId) ?? items[items.length - 1];
  const scale = buildBarChartScale(
    items
      .map((item) => sanitizeValue(item.value))
      .filter((value): value is number => value !== null),
    3,
  );

  const plotTop = 8;
  const plotBottom = height - 34;
  const plotLeft = 2;
  const axisLabelWidth = 78;
  const plotRight = SVG_WIDTH - axisLabelWidth;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const zeroY = scaleToY(0, scale.min, scale.max, plotTop, plotHeight);
  const slotWidth = plotWidth / Math.max(items.length, 1);
  const barWidth = clamp(slotWidth * 0.56, 24, 44);
  const detailValue = showExactDetail ? detailFormatter(activeItem.value, activeItem) : valueFormatter(activeItem.value, activeItem);

  return (
    <div className={cn("space-y-3", className)} data-bar-chart-variant="temporal">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Bar chart"
        onMouseLeave={() => {
          setActiveId(defaultActiveId);
          setShowExactDetail(false);
        }}
      >
        {scale.ticks.map((tick) => {
          const y = scaleToY(tick, scale.min, scale.max, plotTop, plotHeight);
          const isBaseline = Math.abs(tick) < Number.EPSILON;

          return (
            <g key={tick}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke={isBaseline ? "var(--line-heavy)" : "var(--chart-grid)"}
                strokeDasharray={isBaseline ? undefined : "2 6"}
                strokeWidth={isBaseline ? 1.2 : 1}
              />
              <text
                x={SVG_WIDTH - 4}
                y={y + 4.5}
                textAnchor="end"
                fontSize="16"
                fontWeight={isBaseline ? 600 : 500}
                fill="var(--chart-label)"
              >
                {tickFormatter(tick)}
              </text>
            </g>
          );
        })}
        {items.map((item, index) => {
          const value = sanitizeValue(item.value);
          const slotX = plotLeft + index * slotWidth;
          const x = slotX + (slotWidth - barWidth) / 2;
          const targetY = scaleToY(value ?? 0, scale.min, scale.max, plotTop, plotHeight);
          const isActive = item.id === resolvedActiveId;
          const isLatest = emphasizeLatest && index === items.length - 1;
          const fill = value !== null && value < 0
            ? "var(--negative)"
            : isActive || isLatest
              ? "var(--chart-bar-emphasis)"
              : "var(--chart-bar-fill)";

          return (
            <g
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={item.a11yLabel ?? `${item.meta ?? item.label}: ${detailFormatter(item.value, item)}`}
              className="chart-bar-rise outline-none"
              style={{
                animationDelay: `${index * 45}ms`,
                transformOrigin: `${x + barWidth / 2}px ${zeroY}px`,
              }}
              onFocus={() => {
                setActiveId(item.id);
                setShowExactDetail(true);
              }}
              onMouseEnter={() => {
                setActiveId(item.id);
                setShowExactDetail(true);
              }}
            >
              <rect
                x={x}
                y={plotTop + 8}
                width={barWidth}
                height={plotHeight - 8}
                rx={barWidth / 2}
                fill="var(--chart-bar-track)"
              />
              <rect
                x={x}
                y={value === null ? zeroY - 2 : Math.min(targetY, zeroY)}
                width={barWidth}
                height={Math.max(value === null ? 4 : Math.abs(zeroY - targetY), value === null ? 4 : 8)}
                rx={barWidth / 2}
                fill={fill}
                opacity={isActive || isLatest ? 1 : 0.84}
                stroke={isActive ? "var(--line-heavy)" : "transparent"}
                strokeWidth={isActive ? 1.2 : 0}
              />
              <text
                x={slotX + slotWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="14"
                fontWeight={isActive ? 700 : 500}
                fill={isActive ? "var(--ink-strong)" : "var(--chart-label)"}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-col items-start gap-1.5 rounded-xl border border-(--chart-detail-border) bg-(--chart-detail-surface) px-3 py-2.5 shadow-[var(--shadow-muted)] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-(--ink-strong)">{activeItem.meta ?? activeItem.label}</p>
        </div>
        <p className="text-[18px] font-semibold text-(--ink-strong) sm:shrink-0">{detailValue}</p>
      </div>
    </div>
  );
}

function RankedBarChart({
  items,
  className,
  valueFormatter,
}: {
  items: BarDatum[];
  className?: string;
  valueFormatter: (value: number | null, item: BarDatum) => string;
}) {
  const numericValues = items
    .map((item) => sanitizeValue(item.value))
    .filter((value): value is number => value !== null)
    .map((value) => Math.abs(value));
  const maxValue = Math.max(...numericValues, 1);

  return (
    <div className={cn("space-y-2.5", className)} data-bar-chart-variant="ranked">
      {items.map((item, index) => {
        const value = sanitizeValue(item.value);
        const width = value === null ? 6 : clamp((Math.abs(value) / maxValue) * 100, 6, 100);
        const opacity = clamp(0.98 - index * 0.08, 0.46, 0.98);

        return (
          <div
            key={item.id}
            className="rounded-xl border border-(--line) bg-(--surface) px-3 py-3 shadow-[var(--shadow-muted)] transition-[border-color,transform] duration-150 hover:border-(--line-strong) hover:-translate-y-0.5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex min-w-7 text-[10px] font-medium uppercase tracking-[0.18em] text-(--ink-soft)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="truncate text-sm font-semibold text-(--ink-strong)">{item.label}</h4>
                </div>
                {item.meta ? (
                  <p className="mt-1 truncate pl-10 text-xs text-(--ink-muted)">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-(--ink-strong) sm:shrink-0 sm:text-right">{valueFormatter(item.value, item)}</p>
            </div>
            <div className="mt-3 rounded-full bg-(--chart-bar-track)">
              <div
                className="chart-bar-fill h-2.5 rounded-full bg-(--chart-bar-emphasis)"
                style={{
                  width: `${width}%`,
                  opacity,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sanitizeValue(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return value;
}

function getDefaultActiveId(items: BarDatum[]) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (sanitizeValue(items[index].value) !== null) {
      return items[index].id;
    }
  }

  return items[items.length - 1]?.id ?? "";
}

function scaleToY(value: number, min: number, max: number, plotTop: number, plotHeight: number) {
  const range = max - min || 1;

  return plotTop + ((max - value) / range) * plotHeight;
}

function getNiceStep(range: number, tickCount: number) {
  const roughStep = Math.max(range / Math.max(tickCount, 1), 1e-6);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function defaultValueFormatter(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: Math.abs(value) >= 1_000 ? "compact" : "standard",
  }).format(value);
}

function defaultTickFormatter(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: Math.abs(value) >= 1_000 ? "compact" : "standard",
  }).format(value);
}

function createVisibleValueFormatter(format?: BarValueFormat) {
  if (!format) {
    return defaultValueFormatter;
  }

  return (value: number | null) => formatBarValue(value, format, "visible");
}

function createDetailValueFormatter(format?: BarValueFormat) {
  if (!format) {
    return defaultValueFormatter;
  }

  return (value: number | null) => formatBarValue(value, format, "detail");
}

function createTickFormatter(format?: BarValueFormat) {
  if (!format) {
    return defaultTickFormatter;
  }

  return (value: number) => formatBarValue(value, format, "visible");
}

function formatBarValue(value: number | null, format: BarValueFormat, mode: "visible" | "detail") {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  switch (format.style) {
    case "currency":
      return formatChartCurrency(value, format.currency ?? "USD", mode === "detail" ? 0 : (format.digits ?? 1), mode);
    case "percent":
      return formatPercent(value, format.digits ?? 1);
    case "number":
    default:
      return formatChartNumber(value, format.digits ?? 0, mode);
  }
}

function formatChartCurrency(value: number, currency: string, digits: number, mode: "visible" | "detail") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: mode === "detail" ? digits : 0,
    maximumFractionDigits: digits,
    notation: mode === "detail" ? "standard" : "compact",
  }).format(value);
}

function formatChartNumber(value: number, digits: number, mode: "visible" | "detail") {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: mode === "detail" ? digits : 0,
    maximumFractionDigits: digits,
    notation: mode === "detail" ? "standard" : Math.abs(value) >= 1_000 ? "compact" : "standard",
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
