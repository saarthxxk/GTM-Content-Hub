import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PUBLIC_PATH } from "@/lib/public-routes";
import type { Content, Category } from "@/types";

export function ContentCard({ content, category }: { content: Content; category?: Category }) {
  return (
    <Link
      href={`${PUBLIC_PATH[content.type]}/${content.slug}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-soft to-neutral-soft">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">{category?.name ?? content.type.replace("_", " ")}</span>
      </div>
      <div className="flex grow flex-col p-4">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-brand line-clamp-2">{content.title}</h3>
        {content.excerpt && <p className="mt-2 text-[13px] text-muted line-clamp-3">{content.excerpt}</p>}
        <p className="mt-auto pt-3 text-xs text-muted">{formatDate(content.publishedAt)}</p>
      </div>
    </Link>
  );
}
