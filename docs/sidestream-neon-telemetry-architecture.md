# Sidestream Neon Telemetry Architecture

This is the collector-side contract for Sidestream telemetry after the database migration to Neon as the primary server-side Postgres database. The storage model is Blob-first for immutable accepted batches, then Neon for imports, rollups, and guarded dashboard reads. It is intentionally optimized for one human operator checking telemetry a few times per day. It is not a real-time, multi-user analytics system, and future dashboard work should not add high-frequency polling, websocket streams, or broad ad hoc raw-event reads.

## Goals

- Preserve every accepted data point currently accepted by `POST /api/plugin-telemetry`.
- Keep all Blob, Neon, legacy Supabase, Postgres, Stripe, Resend, and download secrets server-side only.
- Use Vercel Blob as the immutable raw telemetry batch archive and backfill source.
- Use Neon as the primary server-side Postgres database for telemetry imports, recent-event queries, rollups, dashboards, and support lookup.
- Reduce egress and compute by importing on a schedule or explicit manual refresh instead of querying raw operational tables for every dashboard view.
- Keep FlowState changes out of this repo; this repo only exposes collector, import, and guarded read contracts for the FlowState analytics dashboard to consume later.

## Database Connection Precedence

Sidestream telemetry must resolve its server-side Postgres connection in this order:

1. `SIDESTREAM_NEON_DATABASE_URL`
2. `NEON_DATABASE_URL`
3. `DATABASE_URL` or `POSTGRES_URL`, but only when the selected URL is the Neon connection

`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_POSTGRES_URL` may still exist in Vercel Production for historical reasons. Their presence must not cause Sidestream telemetry to prefer Supabase REST or a Supabase pooler over Neon. Supabase REST is a legacy Supabase path and may be used only behind an explicit legacy fallback gate, not as the default collector, importer, rollup, or dashboard-read path.

Implementations must not infer that legacy Supabase is enabled from the presence of `SUPABASE_URL` or `SUPABASE_SECRET_KEY`. Any legacy Supabase fallback must be deliberately gated separately, documented as legacy, and lower priority than every Neon connection option above.

FlowState/dashboard clients must call guarded website APIs. They must never receive `SIDESTREAM_NEON_DATABASE_URL`, `NEON_DATABASE_URL`, Blob tokens, legacy Supabase keys, raw Blob URLs, or any other server database credential.

## Current Collector Contract To Preserve

`api/plugin-telemetry.js` accepts `POST /api/plugin-telemetry` from the Sidestream CEP extension and native installer postinstall script.

Request and batch limits:

- Request body is capped at `512 KB`.
- `events` must be an array; the collector accepts at most the first 100 events.
- Events missing `id` or `event_name` are dropped before persistence.
- An empty accepted event set returns `202` with `accepted: 0` and `recorded: 0`.
- `SIDESTREAM_TELEMETRY_ENABLED=0` keeps the endpoint deployed but returns `202` with `disabled: true`.

Every accepted event must preserve the same sanitized fields the route accepts today:

| Accepted field | Storage contract |
| --- | --- |
| `id` | Stored as `telemetry_event_id`; max 120 chars; idempotency key for retries/imports. |
| `install_id_hash` | Max 128 chars; links normal panel events to install rollups. |
| `support_code` | Max 40 chars; enables support lookup without exposing user identity. |
| `session_id` | Max 128 chars; links events to session rollups. |
| `sequence` | Numeric if parseable, otherwise null. |
| `event_name` | Required; max 120 chars. |
| `event_category` | Normalized to the allowed category set below. |
| `event_scope` | Max 80 chars. |
| `event_level` | Max 40 chars; retained for compatibility. |
| `severity` | Normalized to `info`, `warning`, or `error`. |
| `error_class` | Sanitized label; max 80 chars. |
| `action_name` | Sanitized label; max 120 chars. |
| `batch_id` | Max 120 chars; carried through archive and import. |
| `occurred_at` | ISO timestamp if valid, otherwise null at intake; import may use receive time for rollup ordering. |
| `app_name` | Max 80 chars. |
| `app_version` | Max 40 chars. |
| `build_channel` | Max 40 chars. |
| `schema_version` | Max 40 chars. |
| `payload_redaction_version` | Max 40 chars; tells import/dashboard which redaction contract produced the payload. |
| `consent_state` | Compatibility text summary derived from the consent object or legacy string. |
| `consent_state_payload` | Sanitized JSON object, capped at `4 KB`. |
| `payload` | Sanitized JSON object, capped at `48 KB`; preserve all keys exactly after existing redaction/sanitization. |
| `data_points` | Sanitized JSON object, capped at `48 KB`; preserve all keys exactly after existing redaction/sanitization. |

