import { Avatar } from "@/components/ui/Avatar";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { formatDate, titleCase } from "@/lib/utils";
import type { AuditLogEntry, User } from "@/types";

export function AuditLogTable({ entries, users }: { entries: AuditLogEntry[]; users: User[] }) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>User</Th>
          <Th>Action</Th>
          <Th>Entity</Th>
          <Th>When</Th>
        </Tr>
      </Thead>
      <Tbody>
        {entries.map((e) => {
          const actor = users.find((u) => u.id === e.userId);
          return (
            <Tr key={e.id}>
              <Td>
                {actor && (
                  <span className="flex items-center gap-2">
                    <Avatar name={actor.name} color={actor.avatarColor} size="sm" />
                    <span className="text-[13px] text-foreground">{actor.name}</span>
                  </span>
                )}
              </Td>
              <Td className="text-[13px] text-muted">{titleCase(e.action)}</Td>
              <Td className="max-w-xs truncate text-[13px] text-foreground">{e.entityLabel}</Td>
              <Td className="whitespace-nowrap text-[13px] text-muted">{formatDate(e.createdAt, { hour: "numeric", minute: "2-digit" })}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
