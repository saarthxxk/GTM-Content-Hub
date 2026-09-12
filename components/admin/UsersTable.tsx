"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import type { Role, User } from "@/types";

export function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const changeRole = async (id: string, role: Role) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      push({ tone: "success", title: "Role updated" });
      router.refresh();
    } catch {
      push({ tone: "error", title: "Could not update role" });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>User</Th>
          <Th>Title</Th>
          <Th>Role</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((u) => (
          <Tr key={u.id}>
            <Td>
              <span className="flex items-center gap-2.5">
                <Avatar name={u.name} color={u.avatarColor} size="sm" />
                <span>
                  <span className="block text-[13px] font-medium text-foreground">{u.name}</span>
                  <span className="block text-xs text-muted">{u.email}</span>
                </span>
              </span>
            </Td>
            <Td className="text-[13px] text-muted">{u.title ?? "—"}</Td>
            <Td>
              <Select
                value={u.role}
                disabled={updating === u.id || u.id === currentUserId}
                onChange={(e) => changeRole(u.id, e.target.value as Role)}
                className="w-36"
                aria-label={`Change role for ${u.name}`}
              >
                <option value="author">Author</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </Select>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
