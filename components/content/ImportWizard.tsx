"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileJson, FileSpreadsheet, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

type Step = "upload" | "preview" | "done";

const SAMPLE_CSV = `title,type,status,category,tags
AI Strategy for Regional Banks,article,draft,Artificial Intelligence,AI;Financial Services
Cloud Cost Optimization Checklist,article,draft,Cloud,Cloud Migration`;

export function ImportWizard() {
  const router = useRouter();
  const { push } = useToast();
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [raw, setRaw] = useState("");
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPreview = async () => {
    if (!raw.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, raw, commit: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not parse file");
      setPreview(data.preview);
      setTotalRows(data.totalRows);
      setStep("preview");
    } catch (err) {
      push({ tone: "error", title: "Preview failed", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const commitImport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, raw, commit: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult({ created: data.created.length, errors: data.errors });
      setStep("done");
      push({ tone: "success", title: `Imported ${data.created.length} content item(s)` });
    } catch (err) {
      push({ tone: "error", title: "Import failed", description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(file);
    setFormat(file.name.endsWith(".json") ? "json" : "csv");
  };

  if (step === "done" && result) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <div>
          <p className="text-base font-semibold text-foreground">{result.created} content item(s) imported</p>
          {result.errors.length > 0 && (
            <p className="mt-1 text-[13px] text-warning">{result.errors.length} row(s) had errors and were skipped.</p>
          )}
        </div>
        {result.errors.length > 0 && (
          <ul className="w-full max-w-md text-left text-xs text-muted">
            {result.errors.map((e, i) => (
              <li key={i}>Row {e.row}: {e.message}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setStep("upload"); setRaw(""); setResult(null); }}>
            Import more
          </Button>
          <Button variant="primary" onClick={() => router.push("/studio/content")}>
            Go to Content Library
          </Button>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    const columns = preview.length > 0 ? Object.keys(preview[0]) : [];
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted">
            Previewing {preview.length} of {totalRows} row(s). Review before importing.
          </p>
          <Badge tone="info">{format.toUpperCase()}</Badge>
        </div>
        <div className="rounded-xl border border-border bg-surface">
          <Table>
            <Thead>
              <Tr>
                {columns.map((c) => (
                  <Th key={c}>{c}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {preview.map((row, i) => (
                <Tr key={i}>
                  {columns.map((c) => (
                    <Td key={c} className="max-w-[220px] truncate">{row[c] ?? ""}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("upload")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="primary" loading={loading} onClick={commitImport}>
            Import {totalRows} item(s)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex gap-3">
        <button
          onClick={() => setFormat("csv")}
          className={`flex-1 rounded-xl border p-4 text-left transition-colors ${format === "csv" ? "border-brand bg-brand-soft" : "border-border hover:bg-neutral-soft"}`}
        >
          <FileSpreadsheet className="h-5 w-5 text-brand mb-2" />
          <p className="text-sm font-medium text-foreground">CSV</p>
          <p className="text-xs text-muted mt-0.5">title, type, status, category, tags, body columns</p>
        </button>
        <button
          onClick={() => setFormat("json")}
          className={`flex-1 rounded-xl border p-4 text-left transition-colors ${format === "json" ? "border-brand bg-brand-soft" : "border-border hover:bg-neutral-soft"}`}
        >
          <FileJson className="h-5 w-5 text-brand mb-2" />
          <p className="text-sm font-medium text-foreground">JSON</p>
          <p className="text-xs text-muted mt-0.5">An array of content objects</p>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-medium text-foreground" htmlFor="import-raw">
            Paste {format.toUpperCase()} or upload a file
          </label>
          <div className="flex items-center gap-2">
            {format === "csv" && (
              <button type="button" onClick={() => setRaw(SAMPLE_CSV)} className="text-xs text-brand hover:underline">
                Use sample
              </button>
            )}
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload file
            </Button>
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={onFileChange} />
          </div>
        </div>
        <Textarea
          id="import-raw"
          rows={10}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={format === "csv" ? SAMPLE_CSV : '[{"title": "My Article", "type": "article"}]'}
          className="font-mono text-xs"
        />
      </div>

      <div>
        <Button variant="primary" loading={loading} disabled={!raw.trim()} onClick={loadPreview}>
          Preview import
        </Button>
      </div>
    </div>
  );
}
