"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/types";

export function CampaignManager({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const create = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, startDate, endDate }),
      });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Campaign created" });
      setOpen(false);
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      router.refresh();
    } catch {
      push({ tone: "error", title: "Could not create campaign" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Campaigns</h3>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Button>
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Dates</Th>
          </Tr>
        </Thead>
        <Tbody>
          {campaigns.map((c) => (
            <Tr key={c.id}>
              <Td>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted line-clamp-1">{c.description}</p>
              </Td>
              <Td className="text-[13px] text-muted whitespace-nowrap">
                {formatDate(c.startDate)} – {formatDate(c.endDate)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={submitting} disabled={!name || !startDate || !endDate} onClick={create}>Create</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormField>
            <FormField label="End Date" required>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}
