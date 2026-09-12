"use client";

import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { Sidebar } from "./Sidebar";
import type { User } from "@/types";

export function Topbar({
  currentUser,
  users,
  title,
}: {
  currentUser: User;
  users: User[];
  title?: string;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="focus-ring md:hidden rounded-lg p-1.5 text-muted hover:bg-neutral-soft"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="focus-ring relative rounded-lg p-2 text-muted hover:bg-neutral-soft hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
          </button>
          <RoleSwitcher currentUser={currentUser} users={users} />
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <Sidebar role={currentUser.role} />
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="focus-ring absolute right-[-44px] top-3 rounded-lg bg-surface p-2 text-foreground shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
