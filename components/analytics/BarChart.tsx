import { seriesColor } from "./palette";
import { formatNumber } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
}

/**
 * Horizontal bar chart — one categorical hue per row (fixed order), 4px
 * rounded data-end, value labeled at the tip. Chosen over a donut for
 * category comparison: bar length supports precise magnitude comparison,
 * which proportion-of-a-whole reading (a donut) does not.
 */
export function BarChart({ data, maxBars = 6 }: { data: BarDatum[]; maxBars?: number }) {
  const rows = data.slice(0, maxBars);
  const max = Math.max(...rows.map((d) => d.value), 1);

  if (rows.length === 0) {
    return <p className="text-[13px] text-muted py-6 text-center">No data yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-[13px] text-foreground" title={d.label}>
            {d.label}
          </span>
          <div className="relative h-4 grow rounded-full bg-neutral-soft overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 3)}%`, backgroundColor: seriesColor(i) }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-[13px] font-medium text-foreground [font-variant-numeric:tabular-nums]">
            {formatNumber(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
