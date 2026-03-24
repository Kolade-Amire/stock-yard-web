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

export function TimeSeriesChart({ series, height = 320, mode = "area" }: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || series.length === 0) {
      return;
    }

    const chart = createChart(container, {
      autoSize: true,
      height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: "rgba(232, 234, 237, 0.5)",
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          color: "rgba(255, 255, 255, 0.06)",
        },
        horzLines: {
          color: "rgba(255, 255, 255, 0.06)",
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
          color: "rgba(255, 255, 255, 0.15)",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.15)",
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
      if (mode === "area" && series.length === 1) {
        const areaSeries = chart.addSeries(AreaSeries, {
          lineColor: item.color,
          topColor: item.fill ?? `${item.color}33`,
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
        color: item.color,
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
  }, [height, mode, series]);

  return <div ref={containerRef} className="w-full" />;
}
