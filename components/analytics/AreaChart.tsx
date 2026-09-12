"use client";

import { useState } from "react";
import { formatDate, formatNumber } from "@/lib/utils";

export interface Series {
  key: string;
  label: string;
  color: string;
  values: number[];
}

/**
 * Single-axis area/line chart for a time series. One series needs no legend
 * (the title names it); two or more get a legend plus a shared crosshair
 * tooltip. Area fill is the series hue at ~10% opacity; line is 2px with a
 * ring-bordered end marker.
 */
export function AreaChart({ dates, series, height = 200 }: { dates: string[]; series: Series[]; height?: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 640;
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1) * 1.1;
  const min = 0;

  const xFor = (i: number) => padding.left + (i / Math.max(dates.length - 1, 1)) * innerW;
  const yFor = (v: number) => padding.top + innerH - ((v - min) / (max - min)) * innerH;

  const linePath = (values: number[]) => values.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`).join(" ");
  const areaPath = (values: number[]) =>
    `${linePath(values)} L ${xFor(values.length - 1)} ${padding.top + innerH} L ${xFor(0)} ${padding.top + innerH} Z`;

  const tickIdxs = dates.length <= 6 ? dates.map((_, i) => i) : [0, Math.floor(dates.length / 2), dates.length - 1];

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`Line chart of ${series.map((s) => s.label).join(", ")} over time`}
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const idx = Math.round(((relX - padding.left) / innerW) * (dates.length - 1));
            setHoverIdx(Math.min(Math.max(idx, 0), dates.length - 1));
          }}
        >
          {/* gridlines */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + innerH * f}
              y2={padding.top + innerH * f}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
          ))}

          {series.map((s) => (
            <path key={s.key} d={areaPath(s.values)} fill={s.color} fillOpacity={0.1} stroke="none" />
          ))}
          {series.map((s) => (
            <path key={s.key} d={linePath(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {hoverIdx !== null && (
            <line
              x1={xFor(hoverIdx)}
              x2={xFor(hoverIdx)}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="var(--chart-axis)"
              strokeWidth={1}
            />
          )}
          {hoverIdx !== null &&
            series.map((s) => (
              <circle
                key={s.key}
                cx={xFor(hoverIdx)}
                cy={yFor(s.values[hoverIdx])}
                r={4}
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ))}

          {tickIdxs.map((i) => (
            <text key={i} x={xFor(i)} y={height - 4} textAnchor="middle" className="fill-muted" style={{ fontSize: 10 }}>
              {formatDate(dates[i], { year: undefined })}
            </text>
          ))}
        </svg>

        {hoverIdx !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${(xFor(hoverIdx) / width) * 100}%` }}
          >
            <p className="font-medium text-foreground">{formatDate(dates[hoverIdx])}</p>
            {series.map((s) => (
              <p key={s.key} className="text-muted">
                <span className="font-medium text-foreground">{formatNumber(s.values[hoverIdx])}</span> {s.label}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
