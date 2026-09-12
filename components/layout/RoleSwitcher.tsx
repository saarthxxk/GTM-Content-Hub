"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown } from "@/components/ui/Dropdown";
import type { User } from "@/types";
import { titleCase } from "@/lib/utils";

/**
 * Demo "auth": swap between the seeded Author / Reviewer / Admin accounts to
 * exercise role-based access control and the review workflow end to end
 * without a real identity provider. See lib/auth.ts.
 */
export function RoleSwitcher({ currentUser, users }: { currentUser: User; users: User[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const switchTo = async (userId: string) => {
    setSwitchingTo(userId);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    startTransition(() => {
      router.refresh();
      setSwitchingTo(null);
    });
  };

  return (
    <Dropdown
      align="end"
      trigger={
        <button className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-soft">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
          <span className="hidden sm:block text-left">
            <span className="block text-[13px] font-medium text-foreground leading-tight">{currentUser.name}</span>
            <span className="block text-[11px] text-muted leading-tight">{titleCase(currentUser.role)}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </button>
      }
      items={users.map((u) => ({
        label: `${u.name} — ${titleCase(u.role)}${u.id === currentUser.id ? " (current)" : ""}`,
        icon: u.id === currentUser.id ? Check : undefined,
        disabled: isPending && switchingTo === u.id,
        onSelect: () => switchTo(u.id),
      }))}
    />
  );
}
