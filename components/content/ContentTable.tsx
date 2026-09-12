"use client";

import Link from "next/link";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { formatRelativeDate } from "@/lib/utils";
import type { Content, User } from "@/types";

export interface ContentTableProps {
  items: Content[];
  users: User[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
}

export function ContentTable({ items, users, selectable, selectedIds = [], onToggle, onToggleAll }: ContentTableProps) {
  const userById = (id: string) => users.find((u) => u.id === id);
  const allSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  return (
    <Table>
      <Thead>
        <Tr>
          {selectable && (
            <Th className="w-10">
              <Checkbox
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all content"
              />
            </Th>
          )}
          <Th>Content</Th>
          <Th>Type</Th>
          <Th>Status</Th>
          <Th>Author</Th>
          <Th>Updated</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => {
          const author = userById(item.authorId);
          return (
            <Tr key={item.id}>
              {selectable && (
                <Td>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggle?.(item.id)}
                    aria-label={`Select ${item.title}`}
                  />
                </Td>
              )}
              <Td className="max-w-xs">
                <Link href={`/studio/content/${item.id}`} className="focus-ring rounded font-medium text-foreground hover:text-brand line-clamp-1">
                  {item.title}
                </Link>
                {item.excerpt && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.excerpt}</p>}
              </Td>
              <Td>
                <TypeBadge type={item.type} />
              </Td>
              <Td>
                <StatusBadge status={item.status} />
              </Td>
              <Td>
                {author && (
                  <span className="flex items-center gap-2">
                    <Avatar name={author.name} color={author.avatarColor} size="sm" />
                    <span className="text-[13px] text-foreground">{author.name}</span>
                  </span>
                )}
              </Td>
              <Td className="text-[13px] text-muted">{formatRelativeDate(item.updatedAt)}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
