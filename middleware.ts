// @ts-nocheck -- Vercel compiles this self-contained Edge middleware; focused
// local tests own the three-state database routing contract.
import { next, rewrite } from "@vercel/functions";

export const DATABASE_CUTOVER_MODE = "target";
const MODES = new Set(["source", "fenced", "target"]);
const ORIGIN_AUTH_HEADER = "x-sidestream-origin-auth";
const ORIGINAL_HOST_HEADER = "x-sidestream-original-host";

export const config = { matcher: ["/api/:path*"] };

export default function databaseCutoverMiddleware(request) {
  return routeDatabaseApi(request, runtime());
}

export function routeDatabaseApiForTest(request, overrides = {}) {
  return routeDatabaseApi(request, { ...runtime(), ...overrides });
}

export function databaseApiDecision(mode = DATABASE_CUTOVER_MODE) {
  return MODES.has(mode) ? mode : "fenced";
}

function routeDatabaseApi(request, settings) {
  const mode = databaseApiDecision(settings.mode);
  if (mode === "fenced") return fence();

  const headers = new Headers(request.headers);
  headers.delete(ORIGIN_AUTH_HEADER);
  headers.delete(ORIGINAL_HOST_HEADER);
  if (mode === "source") return next({ request: { headers } });

  const origin = validOrigin(settings.originUrl);
  const secret = validSecret(settings.originSecret);
  if (!origin || !secret) return fence();

  const requestUrl = new URL(request.url);
  const destination = new URL(origin);
  destination.pathname = `${origin.pathname.replace(/\/$/, "")}${requestUrl.pathname}`;
  destination.search = requestUrl.search;
  headers.delete("host");
  headers.set(ORIGIN_AUTH_HEADER, secret);
  headers.set(ORIGINAL_HOST_HEADER, requestUrl.host);
  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-proto", requestUrl.protocol.replace(":", ""));
  return rewrite(destination, { request: { headers } });
}

function fence() {
  return new Response(JSON.stringify({
    error: "alexg.mov is briefly unavailable while its database is moved.",
    code: "database_cutover_in_progress",
  }), {
    status: 503,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Retry-After": "60",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function validOrigin(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      return null;
    }
    url.pathname = url.pathname.replace(/\/+$/, "") + "/";
    return url;
  } catch {
    return null;
  }
}

function validSecret(value) {
  const secret = String(value || "");
  return secret.length >= 32 && secret.length <= 512 && /^[\x21-\x7e]+$/.test(secret)
    ? secret
    : "";
}

function runtime() {
  return {
    mode: DATABASE_CUTOVER_MODE,
    originUrl: process.env.ALEXG_HETZNER_ORIGIN_URL,
    originSecret: process.env.SIDESTREAM_ORIGIN_AUTH_SECRET,
  };
}
