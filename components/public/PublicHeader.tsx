import Link from "next/link";
import { Sparkles } from "lucide-react";

const NAV = [
  { href: "/articles", label: "Articles" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/events", label: "Events" },
  { href: "/case-studies", label: "Case Studies" },
];

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">GTM Content Hub</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring rounded text-[13.5px] font-medium text-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="focus-ring rounded-lg bg-brand px-3.5 py-2 text-[13px] font-medium text-white hover:bg-brand-hover"
        >
          Sign in to Studio
        </Link>
      </div>
    </header>
  );
}
