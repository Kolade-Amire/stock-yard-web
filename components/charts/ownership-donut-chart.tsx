"use client";

import { useMemo, useState } from "react";

import { formatPercent } from "@/lib/stock-yard/format";
import { cn } from "@/lib/utils";

import type { OwnershipDonutChartItem } from "@/components/charts/ownership-donut-chart-data";

type OwnershipDonutChartProps = {
  items: OwnershipDonutChartItem[];
  title?: string;
  subtitle?: string;
  valueLabel?: string;
  valueMode?: "raw_percent" | "normalized_percent";
  className?: string;
};

const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 108;
const INNER_RADIUS = 54;
const ACTIVE_SHIFT = 8;
const GAP_DEGREES = 3.2;

type OwnershipDonutSegment = {
  item: OwnershipDonutChartItem;
  path: string;
  translateX: number;
  translateY: number;
  color: string;
};

export function OwnershipDonutChart({
  items,
  title = "Holder mix",
  subtitle = "Breakdown of displayed holders",
  valueLabel,
  valueMode = "raw_percent",
  className,
}: OwnershipDonutChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const segments = useMemo(() => buildOwnershipDonutSegments(items), [items]);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const activeValue = valueMode === "normalized_percent" ? activeItem?.normalizedValue ?? null : activeItem?.rawValue ?? null;
  const resolvedValueLabel = valueLabel ?? (valueMode === "normalized_percent" ? "Share of displayed total" : "Reported held");

  if (!items.length || activeItem === null) {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-4 md:px-5", className)}>
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h4 className="text-base font-semibold text-(--ink-strong)">{title}</h4>
          <p className="mt-1 text-sm text-(--ink-muted)">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-center xl:justify-start">
        <div
          className="relative aspect-square w-full max-w-[320px] sm:max-w-[360px]"
          onMouseLeave={() => setActiveId(items[0]?.id ?? null)}
        >
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="size-full overflow-visible"
            role="img"
            aria-label="Ownership breakdown of displayed holders"
          >
            <path d={describeDonutArc(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, 360)} style={{ fill: "var(--ownership-track)" }} />
            {segments.map((segment) => {
              const isActive = segment.item.id === activeItem.id;

              return (
                <g
                  key={segment.item.id}
                  transform={isActive ? `translate(${segment.translateX} ${segment.translateY})` : undefined}
                  className="transition-transform duration-200 ease-out"
                >
                  <path
                    d={segment.path}
                    style={{ fill: segment.color }}
                    opacity={isActive ? 1 : 0.94}
                    tabIndex={0}
                    role="button"
                    aria-label={
                      valueMode === "normalized_percent"
                        ? `${segment.item.label}: ${formatPercent(segment.item.normalizedValue, 2)} of displayed insider total`
                        : `${segment.item.label}: ${formatPercent(segment.item.rawValue, 2)} reported held`
                    }
                    onMouseEnter={() => setActiveId(segment.item.id)}
                    onFocus={() => setActiveId(segment.item.id)}
                    className="cursor-pointer outline-none transition-opacity duration-200"
                  />
                </g>
              );
            })}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={INNER_RADIUS - 8}
              style={{ fill: "var(--ownership-core)", stroke: "var(--ownership-core-ring)" }}
              strokeWidth="10"
            />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
            <div className="max-w-[10rem] text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-(--ink-soft)">{resolvedValueLabel}</p>
              <p className="mt-1 text-[24px] font-semibold tracking-tight text-(--ink-strong) sm:text-[28px]">
                {activeValue !== null ? formatPercent(activeValue, 2) : "Unavailable"}
              </p>
              <p
                className="mt-1 text-sm font-medium leading-snug text-(--ink-muted)"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {activeItem.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildOwnershipDonutSegments(items: OwnershipDonutChartItem[]): OwnershipDonutSegment[] {
  let startAngle = 0;

  return items.map((item) => {
    const segmentAngle = Math.max(item.normalizedValue * 360 - GAP_DEGREES, 0.5);
    const endAngle = startAngle + segmentAngle;
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const path = describeDonutArc(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, startAngle, endAngle);

    startAngle = endAngle + GAP_DEGREES;

    return {
      item,
      path,
      translateX: Math.cos(midAngle) * ACTIVE_SHIFT,
      translateY: Math.sin(midAngle) * ACTIVE_SHIFT,
      color: item.color,
    };
  });
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeDonutArc(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const normalizedEndAngle = endAngle >= 360 ? 359.999 : endAngle;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, normalizedEndAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, normalizedEndAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = normalizedEndAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}
