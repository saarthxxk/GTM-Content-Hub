/** Fixed-order categorical series palette (CVD-validated adjacent contrast).
 * Always index into this in a stable order — never reassign a color by rank
 * when a filter changes which categories are visible. */
export const CHART_SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function seriesColor(index: number): string {
  return CHART_SERIES[index % CHART_SERIES.length];
}
