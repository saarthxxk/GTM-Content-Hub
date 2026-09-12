export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 72;
  const h = 24;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  const last = data[data.length - 1];
  const lastY = h - ((last - min) / range) * h;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        style={{ stroke: "var(--chart-1)" }}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={lastY} r={2.5} style={{ fill: "var(--chart-1)", stroke: "var(--surface)" }} strokeWidth={1.5} />
    </svg>
  );
}
