"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CONTENT_STATUSES } from "@/types";
import { STATUS_LABEL } from "@/lib/workflow";
import { TYPE_LABEL } from "./StatusBadge";
import type { Category, Campaign, User } from "@/types";

export interface ContentFilterState {
  search: string;
  status: string;
  type: string;
  authorId: string;
  campaignId: string;
  categoryId: string;
}

export function ContentFilters({
  filters,
  onChange,
  users,
  categories,
  campaigns,
}: {
  filters: ContentFilterState;
  onChange: (f: ContentFilterState) => void;
  users: User[];
  categories: Category[];
  campaigns: Campaign[];
}) {
  const set = (patch: Partial<ContentFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search content..."
          className="pl-9"
          aria-label="Search content"
        />
      </div>
      <Select aria-label="Filter by status" value={filters.status} onChange={(e) => set({ status: e.target.value })} className="sm:w-40">
        <option value="all">All statuses</option>
        {CONTENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </Select>
      <Select aria-label="Filter by type" value={filters.type} onChange={(e) => set({ type: e.target.value })} className="sm:w-40">
        <option value="all">All types</option>
        {Object.entries(TYPE_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </Select>
      <Select aria-label="Filter by author" value={filters.authorId} onChange={(e) => set({ authorId: e.target.value })} className="sm:w-40">
        <option value="all">All authors</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>
      <Select aria-label="Filter by category" value={filters.categoryId} onChange={(e) => set({ categoryId: e.target.value })} className="sm:w-44">
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select aria-label="Filter by campaign" value={filters.campaignId} onChange={(e) => set({ campaignId: e.target.value })} className="sm:w-44">
        <option value="all">All campaigns</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
