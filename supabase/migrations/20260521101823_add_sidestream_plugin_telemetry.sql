create table if not exists public.sidestream_telemetry_events (
  telemetry_event_id text primary key,
  install_id_hash text,
  session_id text,
  sequence integer,
  event_name text not null,
  event_scope text,
  event_level text,
  occurred_at timestamptz,
  received_at timestamptz not null default now(),
  app_name text,
  app_version text,
  build_channel text,
  schema_version text,
  consent_state text,
  endpoint_version text,
  collector_status text not null default 'received',
  user_agent_hash text,
  payload jsonb not null default '{}'::jsonb,
  data_points jsonb not null default '{}'::jsonb,
  request_context jsonb not null default '{}'::jsonb
);

create index if not exists sidestream_telemetry_events_received_idx
  on public.sidestream_telemetry_events (received_at desc);

create index if not exists sidestream_telemetry_events_name_received_idx
  on public.sidestream_telemetry_events (event_name, received_at desc);

create index if not exists sidestream_telemetry_events_install_received_idx
  on public.sidestream_telemetry_events (install_id_hash, received_at desc);

create index if not exists sidestream_telemetry_events_session_sequence_idx
  on public.sidestream_telemetry_events (session_id, sequence);

alter table public.sidestream_telemetry_events enable row level security;
revoke all on table public.sidestream_telemetry_events from anon, authenticated;
