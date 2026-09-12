"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { titleCase } from "@/lib/utils";
import type { User } from "@/types";

const ROLE_DESCRIPTION: Record<string, string> = {
  author: "Create and edit content, submit for review, use the AI Assistant.",
  reviewer: "Review submitted content, request changes, and approve.",
  admin: "Full access — users, taxonomy, bulk operations, and audit log.",
};

export function LoginClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState<string | null>(null);

  const signIn = async (userId: string) => {
    setSigningIn(userId);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.push("/studio/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => signIn(u.id)}
          disabled={!!signingIn}
          className="focus-ring flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition-colors hover:border-brand hover:bg-brand-soft disabled:opacity-60"
        >
          <Avatar name={u.name} color={u.avatarColor} size="lg" />
          <div className="min-w-0 grow">
            <p className="text-sm font-medium text-foreground">
              {u.name} <span className="font-normal text-muted">· {titleCase(u.role)}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">{ROLE_DESCRIPTION[u.role]}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
        </button>
      ))}
    </div>
  );
}
