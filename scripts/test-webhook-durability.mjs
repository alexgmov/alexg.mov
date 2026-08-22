import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createWebhookHandler } = require('../api/webhook');

const event = Object.freeze({
  id: 'evt_test_cutover',
  type: 'checkout.session.completed',
  created: 1_787_372_800,
  data: {
    object: {
      id: 'cs_test_cutover',
      status: 'complete',
      payment_status: 'paid',
      amount_total: 0,
      currency: 'usd',
      metadata: { productId: 'sidestream' },
      customer_details: { email: 'buyer@example.com' },
    },
  },
});
const product = Object.freeze({
  name: 'Sidestream',
  blobUrl: 'https://example.invalid/sidestream.dmg',
  downloadFilename: 'Sidestream.dmg',
});

test.before(() => {
  process.env.STRIPE_SECRET_KEY = 'stripe-test-secret';
  process.env.STRIPE_WEBHOOK_SECRET = 'webhook-test-secret';
  process.env.RESEND_API_KEY = 'resend-test-secret';
});

test('the webhook acknowledges only after durable fulfillment and uses provider idempotency', async () => {
  const calls = [];
  const handler = createWebhookHandler(dependencies({
    resendSend: async (...args) => {
      calls.push(args);
      return { data: { id: 'email_test_1' } };
    },
  }));
  const response = await invoke(handler);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.received, true);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0][1].idempotencyKey,
    'stripe-checkout-fulfillment-cs_test_cutover',
  );
});

test('missing database persistence returns a retryable non-success acknowledgement', async () => {
  let emailCalls = 0;
  const handler = createWebhookHandler(dependencies({
    recordCheckoutSession: async () => ({ skipped: true }),
    resendSend: async () => {
      emailCalls += 1;
      return { data: { id: 'unexpected' } };
    },
  }));
  const response = await invoke(handler);

  assert.equal(response.statusCode, 503);
  assert.equal(response.payload.retryable, true);
  assert.equal(emailCalls, 0);
});

test('failed email or fulfillment persistence returns 503 so Stripe retries', async () => {
  const statuses = [];
  const handler = createWebhookHandler(dependencies({
    resendSend: async () => ({ error: { message: 'temporary provider failure' } }),
    recordStripeEvent: async (_event, _session, status = 'received') => {
      statuses.push(status);
      return { recorded: true };
    },
  }));
  const response = await invoke(handler);

  assert.equal(response.statusCode, 503);
  assert.equal(response.payload.retryable, true);
  assert.deepEqual(statuses, ['received', 'failed']);
});

test('an already fulfilled Checkout Session does not send another email', async () => {
  let emailCalls = 0;
  const handler = createWebhookHandler(dependencies({
    isCheckoutSessionFulfilled: async () => ({ fulfilled: true }),
    resendSend: async () => {
      emailCalls += 1;
      return { data: { id: 'unexpected' } };
    },
  }));
  const response = await invoke(handler);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.duplicate, true);
  assert.equal(emailCalls, 0);
});

function dependencies(overrides = {}) {
  class StripeMock {
    constructor() {
      this.webhooks = { constructEvent: () => event };
    }
  }
  class ResendMock {
    constructor() {
      this.emails = { send: overrides.resendSend || (async () => ({ data: { id: 'email' } })) };
    }
  }
  return {
    Stripe: StripeMock,
    Resend: ResendMock,
    PRODUCTS: { sidestream: product },
    makeLink: () => 'https://alexg.mov/api/download',
    logEvent: async () => {},
    recordCheckoutSession: overrides.recordCheckoutSession || (async () => ({ recorded: true })),
    recordStripeEvent: overrides.recordStripeEvent || (async () => ({ recorded: true })),
    recordFulfilledPurchase: overrides.recordFulfilledPurchase || (async () => ({ recorded: true })),
    isCheckoutSessionFulfilled:
      overrides.isCheckoutSessionFulfilled || (async () => ({ fulfilled: false })),
  };
}

async function invoke(handler) {
  const response = {
    statusCode: 200,
    payload: null,
    headers: {},
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { return this; },
  };
  await handler({
    method: 'POST',
    body: Buffer.from('{}'),
    headers: {
      host: 'alexg.mov',
      'stripe-signature': 'test-signature',
    },
  }, response);
  return response;
}
