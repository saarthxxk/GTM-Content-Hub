import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listContent } from "@/lib/store/content";
import { listCategories } from "@/lib/store/catalog";
import { ContentCard } from "@/components/public/ContentCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const published = listContent({ status: "published" });
  const categories = listCategories();
  const featured = published.slice(0, 6);
  const categoryById = (id?: string) => categories.find((c) => c.id === id);

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-8 md:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Perspectives on AI, cloud, and the future of enterprise technology
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted">
            Articles, campaigns, events, and case studies from our go-to-market team — published straight from GTM Content Hub.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/articles" className="focus-ring rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">
              Browse Articles
            </Link>
            <Link href="/case-studies" className="focus-ring rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:bg-neutral-soft">
              View Case Studies
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Latest Content</h2>
          <Link href="/articles" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-muted">No published content yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <ContentCard key={c.id} content={c} category={categoryById(c.categoryId)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
