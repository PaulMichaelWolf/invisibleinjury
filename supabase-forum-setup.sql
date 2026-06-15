create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'Discussion',
  score integer not null default 0,
  comment_count integer not null default 0,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  forum_display_first_name text,
  forum_display_last_name text,
  forum_display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists forum_display_first_name text;

alter table public.user_profiles
  add column if not exists forum_display_last_name text;

alter table public.user_profiles
  add column if not exists forum_display_name text;

alter table public.forum_posts enable row level security;
alter table public.user_profiles enable row level security;
alter table public.forum_comments enable row level security;

drop policy if exists
  "Authenticated users can read forum posts"
  on public.forum_posts;

create policy
  "Authenticated users can read forum posts"
on public.forum_posts
for select
to authenticated
using (auth.uid() is not null);

drop policy if exists
  "Authenticated users can create their own forum posts"
  on public.forum_posts;

create policy
  "Authenticated users can create their own forum posts"
on public.forum_posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists
  "Authenticated users can read their own profile"
  on public.user_profiles;

create policy
  "Authenticated users can read their own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists
  "Authenticated users can create their own profile"
  on public.user_profiles;

create policy
  "Authenticated users can create their own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists
  "Authenticated users can update their own profile"
  on public.user_profiles;

drop policy if exists
  "Authenticated users can update their own phone number"
  on public.user_profiles;

create policy
  "Authenticated users can update their own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists
  "Authenticated users can read forum comments"
  on public.forum_comments;

create policy
  "Authenticated users can read forum comments"
on public.forum_comments
for select
to authenticated
using (auth.uid() is not null);

drop policy if exists
  "Phone verified users can create their own comments"
  on public.forum_comments;

drop policy if exists
  "Authenticated users can create their own comments"
  on public.forum_comments;

create policy
  "Authenticated users can create their own comments"
on public.forum_comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop function if exists public.sync_my_phone_verification();

drop function if exists public.update_forum_display_name(text);

create or replace function public.update_forum_display_name(
  p_first_name text,
  p_last_name text
)
returns public.user_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  clean_first_name text;
  clean_last_name text;
  clean_display_name text;
  normalized_display_name text;
  updated_profile public.user_profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  clean_first_name := nullif(trim(p_first_name), '');
  clean_last_name := nullif(trim(p_last_name), '');

  if clean_first_name is null or clean_last_name is null then
    raise exception 'First and last name are required.';
  end if;

  clean_display_name := concat_ws('-', clean_first_name, clean_last_name);
  normalized_display_name := regexp_replace(lower(clean_display_name), '[^a-z0-9]', '', 'g');

  if normalized_display_name ~ '(asshole|bitch|bullshit|cocksucker|cunt|dick|douche|faggot|fuck|motherfucker|nigger|pussy|shit|slut|whore)' then
    raise exception 'Choose a visible forum name without vulgar language.';
  end if;

  insert into public.user_profiles (
    user_id,
    forum_display_first_name,
    forum_display_last_name,
    forum_display_name,
    updated_at
  )
  values (
    auth.uid(),
    left(clean_first_name, 40),
    left(clean_last_name, 40),
    left(clean_display_name, 80),
    now()
  )
  on conflict (user_id) do update
  set
    forum_display_first_name = excluded.forum_display_first_name,
    forum_display_last_name = excluded.forum_display_last_name,
    forum_display_name = excluded.forum_display_name,
    updated_at = now()
  returning *
  into updated_profile;

  return updated_profile;
end;
$$;

-- Remove unnecessary table privileges.
revoke all privileges on table public.forum_posts from public;
revoke all privileges on table public.forum_posts from anon;
revoke all privileges on table public.forum_posts from authenticated;
revoke all privileges on table public.user_profiles from public;
revoke all privileges on table public.user_profiles from anon;
revoke all privileges on table public.user_profiles from authenticated;
revoke all privileges on table public.forum_comments from public;
revoke all privileges on table public.forum_comments from anon;
revoke all privileges on table public.forum_comments from authenticated;
revoke execute on function public.update_forum_display_name(text, text) from public;
revoke execute on function public.update_forum_display_name(text, text) from anon;

-- Signed-in users may only read and create forum posts.
grant select, insert on table public.forum_posts to authenticated;

-- Signed-in users may read and update only their own profile row through RLS.
grant select, insert, update on table public.user_profiles to authenticated;
grant execute on function public.update_forum_display_name(text, text) to authenticated;

-- Signed-in users may read and create comments.
grant select, insert on table public.forum_comments to authenticated;
