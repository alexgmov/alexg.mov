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

async function recordPluginTelemetryBatch({ events, req, endpointVersion = '2026-05-21.1' }) {
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

        const insert = await client.query(`
          insert into public.sidestream_telemetry_events (
            telemetry_event_id,
            install_id_hash,
            session_id,
            sequence,
            event_name,
            event_scope,
            event_level,
            occurred_at,
            app_name,
            app_version,
            build_channel,
            schema_version,
            consent_state,
            endpoint_version,
            user_agent_hash,
            payload,
            data_points,
            request_context
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, $18::jsonb)
          on conflict (telemetry_event_id) do nothing
        `, [
          String(event.id).slice(0, 120),
          event.install_id_hash ? String(event.install_id_hash).slice(0, 128) : null,
          event.session_id ? String(event.session_id).slice(0, 128) : null,
          Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : null,
          String(event.event_name).slice(0, 120),
          event.event_scope ? String(event.event_scope).slice(0, 80) : null,
          event.event_level ? String(event.event_level).slice(0, 40) : null,
          normalizeIso(event.occurred_at),
          event.app_name ? String(event.app_name).slice(0, 80) : null,
          event.app_version ? String(event.app_version).slice(0, 40) : null,
          event.build_channel ? String(event.build_channel).slice(0, 40) : null,
          event.schema_version ? String(event.schema_version).slice(0, 40) : null,
          event.consent_state ? String(event.consent_state).slice(0, 40) : null,
          endpointVersion,
          hashSecret(firstHeaderValue(req?.headers?.['user-agent'] || '')),
          JSON.stringify(safeJson(event.payload)),
          JSON.stringify(safeJson(event.data_points)),
          JSON.stringify({
            ipHash: hashSecret(firstHeaderValue(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '')),
            origin: firstHeaderValue(req?.headers?.origin || ''),
          }),
        ]);
        recorded += insert.rowCount || 0;
      }
      await client.query('commit');
      return { recorded };
    } catch (err) {
      await client.query('rollback');
      throw err;
    }
  });
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
  recordCheckoutSession,
  recordDownloadEvent,
  recordEmailLead,
  recordFulfilledPurchase,
  recordPluginTelemetryBatch,
  recordStripeEvent,
  tryRecord,
};
