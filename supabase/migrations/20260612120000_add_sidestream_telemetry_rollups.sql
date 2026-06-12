alter table public.sidestream_telemetry_events
  add column if not exists support_code text,
  add column if not exists batch_id text,
  add column if not exists event_category text,
  add column if not exists severity text not null default 'info',
  add column if not exists error_class text,
  add column if not exists action_name text,
  add column if not exists payload_redaction_version text,
  add column if not exists consent_state_payload jsonb not null default '{}'::jsonb;

create index if not exists sidestream_telemetry_events_support_code_received_idx
  on public.sidestream_telemetry_events (support_code, received_at desc)
  where support_code is not null;

create index if not exists sidestream_telemetry_events_category_received_idx
  on public.sidestream_telemetry_events (event_category, received_at desc);

create index if not exists sidestream_telemetry_events_error_class_received_idx
  on public.sidestream_telemetry_events (error_class, received_at desc)
  where error_class is not null;

create index if not exists sidestream_telemetry_events_action_name_received_idx
  on public.sidestream_telemetry_events (action_name, received_at desc)
  where action_name is not null;

create index if not exists sidestream_telemetry_events_batch_id_idx
  on public.sidestream_telemetry_events (batch_id)
  where batch_id is not null;

create table if not exists public.sidestream_installs (
  install_id_hash text primary key,
  support_code text unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_session_id text,
  app_name text,
  app_version text,
  build_channel text,
  schema_version text,
  consent_state text,
  consent_state_payload jsonb not null default '{}'::jsonb,
  os_platform text,
  os_arch text,
  node_version text,
  latest_event_name text,
  latest_event_category text,
  latest_severity text,
  latest_error_class text,
  latest_action_name text,
  latest_runtime jsonb not null default '{}'::jsonb,
  latest_context jsonb not null default '{}'::jsonb,
  event_count integer not null default 0,
  error_count integer not null default 0,
  warning_count integer not null default 0,
  download_count integer not null default 0,
  failed_download_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists sidestream_installs_support_code_idx
  on public.sidestream_installs (support_code)
  where support_code is not null;

create index if not exists sidestream_installs_last_seen_idx
  on public.sidestream_installs (last_seen_at desc);

create index if not exists sidestream_installs_error_last_seen_idx
  on public.sidestream_installs (latest_error_class, last_seen_at desc)
  where latest_error_class is not null;

create table if not exists public.sidestream_sessions (
  session_id text primary key,
  install_id_hash text references public.sidestream_installs (install_id_hash) on delete cascade,
  support_code text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  app_name text,
  app_version text,
  build_channel text,
  schema_version text,
  os_platform text,
  os_arch text,
  node_version text,
  event_count integer not null default 0,
  error_count integer not null default 0,
  warning_count integer not null default 0,
  latest_event_name text,
  latest_event_category text,
  latest_severity text,
  latest_error_class text,
  latest_action_name text,
  latest_context jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists sidestream_sessions_install_seen_idx
  on public.sidestream_sessions (install_id_hash, last_seen_at desc)
  where install_id_hash is not null;

create index if not exists sidestream_sessions_support_code_seen_idx
  on public.sidestream_sessions (support_code, last_seen_at desc)
  where support_code is not null;

create index if not exists sidestream_sessions_error_seen_idx
  on public.sidestream_sessions (latest_error_class, last_seen_at desc)
  where latest_error_class is not null;

alter table public.sidestream_installs enable row level security;
alter table public.sidestream_sessions enable row level security;
revoke all on table public.sidestream_installs from anon, authenticated;
revoke all on table public.sidestream_sessions from anon, authenticated;
