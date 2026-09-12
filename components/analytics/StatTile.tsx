import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

export interface StatTileProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean; goodWhenUp?: boolean };
  trend?: number[];
  icon?: React.ElementType;
}

/** Stat tile contract: label (sentence case) · value (semibold, compact) ·
 * optional signed delta colored by direction × whether up is good · optional
 * sparkline. See dataviz marks-and-anatomy § Figures. */
export function StatTile({ label, value, delta, trend, icon: Icon }: StatTileProps) {
  const goodWhenUp = delta?.goodWhenUp ?? true;
  const isGood = delta ? (goodWhenUp ? delta.positive : !delta.positive) : true;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-[26px] font-semibold leading-none text-foreground [font-variant-numeric:proportional-nums]">
          {value}
        </p>
        {trend && trend.length > 1 && <Sparkline data={trend} className="mb-0.5" />}
      </div>
      {delta && (
        <p className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", isGood ? "text-success" : "text-danger")}>
          {delta.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {delta.value}
        </p>
      )}
    </div>
  );
}
