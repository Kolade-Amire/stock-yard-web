"use client";

import {
  AreaSeries,
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import { useTheme } from "@/components/theme/theme-provider";

type TimePoint = {
  timestamp: string;
  value: number;
};

export type TimeSeriesInput = {
  key: string;
  label: string;
  color: string;
  fill?: string;
  points: TimePoint[];
};

type TimeSeriesChartProps = {
  series: TimeSeriesInput[];
  height?: number;
  mode?: "area" | "line";
};

function toChartPoint(point: TimePoint) {
  return {
    time: Math.floor(new Date(point.timestamp).getTime() / 1000) as Time,
    value: point.value,
  };
}

function readChartToken(token: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value || fallback;
}

export function resolveChartColor(color: string) {
  const tokenMatch = color.trim().match(/^var\((--[^)]+)\)$/);

  if (!tokenMatch) {
    return color;
  }

  return readChartToken(tokenMatch[1], color);
}

export function withChartAlpha(color: string, alpha: number) {
  const resolved = resolveChartColor(color).trim();

  if (resolved.startsWith("rgba(")) {
    const parts = resolved.slice(5, -1).split(",").map((part) => part.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }

  if (resolved.startsWith("rgb(")) {
    const parts = resolved.slice(4, -1).split(",").map((part) => part.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }

  if (resolved.startsWith("#")) {
    const rawHex = resolved.slice(1);
    const normalizedHex =
      rawHex.length === 3
        ? rawHex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : rawHex.length === 6
          ? rawHex
          : null;

    if (normalizedHex !== null) {
      const alphaHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0");

      return `#${normalizedHex}${alphaHex}`;
    }
  }

  return resolved;
}

export function TimeSeriesChart({ series, height = 320, mode = "area" }: TimeSeriesChartProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || series.length === 0) {
      return;
    }

    const textColor = readChartToken("--chart-label", resolvedTheme === "dark" ? "rgba(232, 234, 237, 0.5)" : "rgba(50, 39, 25, 0.56)");
    const gridColor = readChartToken("--chart-grid", resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(92, 70, 37, 0.12)");
    const crosshairColor = readChartToken("--chart-crosshair", resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(92, 70, 37, 0.22)");

    const chart = createChart(container, {
      autoSize: true,
      height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          color: gridColor,
        },
        horzLines: {
          color: gridColor,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          color: crosshairColor,
        },
        horzLine: {
          color: crosshairColor,
        },
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    const createdSeries: Array<ISeriesApi<"Area" | "Line">> = [];

    for (const item of series) {
      const resolvedLineColor = resolveChartColor(item.color);

      if (mode === "area" && series.length === 1) {
        const resolvedFillColor = item.fill ? resolveChartColor(item.fill) : withChartAlpha(resolvedLineColor, 0.2);

        const areaSeries = chart.addSeries(AreaSeries, {
          lineColor: resolvedLineColor,
          topColor: resolvedFillColor,
          bottomColor: "rgba(0, 0, 0, 0)",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: true,
        });

        areaSeries.setData(item.points.map(toChartPoint));
        createdSeries.push(areaSeries);
        continue;
      }

      const lineSeries = chart.addSeries(LineSeries, {
        color: resolvedLineColor,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
      });

      lineSeries.setData(item.points.map(toChartPoint));
      createdSeries.push(lineSeries);
    }

    chart.timeScale().fitContent();

    resizeObserverRef.current = new ResizeObserver(() => {
      chart.timeScale().fitContent();
    });
    resizeObserverRef.current.observe(container);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      chart.remove();
      chartRef.current = null;
      createdSeries.length = 0;
    };
  }, [height, mode, resolvedTheme, series]);

  return <div ref={containerRef} className="w-full" />;
}
