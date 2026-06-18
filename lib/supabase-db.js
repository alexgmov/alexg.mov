const crypto = require('crypto');
const { Pool } = require('pg');

let pool;

function getDatabaseUrl() {
  return process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_POSTGRES_URL ||
    '';
}

function isDatabaseConfigured() {
  const url = getDatabaseUrl();
  return Boolean(url && !url.includes('[YOUR-PASSWORD]'));
}

function getSupabaseRestUrl() {
  return process.env.SUPABASE_URL ||
    process.env.SIDESTREAM_SUPABASE_URL ||
    '';
}

function getSupabaseRestSecretKey() {
  return process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
}

function isSupabaseRestConfigured() {
  const url = getSupabaseRestUrl();
  const key = getSupabaseRestSecretKey();
  return Boolean(
    url &&
    key &&
    !key.startsWith('sb_publishable_') &&
    !key.includes('[YOUR-')
  );
}

function shouldUseSsl(connectionString) {
  if (process.env.POSTGRES_SSL === '0') return false;
  if (/sslmode=(disable|false)/i.test(connectionString)) return false;
  return !/localhost|127\.0\.0\.1|::1/.test(connectionString);
}

function normalizeConnectionString(connectionString) {
  if (!connectionString) return '';
  try {
    const url = new URL(connectionString);
    if (/^(prefer|require)$/i.test(url.searchParams.get('sslmode') || '')) {
      url.searchParams.delete('sslmode');
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}

function getPool() {
  if (!isDatabaseConfigured()) return null;
  if (!pool) {
    const connectionString = normalizeConnectionString(getDatabaseUrl());
    pool = new Pool({
      connectionString,
      max: Number(process.env.POSTGRES_POOL_MAX || 3),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return String(value || '').split(',')[0].trim();
}

function safeJson(value) {
  return value && typeof value === 'object' ? value : {};
}

function unixIso(value) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function normalizeIso(value) {
  const timestamp = Date.parse(String(value || ''));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function hashSecret(value) {
  const secret = process.env.DOWNLOAD_SECRET || process.env.STRIPE_SECRET_KEY || 'alexg-mov-dev-db-salt';
  return crypto.createHmac('sha256', secret).update(String(value || '')).digest('hex');
}

function parseMaybeJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function supabaseRestErrorMessage(body, fallback) {
  if (!body || typeof body !== 'object') return fallback || 'Supabase REST request failed';
  return body.message || body.msg || body.error || body.code || fallback || 'Supabase REST request failed';
}

function isSupabaseSchemaCacheError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'PGRST204' ||
    error?.code === 'PGRST205' ||
    (
      message.includes('could not find') &&
      message.includes('schema cache')
    );
}

async function supabaseRestRequest(path, { method = 'GET', body, prefer } = {}) {
  const baseUrl = getSupabaseRestUrl().replace(/\/+$/, '');
  const secretKey = getSupabaseRestSecretKey();
  const headers = {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    accept: 'application/json',
    'content-type': 'application/json',
  };
  let response;
  let text;
  let parsed;

  if (prefer) {
    headers.prefer = prefer;
  }

  response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  text = await response.text();
  parsed = parseMaybeJson(text);

  if (!response.ok) {
    const error = new Error(supabaseRestErrorMessage(parsed, text || response.statusText));
    error.statusCode = response.status;
    error.code = parsed && parsed.code ? parsed.code : '';
    throw error;
  }

  return parsed;
}

function licenseKeyForSession(session, productId) {
  return `lic_${hashSecret(`${session?.id || 'session'}:${productId || 'product'}`).slice(0, 28)}`;
}

async function withClient(fn) {
  const db = getPool();
  if (!db) return { skipped: true };
  const client = await db.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

async function upsertCustomer(client, details = {}) {
  const email = normalizeEmail(details.email);
  if (!email) return null;

  const result = await client.query(`
    insert into public.customers (
      email,
      email_hash,
      stripe_customer_id,
      name,
      country,
      metadata,
      first_seen_at,
      last_seen_at
    )
    values ($1, $2, $3, $4, $5, $6::jsonb, now(), now())
    on conflict (email) do update set
      email_hash = coalesce(excluded.email_hash, public.customers.email_hash),
      stripe_customer_id = coalesce(excluded.stripe_customer_id, public.customers.stripe_customer_id),
      name = coalesce(excluded.name, public.customers.name),
      country = coalesce(excluded.country, public.customers.country),
      metadata = public.customers.metadata || excluded.metadata,
      last_seen_at = now()
    returning id
  `, [
    email,
    details.emailHash || null,
    details.stripeCustomerId || null,
    details.name || null,
    details.country || null,
    JSON.stringify(safeJson(details.metadata)),
  ]);

  return result.rows[0]?.id || null;
}

function customerDetailsFromSession(session = {}) {
  const details = session.customer_details || {};
  return {
    email: details.email || session.customer_email,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    name: details.name,
    country: details.address?.country,
    metadata: {
      stripeSessionId: session.id,
    },
  };
}

async function recordEmailLead({ email, emailHash, offerCode, page, path, ids, body, storageTargets }) {
  return withClient(async client => {
    await upsertCustomer(client, {
      email,
      emailHash,
      metadata: { source: 'first_visit_offer' },
    });

    await client.query(`
      insert into public.email_leads (
        email,
        email_hash,
        offer_code,
        source_page,
        source_path,
        visitor_id,
        session_id,
        visitor_hash,
        storage_targets,
        context,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10::jsonb, now(), now())
      on conflict (email) do update set
        email_hash = coalesce(excluded.email_hash, public.email_leads.email_hash),
        offer_code = excluded.offer_code,
        source_page = excluded.source_page,
        source_path = excluded.source_path,
        visitor_id = excluded.visitor_id,
        session_id = excluded.session_id,
        visitor_hash = excluded.visitor_hash,
        storage_targets = excluded.storage_targets,
        context = public.email_leads.context || excluded.context,
        updated_at = now()
    `, [
      normalizeEmail(email),
      emailHash || null,
      offerCode || null,
      String(page || '').slice(0, 120) || null,
      String(path || '').slice(0, 500) || null,
      ids?.visitorId || null,
      ids?.sessionId || null,
      ids?.visitorHash || null,
      storageTargets || [],
      JSON.stringify({
        userAgent: body?.userAgent,
        referrer: body?.referrer,
      }),
    ]);

    return { recorded: true };
  });
}

async function recordCheckoutSession(session, { productId, product, pricingVariant } = {}) {
  return withClient(async client => {
    const customerId = await upsertCustomer(client, customerDetailsFromSession(session));
    await client.query(`
      insert into public.checkout_sessions (
        stripe_session_id,
        stripe_customer_id,
        customer_id,
        product_id,
        product_name,
        pricing_variant,
        mode,
        session_status,
        payment_status,
        amount_total,
        amount_subtotal,
        currency,
        customer_email,
        customer_country,
        checkout_url,
        stripe_created_at,
        completed_at,
        expires_at,
        raw_session,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::timestamptz, $17::timestamptz, $18::timestamptz, $19::jsonb, now(), now())
      on conflict (stripe_session_id) do update set
        stripe_customer_id = coalesce(excluded.stripe_customer_id, public.checkout_sessions.stripe_customer_id),
        customer_id = coalesce(excluded.customer_id, public.checkout_sessions.customer_id),
        product_id = excluded.product_id,
        product_name = excluded.product_name,
        pricing_variant = coalesce(excluded.pricing_variant, public.checkout_sessions.pricing_variant),
        mode = excluded.mode,
        session_status = excluded.session_status,
        payment_status = excluded.payment_status,
        amount_total = excluded.amount_total,
        amount_subtotal = excluded.amount_subtotal,
        currency = excluded.currency,
        customer_email = coalesce(excluded.customer_email, public.checkout_sessions.customer_email),
        customer_country = coalesce(excluded.customer_country, public.checkout_sessions.customer_country),
        checkout_url = coalesce(excluded.checkout_url, public.checkout_sessions.checkout_url),
        stripe_created_at = coalesce(excluded.stripe_created_at, public.checkout_sessions.stripe_created_at),
        completed_at = coalesce(excluded.completed_at, public.checkout_sessions.completed_at),
        expires_at = coalesce(excluded.expires_at, public.checkout_sessions.expires_at),
        raw_session = excluded.raw_session,
        updated_at = now()
    `, [
      session.id,
      typeof session.customer === 'string' ? session.customer : null,
      customerId,
      productId || session.metadata?.productId || 'unknown',
      product?.name || null,
      pricingVariant || session.metadata?.pricingVariant || null,
      session.mode || null,
      session.status || null,
      session.payment_status || null,
      Number.isFinite(session.amount_total) ? session.amount_total : null,
      Number.isFinite(session.amount_subtotal) ? session.amount_subtotal : null,
      session.currency || null,
      normalizeEmail(session.customer_details?.email || session.customer_email) || null,
      session.customer_details?.address?.country || null,
      session.url || null,
      unixIso(session.created),
      session.status === 'complete' ? new Date().toISOString() : null,
      unixIso(session.expires_at),
      JSON.stringify(session || {}),
    ]);

    return { recorded: true };
  });
}

async function recordStripeEvent(event, session, processingStatus = 'received', errorMessage = null) {
  return withClient(async client => {
    const stripeSessionId = session?.id || event?.data?.object?.id || null;
    await client.query(`
      insert into public.stripe_events (
        stripe_event_id,
        type,
        livemode,
        api_version,
        stripe_created_at,
        stripe_session_id,
        processing_status,
        error_message,
        payload,
        received_at,
        processed_at
      )
      values ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9::jsonb, now(), case when $7 in ('processed', 'failed') then now() else null end)
      on conflict (stripe_event_id) do update set
        stripe_session_id = coalesce(excluded.stripe_session_id, public.stripe_events.stripe_session_id),
        processing_status = excluded.processing_status,
        error_message = excluded.error_message,
        payload = excluded.payload,
        processed_at = case when excluded.processing_status in ('processed', 'failed') then now() else public.stripe_events.processed_at end
    `, [
      event.id,
      event.type,
      Boolean(event.livemode),
      event.api_version || null,
      unixIso(event.created),
      stripeSessionId,
      processingStatus,
      errorMessage,
      JSON.stringify(event || {}),
    ]);

    return { recorded: true };
  });
}

async function recordFulfilledPurchase(session, { productId, product, email, downloadUrl, emailDeliveryId } = {}) {
  return withClient(async client => {
    await client.query('begin');
    try {
      const customerId = await upsertCustomer(client, {
        ...customerDetailsFromSession(session),
        email,
      });
      await recordCheckoutSessionWithClient(client, session, { productId, product });
      const purchase = await client.query(`
        insert into public.purchases (
          stripe_session_id,
          customer_id,
          product_id,
          product_name,
          amount_total,
          currency,
          payment_status,
          purchased_at,
          fulfilled_at,
          fulfillment_status,
          email_delivery_id,
          metadata
        )
        values ($1, $2, $3, $4, $5, $6, $7, coalesce($8::timestamptz, now()), now(), 'fulfilled', $9, $10::jsonb)
        on conflict (stripe_session_id) do update set
          customer_id = coalesce(excluded.customer_id, public.purchases.customer_id),
          product_id = excluded.product_id,
          product_name = excluded.product_name,
          amount_total = excluded.amount_total,
          currency = excluded.currency,
          payment_status = excluded.payment_status,
          fulfilled_at = now(),
          fulfillment_status = 'fulfilled',
          email_delivery_id = coalesce(excluded.email_delivery_id, public.purchases.email_delivery_id),
          metadata = public.purchases.metadata || excluded.metadata
        returning id
      `, [
        session.id,
        customerId,
        productId,
        product?.name || null,
        Number.isFinite(session.amount_total) ? session.amount_total : null,
        session.currency || null,
        session.payment_status || null,
        unixIso(session.created),
        emailDeliveryId || null,
        JSON.stringify({ stripeCustomerId: typeof session.customer === 'string' ? session.customer : null }),
      ]);
      const purchaseId = purchase.rows[0]?.id;

      await client.query(`
        insert into public.licenses (
          license_key,
          purchase_id,
          customer_id,
          product_id,
          stripe_session_id,
          status,
          metadata
        )
        values ($1, $2, $3, $4, $5, 'active', $6::jsonb)
        on conflict (stripe_session_id) do update set
          purchase_id = coalesce(excluded.purchase_id, public.licenses.purchase_id),
          customer_id = coalesce(excluded.customer_id, public.licenses.customer_id),
          product_id = excluded.product_id,
          status = 'active',
          metadata = public.licenses.metadata || excluded.metadata
      `, [
        licenseKeyForSession(session, productId),
        purchaseId,
        customerId,
        productId,
        session.id,
        JSON.stringify({ productName: product?.name || null }),
      ]);

      await client.query(`
        insert into public.download_links (
          purchase_id,
          customer_id,
          product_id,
          stripe_session_id,
          delivery_email,
          url_hash,
          expires_at,
          email_delivery_id,
          metadata
        )
        values ($1, $2, $3, $4, $5, $6, now() + interval '48 hours', $7, $8::jsonb)
      `, [
        purchaseId,
        customerId,
        productId,
        session.id,
        normalizeEmail(email),
        downloadUrl ? hashSecret(downloadUrl) : null,
        emailDeliveryId || null,
        JSON.stringify({ downloadFilename: product?.downloadFilename || null }),
      ]);

      await client.query('commit');
      return { recorded: true };
    } catch (err) {
      await client.query('rollback');
      throw err;
    }
  });
}

async function recordCheckoutSessionWithClient(client, session, details) {
  const customerId = await upsertCustomer(client, customerDetailsFromSession(session));
  await client.query(`
    insert into public.checkout_sessions (
      stripe_session_id,
      stripe_customer_id,
      customer_id,
      product_id,
      product_name,
      mode,
      session_status,
      payment_status,
      amount_total,
      amount_subtotal,
      currency,
      customer_email,
      customer_country,
      stripe_created_at,
      completed_at,
      expires_at,
      raw_session,
      created_at,
      updated_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::timestamptz, now(), $15::timestamptz, $16::jsonb, now(), now())
    on conflict (stripe_session_id) do update set
      stripe_customer_id = coalesce(excluded.stripe_customer_id, public.checkout_sessions.stripe_customer_id),
      customer_id = coalesce(excluded.customer_id, public.checkout_sessions.customer_id),
      product_id = excluded.product_id,
      product_name = excluded.product_name,
      mode = excluded.mode,
      session_status = excluded.session_status,
      payment_status = excluded.payment_status,
      amount_total = excluded.amount_total,
      amount_subtotal = excluded.amount_subtotal,
      currency = excluded.currency,
      customer_email = coalesce(excluded.customer_email, public.checkout_sessions.customer_email),
      customer_country = coalesce(excluded.customer_country, public.checkout_sessions.customer_country),
      stripe_created_at = coalesce(excluded.stripe_created_at, public.checkout_sessions.stripe_created_at),
      completed_at = now(),
      expires_at = coalesce(excluded.expires_at, public.checkout_sessions.expires_at),
      raw_session = excluded.raw_session,
      updated_at = now()
  `, [
    session.id,
    typeof session.customer === 'string' ? session.customer : null,
    customerId,
    details?.productId || session.metadata?.productId || 'unknown',
    details?.product?.name || null,
    session.mode || null,
    session.status || null,
    session.payment_status || null,
    Number.isFinite(session.amount_total) ? session.amount_total : null,
    Number.isFinite(session.amount_subtotal) ? session.amount_subtotal : null,
    session.currency || null,
    normalizeEmail(session.customer_details?.email || session.customer_email) || null,
    session.customer_details?.address?.country || null,
    unixIso(session.created),
    unixIso(session.expires_at),
    JSON.stringify(session || {}),
  ]);
}

async function recordDownloadEvent({ productId, status, httpStatus, exp, req, metadata }) {
  return withClient(async client => {
    const expiresAt = exp && /^\d+$/.test(String(exp))
      ? new Date(Number(exp)).toISOString()
      : null;
    await client.query(`
      insert into public.download_events (
        product_id,
        status,
        http_status,
        link_expires_at,
        user_agent,
        referer,
        metadata
      )
      values ($1, $2, $3, $4::timestamptz, $5, $6, $7::jsonb)
    `, [
      productId || null,
      status,
      httpStatus || null,
      expiresAt,
      req?.headers?.['user-agent'] || null,
      req?.headers?.referer || req?.headers?.referrer || null,
      JSON.stringify(safeJson(metadata)),
    ]);
    return { recorded: true };
  });
}

function telemetryEventTime(event) {
  return normalizeIso(event?.occurred_at) || new Date().toISOString();
}

function telemetryRuntimeSummary(event) {
  const runtime = safeJson(safeJson(event?.data_points).runtime);
  return {
    osPlatform: runtime.osPlatform || null,
    osArch: runtime.osArch || null,
    osRelease: runtime.osRelease || null,
    nodeVersion: runtime.nodeVersion || null,
    cpuCount: runtime.cpuCount || null,
    totalMemoryGb: runtime.totalMemoryGb || null,
  };
}

function telemetryLatestContext(event) {
  const payload = safeJson(event?.payload);
  return {
    eventName: event?.event_name || null,
    category: event?.event_category || null,
    severity: event?.severity || null,
    errorClass: event?.error_class || null,
    actionName: event?.action_name || null,
    localEvent: payload.local_event || null,
    localScope: payload.local_scope || null,
    schemaVersion: event?.schema_version || null,
    payloadRedactionVersion: event?.payload_redaction_version || null,
  };
}

function telemetryCounters(event) {
  const severity = String(event?.severity || event?.event_level || '').toLowerCase();
  const eventName = String(event?.event_name || '').toLowerCase();

  return {
    eventCount: 1,
    errorCount: severity === 'error' ? 1 : 0,
    warningCount: severity === 'warning' || severity === 'warn' ? 1 : 0,
    downloadCount: eventName === 'download_requested' ? 1 : 0,
    failedDownloadCount: eventName === 'download_failed' ? 1 : 0,
  };
}

function minIso(left, right) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function maxIso(left, right) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function shouldUseTelemetryEvent(existingTime, nextTime) {
  if (!existingTime) return true;
  if (!nextTime) return false;
  return Date.parse(nextTime) >= Date.parse(existingTime);
}

function withoutUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}

function telemetryRequestContext(req) {
  return {
    ipHash: hashSecret(firstHeaderValue(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '')),
    origin: firstHeaderValue(req?.headers?.origin || ''),
  };
}

function buildSidestreamTelemetryRestRow(event, req, endpointVersion, richColumns = true) {
  const row = {
    telemetry_event_id: String(event.id).slice(0, 120),
    install_id_hash: event.install_id_hash ? String(event.install_id_hash).slice(0, 128) : null,
    session_id: event.session_id ? String(event.session_id).slice(0, 128) : null,
    sequence: Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : null,
    event_name: String(event.event_name).slice(0, 120),
    event_scope: event.event_scope ? String(event.event_scope).slice(0, 80) : null,
    event_level: event.event_level ? String(event.event_level).slice(0, 40) : null,
    occurred_at: telemetryEventTime(event),
    app_name: event.app_name ? String(event.app_name).slice(0, 80) : null,
    app_version: event.app_version ? String(event.app_version).slice(0, 40) : null,
    build_channel: event.build_channel ? String(event.build_channel).slice(0, 40) : null,
    schema_version: event.schema_version ? String(event.schema_version).slice(0, 40) : null,
    consent_state: event.consent_state ? String(event.consent_state).slice(0, 120) : null,
    endpoint_version: endpointVersion,
    user_agent_hash: hashSecret(firstHeaderValue(req?.headers?.['user-agent'] || '')),
    payload: safeJson(event.payload),
    data_points: safeJson(event.data_points),
    request_context: telemetryRequestContext(req),
  };

  if (!richColumns) {
    return row;
  }

  return withoutUndefined({
    ...row,
    support_code: event.support_code ? String(event.support_code).slice(0, 40) : null,
    event_category: event.event_category ? String(event.event_category).slice(0, 40) : null,
    severity: event.severity ? String(event.severity).slice(0, 20) : null,
    error_class: event.error_class ? String(event.error_class).slice(0, 80) : null,
    action_name: event.action_name ? String(event.action_name).slice(0, 120) : null,
    batch_id: event.batch_id ? String(event.batch_id).slice(0, 120) : null,
    payload_redaction_version: event.payload_redaction_version ? String(event.payload_redaction_version).slice(0, 40) : null,
    consent_state_payload: safeJson(event.consent_state_payload),
  });
}

async function insertSidestreamTelemetryRestRow(row) {
  const inserted = await supabaseRestRequest(
    'sidestream_telemetry_events?on_conflict=telemetry_event_id&select=telemetry_event_id',
    {
      method: 'POST',
      body: row,
      prefer: 'resolution=ignore-duplicates,return=representation',
    }
  );
  if (Array.isArray(inserted) && inserted.length) {
    return { acknowledged: inserted.length, inserted: true };
  }

  if (row?.telemetry_event_id) {
    const existing = await readSidestreamRestRow(
      'sidestream_telemetry_events',
      'telemetry_event_id',
      String(row.telemetry_event_id).slice(0, 120),
      'telemetry_event_id'
    );
    if (existing?.telemetry_event_id) {
      return { acknowledged: 1, inserted: false };
    }
  }

  return { acknowledged: 0, inserted: false };
}

async function readSidestreamRestRow(tableName, keyName, keyValue, select) {
  const rows = await supabaseRestRequest(
    `${tableName}?${keyName}=eq.${encodeURIComponent(keyValue)}&select=${select}&limit=1`
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function upsertSidestreamInstallRest(event, eventTime) {
  if (!event.install_id_hash) return;

  const existing = await readSidestreamRestRow(
    'sidestream_installs',
    'install_id_hash',
    String(event.install_id_hash).slice(0, 128),
    'install_id_hash,first_seen_at,last_seen_at,event_count,error_count,warning_count,download_count,failed_download_count'
  );
  const runtime = telemetryRuntimeSummary(event);
  const counters = telemetryCounters(event);
  const latestContext = telemetryLatestContext(event);
  const useLatest = shouldUseTelemetryEvent(existing?.last_seen_at, eventTime);
  const row = {
    install_id_hash: String(event.install_id_hash).slice(0, 128),
    support_code: event.support_code ? String(event.support_code).slice(0, 40) : null,
    first_seen_at: minIso(existing?.first_seen_at, eventTime),
    last_seen_at: maxIso(existing?.last_seen_at, eventTime),
    last_session_id: useLatest && event.session_id ? String(event.session_id).slice(0, 128) : undefined,
    app_name: useLatest && event.app_name ? String(event.app_name).slice(0, 80) : undefined,
    app_version: useLatest && event.app_version ? String(event.app_version).slice(0, 40) : undefined,
    build_channel: useLatest && event.build_channel ? String(event.build_channel).slice(0, 40) : undefined,
    schema_version: useLatest && event.schema_version ? String(event.schema_version).slice(0, 40) : undefined,
    consent_state: useLatest && event.consent_state ? String(event.consent_state).slice(0, 120) : undefined,
    consent_state_payload: useLatest ? safeJson(event.consent_state_payload) : undefined,
    os_platform: useLatest ? runtime.osPlatform : undefined,
    os_arch: useLatest ? runtime.osArch : undefined,
    node_version: useLatest ? runtime.nodeVersion : undefined,
    latest_event_name: useLatest && event.event_name ? String(event.event_name).slice(0, 120) : undefined,
    latest_event_category: useLatest && event.event_category ? String(event.event_category).slice(0, 40) : undefined,
    latest_severity: useLatest && event.severity ? String(event.severity).slice(0, 20) : undefined,
    latest_error_class: useLatest && event.error_class ? String(event.error_class).slice(0, 80) : undefined,
    latest_action_name: useLatest && event.action_name ? String(event.action_name).slice(0, 120) : undefined,
    latest_runtime: useLatest ? runtime : undefined,
    latest_context: useLatest ? latestContext : undefined,
    event_count: Number(existing?.event_count || 0) + counters.eventCount,
    error_count: Number(existing?.error_count || 0) + counters.errorCount,
    warning_count: Number(existing?.warning_count || 0) + counters.warningCount,
    download_count: Number(existing?.download_count || 0) + counters.downloadCount,
    failed_download_count: Number(existing?.failed_download_count || 0) + counters.failedDownloadCount,
    updated_at: new Date().toISOString(),
  };

  await supabaseRestRequest(
    'sidestream_installs?on_conflict=install_id_hash',
    {
      method: 'POST',
      body: withoutUndefined(row),
      prefer: 'resolution=merge-duplicates,return=minimal',
    }
  );
}

async function upsertSidestreamSessionRest(event, eventTime) {
  if (!event.session_id) return;

  const existing = await readSidestreamRestRow(
    'sidestream_sessions',
    'session_id',
    String(event.session_id).slice(0, 128),
    'session_id,started_at,last_seen_at,event_count,error_count,warning_count'
  );
  const runtime = telemetryRuntimeSummary(event);
  const counters = telemetryCounters(event);
  const latestContext = telemetryLatestContext(event);
  const useLatest = shouldUseTelemetryEvent(existing?.last_seen_at, eventTime);
  const row = {
    session_id: String(event.session_id).slice(0, 128),
    install_id_hash: event.install_id_hash ? String(event.install_id_hash).slice(0, 128) : null,
    support_code: event.support_code ? String(event.support_code).slice(0, 40) : null,
    started_at: minIso(existing?.started_at, eventTime),
    last_seen_at: maxIso(existing?.last_seen_at, eventTime),
    app_name: useLatest && event.app_name ? String(event.app_name).slice(0, 80) : undefined,
    app_version: useLatest && event.app_version ? String(event.app_version).slice(0, 40) : undefined,
    build_channel: useLatest && event.build_channel ? String(event.build_channel).slice(0, 40) : undefined,
    schema_version: useLatest && event.schema_version ? String(event.schema_version).slice(0, 40) : undefined,
    os_platform: useLatest ? runtime.osPlatform : undefined,
    os_arch: useLatest ? runtime.osArch : undefined,
    node_version: useLatest ? runtime.nodeVersion : undefined,
    event_count: Number(existing?.event_count || 0) + counters.eventCount,
    error_count: Number(existing?.error_count || 0) + counters.errorCount,
    warning_count: Number(existing?.warning_count || 0) + counters.warningCount,
    latest_event_name: useLatest && event.event_name ? String(event.event_name).slice(0, 120) : undefined,
    latest_event_category: useLatest && event.event_category ? String(event.event_category).slice(0, 40) : undefined,
    latest_severity: useLatest && event.severity ? String(event.severity).slice(0, 20) : undefined,
    latest_error_class: useLatest && event.error_class ? String(event.error_class).slice(0, 80) : undefined,
    latest_action_name: useLatest && event.action_name ? String(event.action_name).slice(0, 120) : undefined,
    latest_context: useLatest ? latestContext : undefined,
    updated_at: new Date().toISOString(),
  };

  await supabaseRestRequest(
    'sidestream_sessions?on_conflict=session_id',
    {
      method: 'POST',
      body: withoutUndefined(row),
      prefer: 'resolution=merge-duplicates,return=minimal',
    }
  );
}

async function recordPluginTelemetryBatchViaSupabaseRest({ events, req, endpointVersion }) {
  const normalizedEvents = Array.isArray(events) ? events.slice(0, 100) : [];
  let recorded = 0;
  let legacySchema = false;
  let rollupsSkipped = false;

  for (const event of normalizedEvents) {
    let insertResult = { acknowledged: 0, inserted: false };
    let eventTime;

    if (!event || typeof event !== 'object' || !event.id || !event.event_name) {
      continue;
    }

    eventTime = telemetryEventTime(event);

    try {
      insertResult = await insertSidestreamTelemetryRestRow(
        buildSidestreamTelemetryRestRow(event, req, endpointVersion, true)
      );
    } catch (err) {
      if (!isSupabaseSchemaCacheError(err)) {
        throw err;
      }
      legacySchema = true;
      insertResult = await insertSidestreamTelemetryRestRow(
        buildSidestreamTelemetryRestRow(event, req, endpointVersion, false)
      );
    }

    if (!insertResult.acknowledged) {
      continue;
    }

    recorded += insertResult.acknowledged;

    if (!insertResult.inserted) {
      continue;
    }

    if (legacySchema) {
      rollupsSkipped = true;
      continue;
    }

    try {
      await upsertSidestreamInstallRest(event, eventTime);
      await upsertSidestreamSessionRest(event, eventTime);
    } catch (err) {
      if (!isSupabaseSchemaCacheError(err)) {
        console.error('[supabase] sidestream telemetry rollup failed:', err.message);
      }
      rollupsSkipped = true;
    }
  }

  return {
    recorded,
    collector: 'supabase-rest',
    legacySchema,
    rollupsSkipped,
  };
}

async function upsertSidestreamInstall(client, event, eventTime) {
  if (!event.install_id_hash) return;

  const runtime = telemetryRuntimeSummary(event);
  const counters = telemetryCounters(event);
  const latestContext = telemetryLatestContext(event);

  await client.query(`
    insert into public.sidestream_installs (
      install_id_hash,
      support_code,
      first_seen_at,
      last_seen_at,
      last_session_id,
      app_name,
      app_version,
      build_channel,
      schema_version,
      consent_state,
      consent_state_payload,
      os_platform,
      os_arch,
      node_version,
      latest_event_name,
      latest_event_category,
      latest_severity,
      latest_error_class,
      latest_action_name,
      latest_runtime,
      latest_context,
      event_count,
      error_count,
      warning_count,
      download_count,
      failed_download_count,
      updated_at
    )
    values ($1, $2, $3::timestamptz, $3::timestamptz, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20::jsonb, $21, $22, $23, $24, $25, now())
    on conflict (install_id_hash) do update set
      support_code = coalesce(public.sidestream_installs.support_code, excluded.support_code),
      first_seen_at = least(public.sidestream_installs.first_seen_at, excluded.first_seen_at),
      last_seen_at = greatest(public.sidestream_installs.last_seen_at, excluded.last_seen_at),
      last_session_id = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.last_session_id else public.sidestream_installs.last_session_id end,
      app_name = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.app_name else public.sidestream_installs.app_name end,
      app_version = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.app_version else public.sidestream_installs.app_version end,
      build_channel = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.build_channel else public.sidestream_installs.build_channel end,
      schema_version = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.schema_version else public.sidestream_installs.schema_version end,
      consent_state = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.consent_state else public.sidestream_installs.consent_state end,
      consent_state_payload = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.consent_state_payload else public.sidestream_installs.consent_state_payload end,
      os_platform = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.os_platform else public.sidestream_installs.os_platform end,
      os_arch = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.os_arch else public.sidestream_installs.os_arch end,
      node_version = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.node_version else public.sidestream_installs.node_version end,
      latest_event_name = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_event_name else public.sidestream_installs.latest_event_name end,
      latest_event_category = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_event_category else public.sidestream_installs.latest_event_category end,
      latest_severity = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_severity else public.sidestream_installs.latest_severity end,
      latest_error_class = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_error_class else public.sidestream_installs.latest_error_class end,
      latest_action_name = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_action_name else public.sidestream_installs.latest_action_name end,
      latest_runtime = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_runtime else public.sidestream_installs.latest_runtime end,
      latest_context = case when excluded.last_seen_at >= public.sidestream_installs.last_seen_at then excluded.latest_context else public.sidestream_installs.latest_context end,
      event_count = public.sidestream_installs.event_count + excluded.event_count,
      error_count = public.sidestream_installs.error_count + excluded.error_count,
      warning_count = public.sidestream_installs.warning_count + excluded.warning_count,
      download_count = public.sidestream_installs.download_count + excluded.download_count,
      failed_download_count = public.sidestream_installs.failed_download_count + excluded.failed_download_count,
      updated_at = now()
  `, [
    String(event.install_id_hash).slice(0, 128),
    event.support_code ? String(event.support_code).slice(0, 40) : null,
    eventTime,
    event.session_id ? String(event.session_id).slice(0, 128) : null,
    event.app_name ? String(event.app_name).slice(0, 80) : null,
    event.app_version ? String(event.app_version).slice(0, 40) : null,
    event.build_channel ? String(event.build_channel).slice(0, 40) : null,
    event.schema_version ? String(event.schema_version).slice(0, 40) : null,
    event.consent_state ? String(event.consent_state).slice(0, 120) : null,
    JSON.stringify(safeJson(event.consent_state_payload)),
    runtime.osPlatform,
    runtime.osArch,
    runtime.nodeVersion,
    event.event_name ? String(event.event_name).slice(0, 120) : null,
    event.event_category ? String(event.event_category).slice(0, 40) : null,
    event.severity ? String(event.severity).slice(0, 20) : null,
    event.error_class ? String(event.error_class).slice(0, 80) : null,
    event.action_name ? String(event.action_name).slice(0, 120) : null,
    JSON.stringify(runtime),
    JSON.stringify(latestContext),
    counters.eventCount,
    counters.errorCount,
    counters.warningCount,
    counters.downloadCount,
    counters.failedDownloadCount,
  ]);
}

async function upsertSidestreamSession(client, event, eventTime) {
  if (!event.session_id) return;

  const runtime = telemetryRuntimeSummary(event);
  const counters = telemetryCounters(event);
  const latestContext = telemetryLatestContext(event);

  await client.query(`
    insert into public.sidestream_sessions (
      session_id,
      install_id_hash,
      support_code,
      started_at,
      last_seen_at,
      app_name,
      app_version,
      build_channel,
      schema_version,
      os_platform,
      os_arch,
      node_version,
      event_count,
      error_count,
      warning_count,
      latest_event_name,
      latest_event_category,
      latest_severity,
      latest_error_class,
      latest_action_name,
      latest_context,
      updated_at
    )
    values ($1, $2, $3, $4::timestamptz, $4::timestamptz, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb, now())
    on conflict (session_id) do update set
      install_id_hash = coalesce(public.sidestream_sessions.install_id_hash, excluded.install_id_hash),
      support_code = coalesce(public.sidestream_sessions.support_code, excluded.support_code),
      started_at = least(public.sidestream_sessions.started_at, excluded.started_at),
      last_seen_at = greatest(public.sidestream_sessions.last_seen_at, excluded.last_seen_at),
      app_name = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.app_name else public.sidestream_sessions.app_name end,
      app_version = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.app_version else public.sidestream_sessions.app_version end,
      build_channel = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.build_channel else public.sidestream_sessions.build_channel end,
      schema_version = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.schema_version else public.sidestream_sessions.schema_version end,
      os_platform = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.os_platform else public.sidestream_sessions.os_platform end,
      os_arch = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.os_arch else public.sidestream_sessions.os_arch end,
      node_version = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.node_version else public.sidestream_sessions.node_version end,
      event_count = public.sidestream_sessions.event_count + excluded.event_count,
      error_count = public.sidestream_sessions.error_count + excluded.error_count,
      warning_count = public.sidestream_sessions.warning_count + excluded.warning_count,
      latest_event_name = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_event_name else public.sidestream_sessions.latest_event_name end,
      latest_event_category = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_event_category else public.sidestream_sessions.latest_event_category end,
      latest_severity = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_severity else public.sidestream_sessions.latest_severity end,
      latest_error_class = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_error_class else public.sidestream_sessions.latest_error_class end,
      latest_action_name = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_action_name else public.sidestream_sessions.latest_action_name end,
      latest_context = case when excluded.last_seen_at >= public.sidestream_sessions.last_seen_at then excluded.latest_context else public.sidestream_sessions.latest_context end,
      updated_at = now()
  `, [
    String(event.session_id).slice(0, 128),
    event.install_id_hash ? String(event.install_id_hash).slice(0, 128) : null,
    event.support_code ? String(event.support_code).slice(0, 40) : null,
    eventTime,
    event.app_name ? String(event.app_name).slice(0, 80) : null,
    event.app_version ? String(event.app_version).slice(0, 40) : null,
    event.build_channel ? String(event.build_channel).slice(0, 40) : null,
    event.schema_version ? String(event.schema_version).slice(0, 40) : null,
    runtime.osPlatform,
    runtime.osArch,
    runtime.nodeVersion,
    counters.eventCount,
    counters.errorCount,
    counters.warningCount,
    event.event_name ? String(event.event_name).slice(0, 120) : null,
    event.event_category ? String(event.event_category).slice(0, 40) : null,
    event.severity ? String(event.severity).slice(0, 20) : null,
    event.error_class ? String(event.error_class).slice(0, 80) : null,
    event.action_name ? String(event.action_name).slice(0, 120) : null,
    JSON.stringify(latestContext),
  ]);
}

async function recordPluginTelemetryBatchViaPostgres({ events, req, endpointVersion = '2026-06-12.1' }) {
  const normalizedEvents = Array.isArray(events) ? events.slice(0, 100) : [];
  if (!normalizedEvents.length) return { recorded: 0 };

  return withClient(async client => {
    let recorded = 0;
    await client.query('begin');
    try {
      for (const event of normalizedEvents) {
        if (!event || typeof event !== 'object' || !event.id || !event.event_name) {
          continue;
        }

        const eventTime = telemetryEventTime(event);
        const insert = await client.query(`
          insert into public.sidestream_telemetry_events (
            telemetry_event_id,
            install_id_hash,
            support_code,
            session_id,
            sequence,
            event_name,
            event_category,
            event_scope,
            event_level,
            severity,
            error_class,
            action_name,
            batch_id,
            occurred_at,
            app_name,
            app_version,
            build_channel,
            schema_version,
            payload_redaction_version,
            consent_state,
            consent_state_payload,
            endpoint_version,
            user_agent_hash,
            payload,
            data_points,
            request_context
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::timestamptz, $15, $16, $17, $18, $19, $20, $21::jsonb, $22, $23, $24::jsonb, $25::jsonb, $26::jsonb)
          on conflict (telemetry_event_id) do nothing
        `, [
          String(event.id).slice(0, 120),
          event.install_id_hash ? String(event.install_id_hash).slice(0, 128) : null,
          event.support_code ? String(event.support_code).slice(0, 40) : null,
          event.session_id ? String(event.session_id).slice(0, 128) : null,
          Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : null,
          String(event.event_name).slice(0, 120),
          event.event_category ? String(event.event_category).slice(0, 40) : null,
          event.event_scope ? String(event.event_scope).slice(0, 80) : null,
          event.event_level ? String(event.event_level).slice(0, 40) : null,
          event.severity ? String(event.severity).slice(0, 20) : null,
          event.error_class ? String(event.error_class).slice(0, 80) : null,
          event.action_name ? String(event.action_name).slice(0, 120) : null,
          event.batch_id ? String(event.batch_id).slice(0, 120) : null,
          eventTime,
          event.app_name ? String(event.app_name).slice(0, 80) : null,
          event.app_version ? String(event.app_version).slice(0, 40) : null,
          event.build_channel ? String(event.build_channel).slice(0, 40) : null,
          event.schema_version ? String(event.schema_version).slice(0, 40) : null,
          event.payload_redaction_version ? String(event.payload_redaction_version).slice(0, 40) : null,
          event.consent_state ? String(event.consent_state).slice(0, 120) : null,
          JSON.stringify(safeJson(event.consent_state_payload)),
          endpointVersion,
          hashSecret(firstHeaderValue(req?.headers?.['user-agent'] || '')),
          JSON.stringify(safeJson(event.payload)),
          JSON.stringify(safeJson(event.data_points)),
          JSON.stringify({
            ipHash: hashSecret(firstHeaderValue(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '')),
            origin: firstHeaderValue(req?.headers?.origin || ''),
          }),
        ]);
        let acknowledged = insert.rowCount || 0;
        if (!acknowledged) {
          const existing = await client.query(
            'select telemetry_event_id from public.sidestream_telemetry_events where telemetry_event_id = $1 limit 1',
            [String(event.id).slice(0, 120)]
          );
          acknowledged = existing.rowCount ? 1 : 0;
        }

        if (acknowledged) {
          recorded += acknowledged;
        }

        if (insert.rowCount) {
          await upsertSidestreamInstall(client, event, eventTime);
          await upsertSidestreamSession(client, event, eventTime);
        }
      }
      await client.query('commit');
      return { recorded, collector: 'postgres' };
    } catch (err) {
      await client.query('rollback');
      throw err;
    }
  });
}

async function recordPluginTelemetryBatch({ events, req, endpointVersion = '2026-06-12.1' }) {
  if (isSupabaseRestConfigured()) {
    return recordPluginTelemetryBatchViaSupabaseRest({ events, req, endpointVersion });
  }

  if (!isDatabaseConfigured()) {
    return { skipped: true, recorded: 0 };
  }

  return recordPluginTelemetryBatchViaPostgres({ events, req, endpointVersion });
}

async function tryRecord(label, fn) {
  if (!isDatabaseConfigured()) return { skipped: true };
  try {
    return await fn();
  } catch (err) {
    console.error(`[supabase] ${label} failed:`, err.message);
    return { error: err.message };
  }
}

module.exports = {
  isDatabaseConfigured,
  isSupabaseRestConfigured,
  recordCheckoutSession,
  recordDownloadEvent,
  recordEmailLead,
  recordFulfilledPurchase,
  recordPluginTelemetryBatch,
  recordStripeEvent,
  tryRecord,
};
