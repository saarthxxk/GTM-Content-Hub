import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { getCurrentUser } from "@/lib/auth";
import { importContent, ImportRow } from "@/lib/store/content";

export const dynamic = "force-dynamic";

/**
 * Bulk content import (CSV or JSON), per the "Import Content" flow in the
 * product spec: upload -> validate -> preview -> import. This endpoint does
 * validate + import in one step; the client calls it twice — once with
 * `commit: false` to render a preview table, once with `commit: true` to
 * actually create the content.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const { format, raw, commit } = body as { format: "csv" | "json"; raw: string; commit?: boolean };

  let rows: ImportRow[] = [];
  try {
    if (format === "csv") {
      const parsed = Papa.parse<Record<string, string>>(raw, { header: true, skipEmptyLines: true });
      if (parsed.errors.length) {
        return NextResponse.json({ error: `CSV parse error: ${parsed.errors[0].message}` }, { status: 400 });
      }
      rows = parsed.data.map((r) => ({
        title: r.title ?? "",
        type: r.type,
        status: r.status,
        category: r.category,
        tags: r.tags,
        body: r.body,
      }));
    } else {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("JSON must be an array of content objects");
      rows = data;
    }
  } catch (err) {
    return NextResponse.json({ error: `Failed to parse ${format.toUpperCase()}: ${(err as Error).message}` }, { status: 400 });
  }

  if (!commit) {
    return NextResponse.json({ preview: rows.slice(0, 50), totalRows: rows.length });
  }

  const result = importContent(rows, user.id);
  return NextResponse.json(result);
}
