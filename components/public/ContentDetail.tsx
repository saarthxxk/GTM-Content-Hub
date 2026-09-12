import Link from "next/link";
import { Calendar, MapPin, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import type { Campaign, Category, Content, User } from "@/types";

export function ContentDetail({
  content,
  author,
  category,
  campaign,
}: {
  content: Content;
  author?: User;
  category?: Category;
  campaign?: Campaign;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <div className="mb-6">
        {category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">{category.name}</span>
        )}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{content.title}</h1>
        {content.subtitle && <p className="mt-2 text-lg text-muted">{content.subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-muted">
          {author && (
            <span className="flex items-center gap-2">
              <Avatar name={author.name} color={author.avatarColor} size="sm" />
              {author.name}
            </span>
          )}
          {content.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(content.publishedAt)}
            </span>
          )}
          {campaign && <span>Part of {campaign.name}</span>}
        </div>
      </div>

      {content.type === "event" && content.typeFields.event && (
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3">
          {content.typeFields.event.eventDate && (
            <div>
              <p className="text-xs text-muted">Date</p>
              <p className="text-[13px] font-medium text-foreground">{formatDate(content.typeFields.event.eventDate)}</p>
            </div>
          )}
          {content.typeFields.event.location && (
            <div>
              <p className="text-xs text-muted flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
              <p className="text-[13px] font-medium text-foreground">{content.typeFields.event.location}</p>
            </div>
          )}
          {content.typeFields.event.speaker && (
            <div>
              <p className="text-xs text-muted flex items-center gap-1"><UserIcon className="h-3 w-3" /> Speaker</p>
              <p className="text-[13px] font-medium text-foreground">{content.typeFields.event.speaker}</p>
            </div>
          )}
        </div>
      )}

      {content.type === "case_study" && content.typeFields.case_study && (
        <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Client</p>
            <p className="text-[13px] text-foreground">{content.typeFields.case_study.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Industry</p>
            <p className="text-[13px] text-foreground">{content.typeFields.case_study.industry}</p>
          </div>
        </div>
      )}

      <div className="prose-editor" dangerouslySetInnerHTML={{ __html: content.body }} />

      {content.type === "case_study" && content.typeFields.case_study && (
        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8">
          {content.typeFields.case_study.challenge && (
            <div>
              <h2 className="text-base font-semibold text-foreground">Challenge</h2>
              <p className="mt-1.5 text-[15px] text-muted">{content.typeFields.case_study.challenge}</p>
            </div>
          )}
          {content.typeFields.case_study.solution && (
            <div>
              <h2 className="text-base font-semibold text-foreground">Solution</h2>
              <p className="mt-1.5 text-[15px] text-muted">{content.typeFields.case_study.solution}</p>
            </div>
          )}
          {content.typeFields.case_study.results && (
            <div>
              <h2 className="text-base font-semibold text-foreground">Results</h2>
              <p className="mt-1.5 text-[15px] text-muted">{content.typeFields.case_study.results}</p>
            </div>
          )}
        </div>
      )}

      {content.type === "campaign" && content.typeFields.campaign?.cta && (
        <div className="mt-10 rounded-xl border border-brand-soft bg-brand-soft p-6 text-center">
          <Link
            href={content.typeFields.campaign.ctaUrl || "#"}
            className="focus-ring inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            {content.typeFields.campaign.cta}
          </Link>
        </div>
      )}

      {content.type === "event" && content.typeFields.event?.registrationUrl && (
        <div className="mt-10 rounded-xl border border-brand-soft bg-brand-soft p-6 text-center">
          <Link
            href={content.typeFields.event.registrationUrl}
            className="focus-ring inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Register Now
          </Link>
        </div>
      )}
    </article>
  );
}
