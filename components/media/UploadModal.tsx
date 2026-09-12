"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadModal({ open, onClose, onUploaded }: { open: boolean; onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const { push } = useToast();

  const reset = () => {
    setFile(null);
    setAltText("");
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size, dataUrl, altText: altText || undefined }),
      });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Asset uploaded" });
      reset();
      onUploaded();
      onClose();
    } catch {
      push({ tone: "error", title: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Upload Asset"
      description="Images, PDFs, and video are supported."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={uploading} disabled={!file} onClick={upload}>Upload</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center hover:bg-neutral-soft">
          <UploadCloud className="h-6 w-6 text-muted" />
          <span className="text-[13px] text-muted">{file ? file.name : "Click to choose a file"}</span>
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <FormField label="Alt text" hint="Describe the image for screen readers and accessibility.">
          <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g. Bar chart showing quarterly revenue growth" />
        </FormField>
      </div>
    </Modal>
  );
}