The allowed `event_category` values are `user_action`, `runtime_status`, `search`, `preview`, `download`, `postprocess`, `import`, `settings`, `update`, `install`, and `error`. Invalid categories become `runtime_status`.

The allowed `severity` values are `info`, `warning`, and `error`. `warn` becomes `warning`; invalid values become `info`.

Server-derived fields must remain server-owned:

- `endpoint_version`
- `received_at`
- `collector_status`
- hashed user agent
- hashed IP plus request origin inside `request_context`

The collector must continue rejecting or normalizing raw URLs, local paths, filenames, titles, channels, search queries, command output, stack traces, cookies, clipboard content, and database credentials before storage. The target Neon/Blob flow must not relax the existing redaction boundary.

## Target Storage Flow

1. The CEP extension or installer posts a batch to `/api/plugin-telemetry`.
2. The collector validates and sanitizes exactly as it does today.
3. The collector writes one immutable archive object to Vercel Blob containing the accepted sanitized events plus server context.
4. The collector acknowledges the CEP queue only after the archive write succeeds.
5. A scheduled or manual importer reads unimported Blob archives, upserts recent raw event rows into Neon by `telemetry_event_id`, and updates compact rollups.
6. Dashboard APIs read only from guarded Neon summary/recent tables, never directly from Blob and never from server secret env vars.

The Blob archive is the immutable raw source of truth. Neon is the primary queryable database state for imports, rollups, and guarded reads, and it can be rebuilt from Blob if rollup logic changes or a Neon branch is replaced.

## Blob Archive Contract

Archive one JSON object per accepted request batch. Use a non-overwriting key that makes date-range import cheap, for example:

```text
sidestream/telemetry/raw/YYYY/MM/DD/<received-at-ms>-<request-id>-<batch-id-or-none>.json
```

The archived object should contain:

- `schema`: stable archive schema label, for example `sidestream.telemetry.archive.v1`.
- `received_at`: server receive timestamp.
- `endpoint_version`: collector endpoint version.
- `source`: `plugin_telemetry`.
- `request`: server-owned hashed request context only.
- `accepted`: accepted event count.
- `events`: the sanitized accepted event objects with every data point listed above.
- `collector`: implementation metadata such as archive writer version.

Do not store raw request headers, raw IP addresses, raw user agents, Blob tokens, Neon URLs, legacy Supabase service keys, Stripe keys, download secrets, cookies, or unredacted payloads in the archive.

Blob write failure is ACK-critical: return non-2xx so the CEP queue keeps its local batch and retries. Neon import failure is not ACK-critical once the Blob archive exists.

## Neon Store Contract

Neon is the primary server-side Postgres database for queryable recent raw rows plus compact rollups. It should not be treated as permanent raw storage because Vercel Blob remains the immutable archive and backfill source.

Minimum tables or equivalent projections:

- `sidestream_telemetry_events_recent`: imported recent raw rows keyed by `telemetry_event_id`; includes all accepted event fields, server receive/import metadata, and `archive_blob_key`.
- `sidestream_installs`: latest per-install support/runtime/error/action state and counters.
- `sidestream_sessions`: latest per-session support/runtime/error/action state and counters.
- `sidestream_telemetry_hourly_rollups`: hourly event/category/severity/action/download/error counts for short-window dashboard summaries.
- `sidestream_telemetry_daily_rollups`: daily counts for longer trend views.
- `sidestream_telemetry_import_runs`: import checkpoints, source Blob keys, counts, durations, and errors.

Importer behavior:

- Upsert raw recent rows by `telemetry_event_id`; duplicate CEP retries and duplicate Blob imports must be idempotent.
- Preserve `payload` and `data_points` JSON unchanged from the sanitized archive for the recent retention window.
- Use `occurred_at` when valid for event ordering; retain `received_at` and `imported_at` for debugging clock skew and pipeline lag.
- Store `archive_blob_key` on every imported event row so any dashboard drilldown can be traced back to the immutable batch.
- Rollup counters should be additive only after the event id is first imported, not when a duplicate import is observed.
- Rollup writes should be transactional per archive or per bounded batch so partial imports are visible in `sidestream_telemetry_import_runs`.

## Retention Windows

Default retention for this single-operator model:

