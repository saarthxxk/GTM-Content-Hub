-- GTM Content Hub — reference Postgres schema for Supabase.
--
-- This mirrors the shape of lib/store/db.ts (the mock JSON-file "database"
-- the app runs against out of the box) so that swapping the mock data layer
-- for real Supabase queries is a mechanical exercise, not a redesign: the
-- table names and columns below line up 1:1 with the TypeScript types in
-- types/index.ts.
--
-- To adopt this for real:
--   1. Run this migration against a Supabase project (`supabase db push` or
--      paste into the SQL editor).
--   2. Replace lib/store/*.ts functions with @supabase/ssr queries against
--      these tables — the function signatures (listContent, createContent,
--      performTransition, ...) are designed to be swapped in place.
--   3. Replace lib/auth.ts with Supabase Auth session handling.
--   4. Point lib/store/media.ts uploads at Supabase Storage instead of
--      inlining data: URLs.

create extension if not exists "pgcrypto";

create type user_role as enum ('author', 'reviewer', 'admin');
create type content_type as enum ('article', 'campaign', 'event', 'case_study');
create type content_status as enum (
  'draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived'
);
create type media_type as enum ('image', 'document', 'video');
create type review_decision as enum ('approved', 'changes_requested');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role user_role not null default 'author',
  avatar_color text not null default '#6366f1',
  title text,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date
);

create table content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  type content_type not null,
  status content_status not null default 'draft',
  body text not null default '',
  excerpt text,
  cover_image text,
  author_id uuid not null references users(id),
  campaign_id uuid references campaigns(id),
  category_id uuid references categories(id),
  meta_title text default '',
  meta_description text default '',
  keywords text[] default '{}',
  canonical_url text,
  og_image text,
  type_fields jsonb not null default '{}',
  quality jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  version_count int not null default 1
);
create index content_status_idx on content(status);
create index content_author_idx on content(author_id);
create index content_slug_idx on content(slug);

create table content_tags (
  content_id uuid not null references content(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  version_number int not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  note text
);
create index content_versions_content_idx on content_versions(content_id);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  reviewer_id uuid not null references users(id),
  decision review_decision not null,
  comments text,
  created_at timestamptz not null default now()
);
create index reviews_content_idx on reviews(content_id);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  type media_type not null,
  mime_type text not null,
  size bigint not null default 0,
  alt_text text,
  description text,
  tags text[] default '{}',
  campaign_id uuid references campaigns(id),
  uploaded_by uuid not null references users(id),
  uploaded_at timestamptz not null default now(),
  width int,
  height int
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  entity_label text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on audit_logs(created_at desc);

create table analytics_daily (
  content_id uuid not null references content(id) on delete cascade,
  date date not null,
  views int not null default 0,
  clicks int not null default 0,
  cta_clicks int not null default 0,
  conversions int not null default 0,
  primary key (content_id, date)
);

-- ---------------------------------------------------------------------
-- Row Level Security (illustrative — tune to your auth claims setup)
-- ---------------------------------------------------------------------

alter table content enable row level security;
alter table content_versions enable row level security;
alter table reviews enable row level security;
alter table media_assets enable row level security;
alter table audit_logs enable row level security;

-- Everyone signed in can read published content; authors can read their own
-- drafts; reviewers/admins can read everything.
create policy "content_select" on content
  for select using (
    status = 'published'
    or author_id = auth.uid()
    or exists (
      select 1 from users u where u.id = auth.uid() and u.role in ('reviewer', 'admin')
    )
  );

-- Authors can insert/update their own content; admins can touch anything.
create policy "content_author_write" on content
  for all using (
    author_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  )
  with check (
    author_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Reviewers/admins can write review decisions.
create policy "reviews_write" on reviews
  for insert with check (
    exists (select 1 from users u where u.id = auth.uid() and u.role in ('reviewer', 'admin'))
  );

create policy "reviews_select" on reviews
  for select using (true);

create policy "audit_logs_select" on audit_logs
  for select using (
    exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  );
