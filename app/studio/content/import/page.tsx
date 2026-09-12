import { ImportWizard } from "@/components/content/ImportWizard";

export const metadata = { title: "Import Content" };

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Import Content</h1>
        <p className="mt-1 text-[13px] text-muted">
          Bulk-migrate content from a CSV or JSON export. Upload → validate → preview → import.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