- Vercel Blob raw archives: retain for at least 400 days. This is the backfill and audit source.
- Neon recent raw events: retain 45 days for support timelines, recent search/download debugging, and dashboard drilldowns.
- Neon hourly rollups: retain 90 days.
- Neon daily rollups, install summaries, session summaries, and import run metadata: retain at least 400 days.

If storage or egress costs spike, prune Neon first. Do not prune Blob archives until the operator has deliberately accepted a shorter backfill window.

## Import Cadence And Manual Refresh

The default scheduled importer should run every 6 hours. That gives at most four automatic imports per day, which matches the expected operator behavior and keeps Neon compute cold most of the time.

Manual refresh should be available for troubleshooting, release checks, and dashboard startup. Manual refresh should:

- Import only Blob archives newer than the last successful checkpoint unless an explicit backfill range is requested.
- Be safe to run repeatedly because imports are idempotent by `telemetry_event_id`.
- Return counts for discovered archives, imported events, duplicates, rollups updated, and failures.
- Avoid becoming a polling loop; a dashboard can offer a refresh button, but it should not auto-refresh faster than the scheduled cadence unless the operator explicitly asks.

Expected staleness is scheduled-import delay plus dashboard cache time. This is acceptable. The system is for deliberate checks a few times per day, not live operational monitoring.

## Failure Behavior

Collector behavior:

- Invalid method: `405`.
- Invalid body: `400`.
- Body over `512 KB`: `413`.
- No accepted events: `202`.
- Telemetry disabled: `202` with `disabled: true`.
- Blob archive write failure: non-2xx, so the CEP queue retries.
- Successful Blob archive with accepted events: `200` with accepted/archived counts.

Importer behavior:

- Blob list/read failure: fail the run, keep the previous checkpoint, and record the error in import metadata if possible.
- Neon connection or write failure: fail the run after bounded retries; do not delete or mutate Blob archives.
- Partial run: record imported archive keys and counts; the next run must resume from the last fully imported archive or safely reprocess idempotently.
- Rollup failure after raw recent import: mark the import run as partial and re-run rollups from imported event ids or archive keys.
- Duplicate telemetry ids: count as already imported and do not increment rollups twice.

Dashboard behavior:

- Show last successful import time and import lag.
- Prefer stale cached summaries over uncapped raw scans when import is failing.
- Surface import failures separately from plugin upload failures so support triage does not blame the CEP queue for a backend importer issue.

## FlowState Analytics Dashboard Follow-Up Contract

Do not edit the FlowState repo from this website repo. The follow-up contract for FlowState is API-level:

- FlowState analytics should call guarded website endpoints backed by Neon summaries/recent tables.
- It should not receive Neon credentials, Blob tokens, legacy Supabase keys, or raw Blob URLs.
- It should not query Vercel Blob directly.
- It should show `lastImportedAt`, `sourceLagSeconds`, and the active retention windows so stale data is obvious.
- It should treat manual refresh as an explicit operator action and display importer output counts/errors.
- It should keep support-code/session timelines bounded by time window and result count.
- It should preserve current dashboard concepts: installs, native installer receipts, sessions, timelines, failures, update-check outcomes, support lookup, search/preview/download/import/settings/update/install/error event slices.

Potential website API surfaces for later steps:

- `POST /api/sidestream/telemetry/import` for a manual bounded import.
- Scheduled Vercel Cron calling the same importer implementation.
- `GET /api/sidestream/telemetry/summary?window=24h|7d|30d` for rollup-backed dashboard cards.
- `GET /api/sidestream/telemetry/timeline?support_code=...&window=...&limit=...` for bounded support triage.
- `GET /api/sidestream/telemetry/import-status` for latest import run, lag, and failure state.

Those names are a contract direction, not proof the endpoints exist yet.

## Implementation Notes For Follow-Up Steps

- Prefer a separate telemetry Blob token/env var from product download tokens if Vercel supports the store split cleanly.
- Use `SIDESTREAM_NEON_DATABASE_URL`, then `NEON_DATABASE_URL`, then `DATABASE_URL`/`POSTGRES_URL` only if it is the Neon connection. Keep the Neon pooled connection string or serverless driver only in API/importer code, never browser bundles.
- Treat Supabase REST as an explicitly gated legacy Supabase fallback only. Vercel Production may still contain `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, but their presence must not override the Neon-primary telemetry path.
- Once Blob-first ACK is live, database write failure should not block CEP acknowledgement unless the archive write also failed.
- `npm run build` must stay green after documentation or route changes.
- Any new README note should route future workers here instead of duplicating this full contract in the README.
