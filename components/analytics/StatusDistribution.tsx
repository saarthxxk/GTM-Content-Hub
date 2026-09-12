import { STATUS_LABEL } from "@/lib/workflow";
import type { ContentStatus } from "@/types";
import { seriesColor } from "./palette";

const ORDER: ContentStatus[] = ["published", "in_review", "approved", "changes_requested", "draft", "archived"];

/** A 100%-stacked proportion bar reads distribution-of-a-whole more
 * precisely than a donut (angle comparison is harder than length), while
 * still pairing every segment with a legend swatch + label per segment. */
export function StatusDistribution({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  const ordered = ORDER.filter((s) => counts[s]);

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-neutral-soft">
        {ordered.map((status, i) => (
          <div
            key={status}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(counts[status] / total) * 100}%`,
              backgroundColor: seriesColor(i),
              marginRight: i < ordered.length - 1 ? 2 : 0,
            }}
            title={`${STATUS_LABEL[status]}: ${counts[status]}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ordered.map((status, i) => (
          <li key={status} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seriesColor(i) }} aria-hidden="true" />
            <span className="text-muted">{STATUS_LABEL[status]}</span>
            <span className="ml-auto font-medium text-foreground [font-variant-numeric:tabular-nums]">{counts[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
