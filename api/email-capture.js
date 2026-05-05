const { Resend } = require('resend');
const Stripe = require('stripe');
const {
  OFFER_CODE,
  createOfferToken,
  hashEmail,
  isValidEmail,
  normalizeEmail,
} = require('../lib/first-visit-offer');
const {
  ensureVisitorIds,
  logEvent,
  readBody,
  safeJsonParse,
} = require('../lib/analytics-store');

const DEFAULT_AUDIENCE_NAME = 'alexg.mov first-visit offers';

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Email capture accepts POST only' });
  }

  const ids = ensureVisitorIds(req, res);
  let body;
  try {
    body = safeJsonParse(await readBody(req, 16 * 1024));
  } catch {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  const emailHash = hashEmail(email);

  try {
    const storage = await storeLead(email, body);
    const offerToken = createOfferToken(email);

    await logEvent({
      type: 'first_visit_offer_claimed',
      source: 'server',
      page: sanitize(body.page, 120),
      path: sanitize(body.path, 500),
      offerCode: OFFER_CODE,
      emailHash,
      leadStorage: storage.join(','),
      visitorId: ids.visitorId,
      sessionId: ids.sessionId,
      visitorHash: ids.visitorHash,
    });

    return res.status(202).json({
      ok: true,
      code: OFFER_CODE,
      offerToken,
      storage,
    });
  } catch (err) {
    console.error('Email capture failed:', err.message);
    await logEvent({
      type: 'first_visit_offer_capture_failed',
      source: 'server',
      page: sanitize(body.page, 120),
      path: sanitize(body.path, 500),
      offerCode: OFFER_CODE,
      emailHash,
      errorName: sanitize(err.name || 'error', 80),
      visitorId: ids.visitorId,
      sessionId: ids.sessionId,
      visitorHash: ids.visitorHash,
    });
    return res.status(502).json({ error: 'Could not save that email. Please try again.' });
  }
};

async function storeLead(email, body) {
  const storage = [];
  const errors = [];

  if (shouldAttemptResendContacts()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const audienceId = await resolveAudienceId(resend);
      await upsertContact(resend, audienceId, email);
      storage.push('resend');
    } catch (err) {
      errors.push(`Resend: ${err.message}`);
      console.error('Resend lead storage failed:', err.message);
    }
  }

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      await upsertStripeLead(email, body);
      storage.push('stripe_customer');
    } catch (err) {
      errors.push(`Stripe: ${err.message}`);
      console.error('Stripe lead storage failed:', err.message);
    }
  }

  if (!storage.length) {
    throw new Error(errors.join('; ') || 'No lead storage is configured');
  }

  return storage;
}

function shouldAttemptResendContacts() {
  return Boolean(
    process.env.RESEND_API_KEY &&
    (
      process.env.RESEND_CONTACTS_ENABLED === '1' ||
      process.env.RESEND_AUDIENCE_ID ||
      process.env.EMAIL_CAPTURE_AUDIENCE_ID ||
      process.env.RESEND_AUDIENCE_NAME
    )
  );
}

async function resolveAudienceId(resend) {
  const configured = process.env.RESEND_AUDIENCE_ID || process.env.EMAIL_CAPTURE_AUDIENCE_ID;
  if (configured) return configured;

  const name = process.env.RESEND_AUDIENCE_NAME || DEFAULT_AUDIENCE_NAME;
  const list = await resend.audiences.list();
  if (list.error) throw new Error(list.error.message || 'Could not list Resend audiences');

  const existing = (list.data?.data || []).find(audience => audience.name === name);
  if (existing?.id) return existing.id;

  const created = await resend.audiences.create({ name });
  if (created.error || !created.data?.id) {
    throw new Error(created.error?.message || 'Could not create Resend audience');
  }
  return created.data.id;
}

async function upsertContact(resend, audienceId, email) {
  const existing = await resend.contacts.get({ audienceId, email });
  if (existing.data?.id) {
    const updated = await resend.contacts.update({
      audienceId,
      email,
      unsubscribed: false,
    });
    if (updated.error) throw new Error(updated.error.message || 'Could not update Resend contact');
    return updated.data;
  }

  const created = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  });

  if (created.error) {
    const message = created.error.message || '';
    if (/already|exists|duplicate/i.test(message)) {
      const updated = await resend.contacts.update({
        audienceId,
        email,
        unsubscribed: false,
      });
      if (updated.error) throw new Error(updated.error.message || 'Could not update Resend contact');
      return updated.data;
    }
    throw new Error(message || 'Could not create Resend contact');
  }

  return created.data;
}

function sanitize(value, max) {
  return String(value || '').slice(0, max);
}

async function upsertStripeLead(email, body) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const metadata = {
    first_visit_offer: OFFER_CODE,
    first_visit_offer_claimed_at: new Date().toISOString(),
    first_visit_offer_page: sanitize(body.page, 80) || 'unknown',
  };
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data?.[0];

  if (customer?.id) {
    await stripe.customers.update(customer.id, { metadata });
    return customer;
  }

  return stripe.customers.create({
    email,
    description: 'alexg.mov first-visit offer lead',
    metadata,
  });
}
