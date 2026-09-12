"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  ClipboardCheck,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Sparkles,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const NAV = [
  { href: "/studio/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["author", "reviewer", "admin"] },
  { href: "/studio/content", label: "Content", icon: FileStack, roles: ["author", "reviewer", "admin"] },
  { href: "/studio/review", label: "Review Queue", icon: ClipboardCheck, roles: ["reviewer", "admin"] },
  { href: "/studio/media", label: "Media", icon: ImageIcon, roles: ["author", "reviewer", "admin"] },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3, roles: ["author", "reviewer", "admin"] },
  { href: "/studio/settings", label: "Administration", icon: Settings, roles: ["admin"] },
] as const;

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-border">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">GTM Content Hub</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 grow" aria-label="Primary">
        {NAV.filter((item) => (item.roles as readonly string[]).includes(role)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                active ? "bg-brand-soft text-brand" : "text-muted hover:bg-neutral-soft hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-muted hover:bg-neutral-soft hover:text-foreground"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          View public site
        </Link>
      </div>
    </aside>
  );
}
