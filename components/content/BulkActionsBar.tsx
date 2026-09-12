"use client";

import { useState } from "react";
import { Archive, ChevronDown, Tag, FolderOpen, Megaphone, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { Campaign, Category, Tag as TagType, User } from "@/types";

type BulkAction = "category" | "tag" | "campaign" | "author" | "archive" | null;

export function BulkActionsBar({
  count,
  categories,
  tags,
  campaigns,
  users,
  onClear,
  onApplied,
}: {
  count: number;
  categories: Category[];
  tags: TagType[];
  campaigns: Campaign[];
  users: User[];
  onClear: () => void;
  onApplied: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [action, setAction] = useState<BulkAction>(null);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();

  const submit = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      await onApplied(payload);
      push({ tone: "success", title: `Updated ${count} content item${count === 1 ? "" : "s"}` });
      setAction(null);
      setValue("");
    } catch {
      push({ tone: "error", title: "Bulk update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 rounded-xl border border-brand-soft bg-brand-soft px-4 py-2.5">
        <span className="text-[13px] font-medium text-brand">{count} selected</span>
        <Dropdown
          align="start"
          trigger={
            <Button variant="outline" size="sm">
              Bulk actions <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: "Change category", icon: FolderOpen, onSelect: () => setAction("category") },
            { label: "Add tag", icon: Tag, onSelect: () => setAction("tag") },
            { label: "Update campaign", icon: Megaphone, onSelect: () => setAction("campaign") },
            { label: "Reassign author", icon: UserRound, onSelect: () => setAction("author") },
            { label: "Archive selected", icon: Archive, destructive: true, onSelect: () => setAction("archive") },
          ]}
        />
        <button onClick={onClear} className="focus-ring ml-auto rounded p-1 text-brand hover:bg-white/50" aria-label="Clear selection">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Modal
        open={action === "category"}
        onClose={() => setAction(null)}
        title="Change category"
        description={`Applies to ${count} selected content item${count === 1 ? "" : "s"}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="primary" loading={submitting} disabled={!value} onClick={() => submit({ categoryId: value })}>Apply</Button>
          </>
        }
      >
        <FormField label="Category">
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
      </Modal>

      <Modal
        open={action === "tag"}
        onClose={() => setAction(null)}
        title="Add tag"
        description={`Applies to ${count} selected content item${count === 1 ? "" : "s"}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="primary" loading={submitting} disabled={!value} onClick={() => submit({ addTagId: value })}>Apply</Button>
          </>
        }
      >
        <FormField label="Tag">
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select a tag…</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FormField>
      </Modal>

      <Modal
        open={action === "campaign"}
        onClose={() => setAction(null)}
        title="Update campaign"
        description={`Applies to ${count} selected content item${count === 1 ? "" : "s"}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="primary" loading={submitting} disabled={!value} onClick={() => submit({ campaignId: value })}>Apply</Button>
          </>
        }
      >
        <FormField label="Campaign">
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select a campaign…</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
      </Modal>

      <Modal
        open={action === "author"}
        onClose={() => setAction(null)}
        title="Reassign author"
        description={`Applies to ${count} selected content item${count === 1 ? "" : "s"}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="primary" loading={submitting} disabled={!value} onClick={() => submit({ authorId: value })}>Apply</Button>
          </>
        }
      >
        <FormField label="Author">
          <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select an author…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </FormField>
      </Modal>

      <Modal
        open={action === "archive"}
        onClose={() => setAction(null)}
        title="Archive selected content?"
        description={`This will archive ${count} content item${count === 1 ? "" : "s"}. This can be reversed by an admin later.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={() => submit({ archive: true })}>Archive</Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">Archived content is removed from the public site and content library defaults, but remains accessible from Settings → Audit Log.</p>
      </Modal>
    </>
  );
}
