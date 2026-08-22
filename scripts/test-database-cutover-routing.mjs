import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../middleware.ts', import.meta.url), 'utf8');
const helper = `
  export function next(init = {}) {
    const response = new Response(null, { headers: { "x-test-next": "1" } });
    for (const [name, value] of init.request?.headers || []) response.headers.set("x-request-" + name, value);
    return response;
  }
  export function rewrite(url, init = {}) {
    const response = new Response(null, { headers: { "x-test-rewrite": String(url) } });
    for (const [name, value] of init.request?.headers || []) response.headers.set("x-request-" + name, value);
    return response;
  }
`;
const helperUrl = `data:text/javascript;base64,${Buffer.from(helper).toString('base64')}`;
const middleware = await import(`data:text/javascript;base64,${Buffer.from(
  source.replace('from "@vercel/functions"', `from "${helperUrl}"`)
).toString('base64')}`);

const request = (path = '/api/plugin-telemetry', headers = {}) =>
  new Request(`https://alexg.mov${path}`, { headers });

test('source mode keeps Vercel authoritative and removes forged origin credentials', () => {
  const response = middleware.routeDatabaseApiForTest(request('/api/webhook', {
    'x-sidestream-origin-auth': 'forged',
  }), { mode: 'source' });
  assert.equal(response.headers.get('x-test-next'), '1');
  assert.equal(response.headers.get('x-request-x-sidestream-origin-auth'), null);
});

test('fenced and invalid modes return a retryable no-store 503', async () => {
  for (const mode of ['fenced', 'invalid']) {
    const response = middleware.routeDatabaseApiForTest(request(), { mode });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('retry-after'), '60');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal((await response.json()).code, 'database_cutover_in_progress');
  }
});

test('target mode keeps the origin prefix, path, query, and protected headers', () => {
  const secret = '0123456789abcdef0123456789abcdef';
  const response = middleware.routeDatabaseApiForTest(
    request('/api/plugin-telemetry?retry=1'),
    {
      mode: 'target',
      originUrl: 'https://static.example.invalid/alexg/',
      originSecret: secret,
    },
  );
  assert.equal(
    response.headers.get('x-test-rewrite'),
    'https://static.example.invalid/alexg/api/plugin-telemetry?retry=1',
  );
  assert.equal(response.headers.get('x-request-x-sidestream-origin-auth'), secret);
  assert.equal(response.headers.get('x-request-x-sidestream-original-host'), 'alexg.mov');
});

test('target mode fails closed for insecure origins and short secrets', () => {
  const response = middleware.routeDatabaseApiForTest(request(), {
    mode: 'target',
    originUrl: 'http://example.invalid/alexg',
    originSecret: 'short',
  });
  assert.equal(response.status, 503);
});
