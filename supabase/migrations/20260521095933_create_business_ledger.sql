create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_hash text,
  stripe_customer_id text unique,
  name text,
  country text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint customers_email_normalized check (email = lower(trim(email))),
  constraint customers_email_unique unique (email)
);

create table if not exists public.email_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_hash text,
  offer_code text,
  source_page text,
  source_path text,
  visitor_id text,
  session_id text,
  visitor_hash text,
  storage_targets text[] not null default array[]::text[],
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_leads_email_normalized check (email = lower(trim(email))),
  constraint email_leads_email_unique unique (email)
);

create table if not exists public.checkout_sessions (
  stripe_session_id text primary key,
  stripe_customer_id text,
  customer_id uuid references public.customers(id) on delete set null,
  product_id text not null,
  product_name text,
  pricing_variant text,
  mode text,
  session_status text,
  payment_status text,
  amount_total integer,
  amount_subtotal integer,
  currency text,
  customer_email text,
  customer_country text,
  checkout_url text,
  stripe_created_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz,
  raw_session jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_events (
  stripe_event_id text primary key,
  type text not null,
  livemode boolean,
  api_version text,
  stripe_created_at timestamptz,
  stripe_session_id text references public.checkout_sessions(stripe_session_id) on delete set null,
  processing_status text not null default 'received',
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique references public.checkout_sessions(stripe_session_id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  product_id text not null,
  product_name text,
  amount_total integer,
  currency text,
  payment_status text,
  purchased_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  fulfillment_status text not null default 'pending',
  email_delivery_id text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text not null unique,
  purchase_id uuid references public.purchases(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  product_id text not null,
  stripe_session_id text not null unique references public.checkout_sessions(stripe_session_id) on delete cascade,
  status text not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  product_id text not null,
  stripe_session_id text references public.checkout_sessions(stripe_session_id) on delete set null,
  delivery_email text,
  url_hash text,
  expires_at timestamptz,
  email_delivery_id text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  status text not null,
  http_status integer,
  link_expires_at timestamptz,
  visitor_hash text,
  user_agent text,
  referer text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists customers_last_seen_at_idx on public.customers (last_seen_at desc);
create index if not exists email_leads_created_at_idx on public.email_leads (created_at desc);
create index if not exists checkout_sessions_customer_id_idx on public.checkout_sessions (customer_id);
create index if not exists checkout_sessions_product_created_idx on public.checkout_sessions (product_id, stripe_created_at desc);
create index if not exists stripe_events_type_created_idx on public.stripe_events (type, stripe_created_at desc);
create index if not exists purchases_customer_product_idx on public.purchases (customer_id, product_id);
create index if not exists purchases_product_purchased_idx on public.purchases (product_id, purchased_at desc);
create index if not exists licenses_customer_product_idx on public.licenses (customer_id, product_id);
create index if not exists licenses_product_status_idx on public.licenses (product_id, status);
create index if not exists download_links_session_idx on public.download_links (stripe_session_id);
create index if not exists download_events_product_created_idx on public.download_events (product_id, created_at desc);

alter table public.customers enable row level security;
alter table public.email_leads enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.purchases enable row level security;
alter table public.licenses enable row level security;
alter table public.download_links enable row level security;
alter table public.download_events enable row level security;

revoke all on table public.customers from anon, authenticated;
revoke all on table public.email_leads from anon, authenticated;
revoke all on table public.checkout_sessions from anon, authenticated;
revoke all on table public.stripe_events from anon, authenticated;
revoke all on table public.purchases from anon, authenticated;
revoke all on table public.licenses from anon, authenticated;
revoke all on table public.download_links from anon, authenticated;
revoke all on table public.download_events from anon, authenticated;
