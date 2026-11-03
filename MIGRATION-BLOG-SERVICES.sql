-- Run this migration in Supabase SQL Editor before using blog administration.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null,
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- IMPORTANT: CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
-- This ALTER fixes older installations that already had blog_posts but lacked cover_image.
alter table public.blog_posts add column if not exists cover_image text;
alter table public.blog_posts add column if not exists excerpt text not null default '';
alter table public.blog_posts add column if not exists published boolean not null default false;
alter table public.blog_posts add column if not exists published_at timestamptz;
alter table public.blog_posts add column if not exists updated_at timestamptz not null default now();

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);

-- Publicly readable cover images; uploads are performed server-side with the service-role client.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];
alter table public.blog_posts enable row level security;
drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts" on public.blog_posts for select using (published = true);
-- Admin mutations use the server-side Supabase service-role client after is_admin() validation.
-- Service detail pages use the existing services table and provide tailored explanatory content.

-- Optional editable service detail content. Admin Services supports these fields after migration.
alter table public.services add column if not exists details_intro text;
alter table public.services add column if not exists process_steps jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists benefits jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists detail_sections jsonb not null default '[]'::jsonb;

-- Refresh PostgREST's schema cache so the new cover_image column is recognized immediately.
-- Ensure PostgREST sees all newly added blog and service detail columns.
notify pgrst, 'reload schema';
