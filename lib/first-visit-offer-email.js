const { OFFER_CODE } = require('./first-visit-offer');

const DEFAULT_FROM = 'alexg.mov <downloads@alexg.mov>';
const DEFAULT_REPLY_TO = 'alex@alexg.mov';

function getOfferEmailConfig() {
  return {
    enabled: process.env.FIRST_VISIT_OFFER_EMAIL_ENABLED !== '0',
    from: process.env.FIRST_VISIT_OFFER_FROM || DEFAULT_FROM,
    replyTo: process.env.FIRST_VISIT_OFFER_REPLY_TO || process.env.CONTACT_EMAIL || DEFAULT_REPLY_TO,
    unsubscribeEmail: process.env.FIRST_VISIT_OFFER_UNSUBSCRIBE_EMAIL || process.env.CONTACT_EMAIL || DEFAULT_REPLY_TO,
    postalAddress: process.env.EMAIL_POSTAL_ADDRESS || process.env.BUSINESS_POSTAL_ADDRESS || '',
    siteUrl: normalizeOrigin(process.env.SITE_URL || 'https://alexg.mov'),
  };
}

function buildOfferEmail(options = {}) {
  const config = {
    ...getOfferEmailConfig(),
    ...options,
  };
  const shopUrl = `${config.siteUrl}/?page=luts`;
  const escapedCode = escapeHtml(OFFER_CODE);
  const escapedShopUrl = escapeAttribute(shopUrl);
  const escapedReplyTo = escapeHtml(config.replyTo);
  const unsubscribeAddress = emailAddressForMailto(config.unsubscribeEmail || config.replyTo);
  const escapedUnsubscribeEmail = escapeAttribute(unsubscribeAddress);
  const escapedPostalAddress = escapeHtml(config.postalAddress);

  const addressLine = escapedPostalAddress
    ? `<br>${escapedPostalAddress}`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;max-width:560px;margin:0 auto;padding:48px 24px">
  <p style="font-family:monospace;font-size:11px;color:#888;letter-spacing:.06em;margin:0 0 36px">ALEXG.MOV - PROMO CODE</p>
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:500;letter-spacing:0;margin:0 0 16px">Thanks for browsing.</h1>
  <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 28px">Here is your private LUT shop code. It should auto apply at checkout from the browser where you claimed it, but you can paste it manually if needed.</p>
  <div style="display:inline-block;border:1px solid #d8e4ff;background:#f2f6ff;color:#143fa2;border-radius:6px;padding:14px 18px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:22px;font-weight:700;letter-spacing:.08em;margin:0 0 28px">${escapedCode}</div>
  <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 36px">Use it when you are ready, or keep browsing the LUTs below.</p>
  <a href="${escapedShopUrl}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;font-family:monospace;font-size:13px;letter-spacing:.04em;text-decoration:none;border-radius:2px">Browse LUTs</a>
  <hr style="border:none;border-top:1px solid #eee;margin:48px 0 24px">
  <p style="font-size:12px;color:#888;line-height:1.6;margin:0">You got this because you requested a private promo code on alexg.mov. To opt out of future promotional email, reply with "unsubscribe" to <a href="mailto:${escapedUnsubscribeEmail}" style="color:#111;text-decoration:none">${escapedReplyTo}</a>.${addressLine}</p>
</body>
</html>`;

  const text = [
    'ALEXG.MOV - PROMO CODE',
    '',
    'Thanks for browsing.',
    '',
    'Here is your private LUT shop code. It should auto apply at checkout from the browser where you claimed it, but you can paste it manually if needed.',
    '',
    OFFER_CODE,
    '',
    `Browse LUTs: ${shopUrl}`,
    '',
    'You got this because you requested a private promo code on alexg.mov.',
    `To opt out of future promotional email, reply with "unsubscribe" to ${config.replyTo}.`,
    config.postalAddress || '',
  ].filter(Boolean).join('\n');

  return {
    subject: 'Your alexg.mov promo code',
    html,
    text,
  };
}

function offerEmailHeaders(config = getOfferEmailConfig()) {
  const unsubscribeEmail = emailAddressForMailto(config.unsubscribeEmail || config.replyTo);
  if (!unsubscribeEmail) return {};

  const subject = encodeURIComponent('Unsubscribe from alexg.mov emails');
  return {
    'List-Unsubscribe': `<mailto:${unsubscribeEmail}?subject=${subject}>`,
  };
}

function normalizeOrigin(value) {
  return String(value || '').replace(/\/+$/, '');
}

function emailAddressForMailto(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/<([^<>@\s]+@[^<>\s]+)>/);
  return match ? match[1] : raw;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

module.exports = {
  buildOfferEmail,
  getOfferEmailConfig,
  offerEmailHeaders,
};
