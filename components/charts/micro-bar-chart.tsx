type BarDatum = {
  id: string;
  label: string;
  value: number | null;
};

type MicroBarChartProps = {
  items: BarDatum[];
  height?: number;
};

export function MicroBarChart({ items, height = 180 }: MicroBarChartProps) {
  const values = items.map((item) => item.value ?? 0);
  const maxValue = Math.max(...values, 1);
  const width = 360;
  const barWidth = width / Math.max(items.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full overflow-visible">
      {items.map((item, index) => {
        const barHeight = ((item.value ?? 0) / maxValue) * (height - 30);
        const x = index * barWidth + 8;
        const y = height - barHeight - 24;
        const color = index % 3 === 0 ? "var(--chart-1)" : index % 3 === 1 ? "var(--chart-2)" : "var(--chart-3)";

        return (
          <g key={item.id}>
            <rect
              x={x}
              y={y}
              width={barWidth - 16}
              height={Math.max(barHeight, 4)}
              rx={4}
              fill={color}
              opacity={0.9}
            />
            <text
              x={x + (barWidth - 16) / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(232, 234, 237, 0.5)"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
