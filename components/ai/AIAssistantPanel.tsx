"use client";

import { useState } from "react";
import {
  Sparkles,
  FileSearch,
  Tags as TagsIcon,
  ShieldCheck,
  Gauge,
  MousePointerClick,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, stripHtml } from "@/lib/utils";
import type {
  AIBrandResult,
  AICtaResult,
  AISeoResult,
  AISummaryResult,
  AITagsResult,
  ContentType,
  QualityReport,
} from "@/types";

type ActionKey = "summary" | "seo" | "tags" | "brand" | "cta";

interface ActionState {
  loading: boolean;
  source?: "ai" | "mock";
  error?: string;
}

export function AIAssistantPanel({
  title,
  body,
  type,
  onApplySummary,
  onApplySeo,
  onApplyTags,
  onApplyCta,
  onAnalyzeQuality,
  quality,
}: {
  title: string;
  body: string;
  type: ContentType;
  onApplySummary: (summary: string) => void;
  onApplySeo: (seo: AISeoResult) => void;
  onApplyTags: (tagNames: string[]) => void;
  onApplyCta: (cta: string) => void;
  onAnalyzeQuality: () => Promise<void>;
  quality?: QualityReport;
}) {
  const [open, setOpen] = useState<ActionKey | null>(null);
  const [states, setStates] = useState<Record<ActionKey, ActionState>>({
    summary: { loading: false },
    seo: { loading: false },
    tags: { loading: false },
    brand: { loading: false },
    cta: { loading: false },
  });
  const [summaryResult, setSummaryResult] = useState<AISummaryResult>();
  const [seoResult, setSeoResult] = useState<AISeoResult>();
  const [tagsResult, setTagsResult] = useState<AITagsResult>();
  const [brandResult, setBrandResult] = useState<AIBrandResult>();
  const [ctaResult, setCtaResult] = useState<AICtaResult>();
  const [analyzing, setAnalyzing] = useState(false);

  const plainBody = stripHtml(body);
  const ready = title.trim().length > 0 && plainBody.length > 10;

  const call = async <T,>(key: ActionKey, path: string, setResult: (r: T) => void) => {
    setOpen(key);
    setStates((s) => ({ ...s, [key]: { loading: true } }));
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: plainBody, type }),
      });
      if (!res.ok) throw new Error("Request failed");
      const { result, source } = await res.json();
      setResult(result);
      setStates((s) => ({ ...s, [key]: { loading: false, source } }));
    } catch {
      setStates((s) => ({ ...s, [key]: { loading: false, error: "Something went wrong. Try again." } }));
    }
  };

  const runAnalyze = async () => {
    setAnalyzing(true);
    try {
      await onAnalyzeQuality();
    } finally {
      setAnalyzing(false);
    }
  };

  const actions: { key: ActionKey; label: string; icon: React.ElementType; onClick: () => void }[] = [
    { key: "summary", label: "Generate Summary", icon: FileSearch, onClick: () => call("summary", "/api/ai/summary", setSummaryResult) },
    { key: "seo", label: "Generate SEO Metadata", icon: Sparkles, onClick: () => call("seo", "/api/ai/seo", setSeoResult) },
    { key: "tags", label: "Suggest Tags", icon: TagsIcon, onClick: () => call("tags", "/api/ai/tags", setTagsResult) },
    { key: "brand", label: "Check Brand Guidelines", icon: ShieldCheck, onClick: () => call("brand", "/api/ai/brand", setBrandResult) },
    { key: "cta", label: "Generate CTA", icon: MousePointerClick, onClick: () => call("cta", "/api/ai/cta", setCtaResult) },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-semibold text-foreground">AI Content Assistant</h3>
      </div>
      {!ready && (
        <p className="rounded-lg bg-neutral-soft px-3 py-2 text-xs text-muted">
          Add a title and at least a short paragraph of body content to enable AI suggestions.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {actions.map((a) => {
          const state = states[a.key];
          const isOpen = open === a.key;
          return (
            <div key={a.key} className="rounded-lg border border-border">
              <button
                type="button"
                disabled={!ready || state.loading}
                onClick={() => (isOpen ? setOpen(null) : a.onClick())}
                className="focus-ring flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium text-foreground disabled:opacity-50"
              >
                {state.loading ? <Loader2 className="h-4 w-4 animate-spin text-brand" /> : <a.icon className="h-4 w-4 text-muted" />}
                <span className="grow">{a.label}</span>
                {state.source && (
                  <Badge tone={state.source === "ai" ? "brand" : "neutral"} dot={false} className="text-[10px] py-0.5 px-1.5">
                    {state.source === "ai" ? "AI" : "Heuristic"}
                  </Badge>
                )}
                {!state.loading && (
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition-transform", isOpen && "rotate-180")} />
                )}
              </button>

              {isOpen && !state.loading && (
                <div className="border-t border-border px-3 py-3 text-[13px]">
                  {state.error && <p className="text-danger">{state.error}</p>}

                  {a.key === "summary" && summaryResult && (
                    <div className="flex flex-col gap-2">
                      <p className="text-muted">{summaryResult.summary}</p>
                      <Button size="sm" variant="outline" onClick={() => onApplySummary(summaryResult.summary)}>
                        <Check className="h-3.5 w-3.5" /> Use as excerpt
                      </Button>
                    </div>
                  )}

                  {a.key === "seo" && seoResult && (
                    <div className="flex flex-col gap-2">
                      <p><span className="font-medium text-foreground">Title:</span> <span className="text-muted">{seoResult.seoTitle}</span></p>
                      <p><span className="font-medium text-foreground">Description:</span> <span className="text-muted">{seoResult.metaDescription}</span></p>
                      <p><span className="font-medium text-foreground">Keywords:</span> <span className="text-muted">{seoResult.keywords.join(", ")}</span></p>
                      <Button size="sm" variant="outline" onClick={() => onApplySeo(seoResult)}>
                        <Check className="h-3.5 w-3.5" /> Apply to metadata
                      </Button>
                    </div>
                  )}

                  {a.key === "tags" && tagsResult && (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {tagsResult.tags.map((t) => (
                          <Badge key={t} tone="neutral" dot={false}>{t}</Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onApplyTags(tagsResult.tags)}>
                        <Check className="h-3.5 w-3.5" /> Add suggested tags
                      </Button>
                    </div>
                  )}

                  {a.key === "brand" && brandResult && (
                    <div className="flex flex-col gap-2">
                      <Badge tone={brandResult.passed ? "success" : "warning"}>
                        {brandResult.passed ? "Passed brand guidelines" : `${brandResult.violations.length} issue(s) found`}
                      </Badge>
                      {brandResult.violations.map((v, i) => (
                        <p key={i} className="text-muted">
                          <span className="font-medium text-foreground">{v.rule}:</span> {v.detail}
                        </p>
                      ))}
                    </div>
                  )}

                  {a.key === "cta" && ctaResult && (
                    <div className="flex flex-col gap-2">
                      <p><span className="font-medium text-foreground">Recommended:</span> <span className="text-muted">{ctaResult.cta}</span></p>
                      {ctaResult.alternatives.length > 0 && (
                        <p className="text-muted">Alternatives: {ctaResult.alternatives.join(" · ")}</p>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onApplyCta(ctaResult.cta)}>
                        <Check className="h-3.5 w-3.5" /> Use this CTA
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted" />
          <span className="text-[13px] font-medium text-foreground">Content Quality</span>
        </div>
        {quality ? (
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-foreground">{quality.score}</span>
              <span className="text-xs text-muted">/ 100</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {quality.checks.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-start gap-1.5 text-xs">
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", c.passed ? "bg-success" : c.severity === "error" ? "bg-danger" : "bg-warning")} />
                  <span className={c.passed ? "text-muted" : "text-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted">Run an analysis to combine rule-based checks with an AI readability review.</p>
        )}
        <Button size="sm" variant="secondary" className="mt-3 w-full justify-center" loading={analyzing} disabled={!ready} onClick={runAnalyze}>
          Analyze Content
        </Button>
      </div>
    </div>
  );
}
