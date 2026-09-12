import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>© {new Date().getFullYear()} GTM Content Hub. All content is demo data.</p>
        <div className="flex gap-5">
          <Link href="/articles" className="hover:text-foreground">Articles</Link>
          <Link href="/campaigns" className="hover:text-foreground">Campaigns</Link>
          <Link href="/events" className="hover:text-foreground">Events</Link>
          <Link href="/case-studies" className="hover:text-foreground">Case Studies</Link>
        </div>
      </div>
    </footer>
  );
}
