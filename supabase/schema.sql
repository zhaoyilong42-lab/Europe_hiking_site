-- Run this once in Supabase Dashboard → SQL Editor.
-- Passwords are handled and securely hashed by Supabase Auth. Never add a
-- password column to this table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_name text not null check (char_length(trim(family_name)) > 0),
  given_name text not null check (char_length(trim(given_name)) > 0),
  gender text not null check (gender in ('male', 'female')),
  email text not null,
  phone text not null check (char_length(trim(phone)) > 0),
  username text unique check (username ~ '^[A-Za-z0-9_.-]{3,30}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preserve existing usernames, but make them optional for new email-based accounts.
alter table public.profiles alter column username drop not null;

alter table public.profiles enable row level security;

drop policy if exists "Users may read their own profile" on public.profiles;
create policy "Users may read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users may update their own profile" on public.profiles;
create policy "Users may update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, family_name, given_name, gender, email, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'family_name',
    new.raw_user_meta_data ->> 'given_name',
    new.raw_user_meta_data ->> 'gender',
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

-- Authentication uses Supabase's email/password flow directly.  Do not expose
-- profile email addresses through a public username lookup RPC.
drop function if exists public.email_for_username(text);

drop function if exists public.username_available(text);
