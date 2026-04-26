const { PERSONA_DEFINITIONS, readEvents } = require('./analytics-store');
const { denyNonLocal } = require('./analytics-dashboard-auth');
const { getStripeSnapshot } = require('./stripe-analytics');
const { PRODUCTS } = require('./products');

const RANGE_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

module.exports = async function handler(req, res) {
  if (denyNonLocal(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const url = new URL(req.url, 'http://localhost');
  const range = normalizeRange(url.searchParams.get('range'));
  const limit = clampNumber(url.searchParams.get('limit'), 1000, 200000, 50000);
  const now = Date.now();
  const sinceMs = range === 'all' ? null : now - RANGE_MS[range];
  const sinceUnix = sinceMs ? Math.floor(sinceMs / 1000) : undefined;

  const rawEvents = (await readEvents({ limit }))
    .map(event => ({ ...event, _time: eventTime(event) }))
    .filter(event => event._time && (!sinceMs || event._time >= sinceMs));
  const dashboardFilteredCount = rawEvents.filter(isDashboardEvent).length;
  const events = rawEvents
    .filter(event => !isDashboardEvent(event))
    .sort((a, b) => a._time - b._time);

  const [analytics, stripe] = await Promise.all([
    Promise.resolve(buildAnalytics(events, { range, sinceMs, now })),
    getStripeSnapshot({ sinceUnix, limit: 100 }),
  ]);

  res.json({
    generatedAt: new Date(now).toISOString(),
    range,
    since: sinceMs ? new Date(sinceMs).toISOString() : null,
    analytics,
    stripe,
    products: publicProducts(),
    notes: [
      'All analytics data is stored locally in JSONL files under .analytics.',
      `${analytics.diagnostics.technicalOnlySessions} technical-only sessions are excluded from funnel, persona, and bottleneck metrics; raw GET/resource counts still include technical requests.`,
      `${dashboardFilteredCount} dashboard/admin events are filtered out of this view.`,
      'Stripe sessions are real account data for the selected date range. They can include purchases created before the local analytics layer existed, so Stripe totals may not match local checkout events one-for-one yet.',
      'Stripe-hosted Checkout does not expose heatmaps, field focus, or internal page-click telemetry through the Stripe API. Stripe sections use real Checkout Session lifecycle and payment data.',
    ],
  });
};

function buildAnalytics(events, context) {
  const groups = groupSessions(events);
  const allSessions = Array.from(groups.values()).map(buildSessionSummary);
  const sessions = allSessions.filter(session => session.hasVisitSignal);
  const sessionKeys = new Set(sessions.map(session => session.sessionKey));
  const visitEvents = events.filter(event => isVisitSignalEvent(event) || sessionKeys.has(sessionKeyForEvent(event)));
  const visitors = new Set(sessions.map(session => session.visitorKey).filter(Boolean));
  const returningVisitors = new Set(sessions.filter(session => session.returning).map(session => session.visitorKey).filter(Boolean));
  const overview = buildOverview(events, visitEvents, sessions, visitors, returningVisitors, allSessions);
  const pageStats = buildPageStats(visitEvents);
  const trafficSeries = buildTrafficSeries(events, context);
  const speed = buildSpeedStats(events);
  const resources = buildResourceStats(events);
  const funnel = buildFunnel(visitEvents, sessions);
  const personas = rankedCounts(countBySession(sessions, 'persona'));
  const bottlenecks = rankedCounts(countSessionSets(sessions, 'bottlenecks'));
  const journeys = rankedPaths(sessions);
  const recentSessions = sessions
    .sort((a, b) => b.lastAtMs - a.lastAtMs)
    .slice(0, 24);

  return {
    eventCount: events.length,
    overview,
    funnel,
    trafficSeries,
    pageStats,
    speed,
    resources,
    personas,
    bottlenecks,
    journeys,
    recentSessions,
    personaDefinitions: PERSONA_DEFINITIONS,
    sequenceDefinitions: sequenceDefinitions(),
    diagnostics: {
      rawEvents: events.length,
      rawSessions: allSessions.length,
      visitSessions: sessions.length,
      technicalOnlySessions: allSessions.length - sessions.length,
      visitEvents: visitEvents.length,
      getRequests: countEvents(events, 'request:get'),
      resourceGets: countEvents(events, 'resource_get'),
    },
  };
}

function buildOverview(events, visitEvents, sessions, visitors, returningVisitors, allSessions) {
  return {
    visitors: visitors.size,
    sessions: sessions.length,
    returningVisitors: returningVisitors.size,
    pageViews: countEvents(visitEvents, 'page_view'),
    getRequests: countEvents(events, 'request:get'),
    resourceGets: countEvents(events, 'resource_get'),
    technicalOnlySessions: allSessions.length - sessions.length,
    productViews: visitEvents.filter(isProductPageView).length,
    productCtaClicks: countEvents(visitEvents, 'product_cta_click'),
    buyClicks: countEvents(visitEvents, 'buy_click'),
    checkoutSessionsCreated: countEvents(visitEvents, 'checkout_session_created'),
    checkoutSuccessViews: countEvents(visitEvents, 'checkout_success_view'),
    downloads: visitEvents.filter(isSuccessfulDownload).length,
    leadClicks: countEvents(visitEvents, 'lead_click'),
    medianActiveSeconds: median(sessions.map(session => session.activeMs).filter(Boolean)) / 1000,
  };
}

function buildFunnel(events, sessions) {
  const stages = [
    {
      key: 'sessions',
      label: 'Website sessions',
      count: sessions.length,
    },
    {
      key: 'productListing',
      label: 'Product listing viewed',
      count: sessions.filter(session => session.viewedProductListing).length,
    },
    {
      key: 'productDetail',
      label: 'Product detail viewed',
      count: sessions.filter(session => session.viewedProductDetail).length,
    },
    {
      key: 'productCta',
      label: 'Product CTA clicked',
      count: sessions.filter(session => session.productCtaClicks > 0).length,
    },
    {
      key: 'buyClick',
      label: 'Buy clicked',
      count: sessions.filter(session => session.buyClicks > 0).length,
    },
    {
      key: 'checkoutCreated',
      label: 'Checkout session created',
      count: sessions.filter(session => session.checkoutSessionsCreated > 0).length,
    },
    {
      key: 'success',
      label: 'Success page viewed',
      count: sessions.filter(session => session.checkoutSuccessViews > 0).length,
    },
    {
      key: 'download',
      label: 'Download requested',
      count: sessions.filter(session => session.downloads > 0).length,
    },
    {
      key: 'lead',
      label: 'Lead email clicked',
      count: sessions.filter(session => session.leadClicks > 0).length,
    },
  ];

  const first = Math.max(1, stages[0].count);
  return stages.map((stage, index) => {
    const previous = index > 0 ? stages[index - 1].count : stage.count;
    return {
      ...stage,
      conversionFromStart: roundPct(stage.count / first),
      conversionFromPrevious: index === 0 ? 100 : roundPct(stage.count / Math.max(1, previous)),
      eventCount: funnelEventCount(events, stage.key),
    };
  });
}

function funnelEventCount(events, key) {
  if (key === 'sessions') return 0;
  if (key === 'productListing') return events.filter(event => event.type === 'page_view' && isProductListing(event.page)).length;
  if (key === 'productDetail') return events.filter(isProductPageView).length;
  if (key === 'productCta') return countEvents(events, 'product_cta_click');
  if (key === 'buyClick') return countEvents(events, 'buy_click');
  if (key === 'checkoutCreated') return countEvents(events, 'checkout_session_created');
  if (key === 'success') return countEvents(events, 'checkout_success_view');
  if (key === 'download') return events.filter(isSuccessfulDownload).length;
  if (key === 'lead') return countEvents(events, 'lead_click');
  return 0;
}

function buildPageStats(events) {
  const stats = new Map();
  const samples = sessionPageActiveSamples(events);

  for (const event of events) {
    const page = event.page || 'unknown';
    if (!isContentPage(page)) continue;
    if (!isPageMetricEvent(event)) continue;
    const row = ensure(stats, page, () => ({
      page,
      views: 0,
      completedViews: 0,
      avgActiveMs: 0,
      medianActiveMs: 0,
      p90ActiveMs: 0,
      avgDurationMs: 0,
      medianScrollDepth: 0,
      exits: 0,
      buyClicks: 0,
      productCtaClicks: 0,
      leadClicks: 0,
      navigationClicks: 0,
      checkoutSuccessViews: 0,
      activeSamples: [],
      durationSamples: [],
      scrollSamples: [],
    }));

    if (event.type === 'page_view') row.views += 1;
    if (event.type === 'page_duration') {
      row.completedViews += 1;
      row.exits += ['pagehide', 'beforeunload'].includes(event.exitReason) ? 1 : 0;
      row.durationSamples.push(Number(event.durationMs || 0));
      row.scrollSamples.push(Number(event.scrollDepth || 0));
    }
    if (event.type === 'buy_click') row.buyClicks += 1;
    if (event.type === 'product_cta_click') row.productCtaClicks += 1;
    if (event.type === 'lead_click') row.leadClicks += 1;
    if (event.type === 'navigation_click') row.navigationClicks += 1;
    if (event.type === 'checkout_success_view') row.checkoutSuccessViews += 1;
  }

  for (const sample of samples) {
    if (!isContentPage(sample.page)) continue;
    const row = ensure(stats, sample.page, () => ({
      page: sample.page,
      views: 0,
      completedViews: 0,
      avgActiveMs: 0,
      medianActiveMs: 0,
      p90ActiveMs: 0,
      avgDurationMs: 0,
      medianScrollDepth: 0,
      exits: 0,
      buyClicks: 0,
      productCtaClicks: 0,
      leadClicks: 0,
      navigationClicks: 0,
      checkoutSuccessViews: 0,
      activeSamples: [],
      durationSamples: [],
      scrollSamples: [],
    }));
    row.activeSamples.push(sample.activeMs);
  }

  return Array.from(stats.values())
    .map(row => {
      const active = row.activeSamples.filter(value => value > 0);
      const durations = row.durationSamples.filter(value => value >= 0);
      const scroll = row.scrollSamples.filter(value => value >= 0);
      return {
        page: row.page,
        views: row.views,
        completedViews: row.completedViews,
        exits: row.exits,
        exitRate: roundPct(row.exits / Math.max(1, row.completedViews)),
        avgActiveMs: average(active),
        medianActiveMs: median(active),
        p90ActiveMs: percentile(active, 90),
        avgDurationMs: average(durations),
        medianScrollDepth: Math.round(median(scroll)),
        buyClicks: row.buyClicks,
        productCtaClicks: row.productCtaClicks,
        leadClicks: row.leadClicks,
        navigationClicks: row.navigationClicks,
        checkoutSuccessViews: row.checkoutSuccessViews,
      };
    })
    .sort((a, b) => b.views - a.views || b.medianActiveMs - a.medianActiveMs)
    .slice(0, 40);
}

function buildTrafficSeries(events, { range, sinceMs, now }) {
  const bucketMs = range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const start = sinceMs || (events[0]?._time ? floorBucket(events[0]._time, bucketMs) : floorBucket(now, bucketMs));
  const end = floorBucket(now, bucketMs) + bucketMs;
  const buckets = new Map();

  for (let time = floorBucket(start, bucketMs); time <= end; time += bucketMs) {
    buckets.set(time, emptyTrafficBucket(time, bucketMs));
  }

  for (const event of events) {
    const bucketStart = floorBucket(event._time, bucketMs);
    const row = ensure(buckets, bucketStart, () => emptyTrafficBucket(bucketStart, bucketMs));
    row.events += 1;
    if (event.type === 'page_view') row.pageViews += 1;
    if (event.type === 'request:get') row.getRequests += 1;
    if (event.type === 'resource_get') row.resources += 1;
    if (event.type === 'buy_click') row.buyClicks += 1;
    if (event.type === 'checkout_session_created') row.checkoutCreated += 1;
    if (event.type === 'checkout_success_view') row.success += 1;
  }

  return Array.from(buckets.values()).sort((a, b) => a.startMs - b.startMs);
}

function buildSpeedStats(events) {
  const pagePerf = new Map();
  const server = new Map();

  for (const event of events) {
    if (event.type === 'page_performance') {
      const page = event.page || 'unknown';
      if (!isContentPage(page)) continue;
      const row = ensure(pagePerf, page, () => ({
        page,
        samples: 0,
        loadMs: [],
        ttfbMs: [],
        fcpMs: [],
        transferSize: [],
      }));
      row.samples += 1;
      pushNumber(row.loadMs, event.loadMs);
      pushNumber(row.ttfbMs, event.ttfbMs);
      pushNumber(row.fcpMs, event.firstContentfulPaintMs);
      pushNumber(row.transferSize, event.transferSize);
    }

    if (event.type === 'request:get') {
      const path = event.path || 'unknown';
      const row = ensure(server, path, () => ({
        path,
        requests: 0,
        durations: [],
        statuses: {},
        contentLength: [],
      }));
      row.requests += 1;
      row.statuses[event.status || 'unknown'] = (row.statuses[event.status || 'unknown'] || 0) + 1;
      pushNumber(row.durations, event.durationMs);
      pushNumber(row.contentLength, event.contentLength);
    }
  }

  return {
    pagePerformance: Array.from(pagePerf.values())
      .map(row => ({
        page: row.page,
        samples: row.samples,
        medianLoadMs: median(row.loadMs),
        p90LoadMs: percentile(row.loadMs, 90),
        medianTtfbMs: median(row.ttfbMs),
        medianFcpMs: median(row.fcpMs),
        medianTransferKb: Math.round(median(row.transferSize) / 1024),
      }))
      .sort((a, b) => b.p90LoadMs - a.p90LoadMs)
      .slice(0, 20),
    serverRequests: Array.from(server.values())
      .map(row => ({
        path: row.path,
        requests: row.requests,
        medianDurationMs: median(row.durations),
        p90DurationMs: percentile(row.durations, 90),
        errorCount: Object.entries(row.statuses)
          .filter(([status]) => Number(status) >= 400)
          .reduce((sum, [, count]) => sum + count, 0),
        medianKb: Math.round(median(row.contentLength) / 1024),
        statuses: row.statuses,
      }))
      .sort((a, b) => b.p90DurationMs - a.p90DurationMs)
      .slice(0, 30),
  };
}

function buildResourceStats(events) {
  const resources = new Map();

  for (const event of events) {
    if (event.type !== 'resource_get') continue;
    const key = event.resourcePath || event.path || 'unknown';
    const row = ensure(resources, key, () => ({
      path: key,
      host: event.resourceHost || '',
      initiatorType: event.initiatorType || 'unknown',
      count: 0,
      durations: [],
      transferSize: 0,
      encodedBodySize: 0,
    }));
    row.count += 1;
    pushNumber(row.durations, event.durationMs);
    row.transferSize += Number(event.transferSize || 0);
    row.encodedBodySize += Number(event.encodedBodySize || 0);
  }

  return Array.from(resources.values())
    .map(row => ({
      path: row.path,
      host: row.host,
      initiatorType: row.initiatorType,
      count: row.count,
      medianDurationMs: median(row.durations),
      p90DurationMs: percentile(row.durations, 90),
      totalTransferKb: Math.round(row.transferSize / 1024),
      totalEncodedKb: Math.round(row.encodedBodySize / 1024),
    }))
    .sort((a, b) => b.totalTransferKb - a.totalTransferKb || b.p90DurationMs - a.p90DurationMs)
    .slice(0, 30);
}

function groupSessions(events) {
  const groups = new Map();
  for (const event of events) {
    const key = event.sessionId || event.visitorHash || event.visitorId || 'unknown';
    const group = ensure(groups, key, () => []);
    group.push(event);
  }
  return groups;
}

function buildSessionSummary(events) {
  const ordered = events.slice().sort((a, b) => a._time - b._time);
  const pageViews = ordered
    .filter(event => event.type === 'page_view')
    .map(event => event.page || 'unknown')
    .filter(isContentPage)
    .filter((page, index, list) => index === 0 || list[index - 1] !== page);
  const activeMs = sessionPageActiveSamples(ordered).reduce((sum, sample) => sum + sample.activeMs, 0);
  const hasVisitSignal = ordered.some(isVisitSignalEvent);
  const bottlenecks = new Set();
  let persona = 'general_explorer';

  for (const event of ordered) {
    if (event.persona) persona = event.persona;
    for (const item of event.bottlenecks || []) bottlenecks.add(item);
  }

  const derived = deriveSessionSignals(ordered, pageViews, activeMs);
  for (const item of derived.bottlenecks) bottlenecks.add(item);
  if (!events.some(event => event.persona)) persona = derived.persona;

  return {
    sessionKey: ordered[0]?.sessionId || ordered[0]?.visitorHash || 'unknown',
    visitorKey: ordered[0]?.visitorId || ordered[0]?.visitorHash || '',
    firstAt: new Date(ordered[0]?._time || Date.now()).toISOString(),
    lastAt: new Date(ordered[ordered.length - 1]?._time || Date.now()).toISOString(),
    firstAtMs: ordered[0]?._time || 0,
    lastAtMs: ordered[ordered.length - 1]?._time || 0,
    eventCount: ordered.length,
    pages: pageViews.slice(0, 12),
    lastPage: pageViews[pageViews.length - 1] || 'unknown',
    activeMs,
    activeSeconds: Math.round(activeMs / 1000),
    hasVisitSignal,
    technicalOnly: !hasVisitSignal,
    persona,
    stage: derived.stage,
    sequenceTags: derived.sequenceTags,
    bottlenecks: Array.from(bottlenecks),
    returning: ordered.some(event => event.type === 'return_visit' || event.returningVisitor),
    viewedProductListing: ordered.some(event => event.type === 'page_view' && isProductListing(event.page)),
    viewedProductDetail: ordered.some(isProductPageView),
    productCtaClicks: ordered.filter(event => event.type === 'product_cta_click').length,
    buyClicks: ordered.filter(event => event.type === 'buy_click').length,
    checkoutSessionsCreated: ordered.filter(event => event.type === 'checkout_session_created').length,
    checkoutSuccessViews: ordered.filter(event => event.type === 'checkout_success_view').length,
    downloads: ordered.filter(isSuccessfulDownload).length,
    leadClicks: ordered.filter(event => event.type === 'lead_click').length,
  };
}

function deriveSessionSignals(events, pageViews, activeMs) {
  const hasDurationSignal = events.some(event => event.type === 'page_duration' || event.type === 'page_ping');
  const hasProductListing = events.some(event => event.type === 'page_view' && isProductListing(event.page));
  const hasProductDetail = events.some(isProductPageView);
  const hasBuy = events.some(event => event.type === 'buy_click');
  const hasCheckoutCreated = events.some(event => event.type === 'checkout_session_created');
  const hasSuccess = events.some(event => event.type === 'checkout_success_view');
  const hasDownload = events.some(isSuccessfulDownload);
  const hasLead = events.some(event => event.type === 'lead_click');
  const hasLuts = pageViews.some(page => isLutPage(page));
  const hasPlugins = pageViews.some(page => isPluginPage(page));
  const hasSupport = pageViews.some(page => ['support', 'terms', 'refund'].includes(page));
  const hasProof = pageViews.some(page => ['portfolio', 'services'].includes(page));
  const returning = events.some(event => event.type === 'return_visit' || event.returningVisitor);
  const bottlenecks = [];
  const sequenceTags = [];

  if (pageViews.length === 1 && hasDurationSignal && activeMs < 10000) {
    bottlenecks.push('early_bounce_under_10s');
    sequenceTags.push('single_page_bounce');
  }
  if (hasProductListing && !hasProductDetail && !hasBuy) {
    bottlenecks.push('product_listing_without_detail');
    sequenceTags.push('listing_dropoff');
  }
  if (hasProductDetail && !hasBuy && activeMs >= 30000) {
    bottlenecks.push('product_detail_attention_without_buy');
    sequenceTags.push('detail_consideration_dropoff');
  }
  if (hasBuy && !hasSuccess) {
    bottlenecks.push('checkout_started_without_confirmed_success');
    sequenceTags.push('checkout_dropoff');
  }
  if (hasCheckoutCreated && !hasSuccess) sequenceTags.push('stripe_session_without_success_view');
  if (hasPlugins && hasLuts && !hasBuy) {
    bottlenecks.push('comparison_without_decision');
    sequenceTags.push('comparison_loop');
  }
  if (hasSupport && (hasProductListing || hasProductDetail) && !hasSuccess) {
    bottlenecks.push('trust_or_compatibility_check_after_product');
    sequenceTags.push('trust_check_after_product');
  }
  if (returning && hasLuts && !hasSuccess) sequenceTags.push('returning_lut_consideration');
  if (hasProof && !hasLead && !hasBuy && activeMs >= 45000) {
    bottlenecks.push('proof_attention_without_action');
    sequenceTags.push('proof_dead_end');
  }
  if (hasLead) sequenceTags.push('lead_intent');
  if (hasDownload) sequenceTags.push('download_after_purchase');

  let persona = 'general_explorer';
  if (hasSuccess || hasDownload) persona = hasBuy && pageViews.length <= 3 ? 'quick_buyer' : 'checkout_hesitator';
  else if (hasBuy || hasCheckoutCreated) persona = 'checkout_hesitator';
  else if (hasLead || pageViews.includes('services')) persona = 'service_lead_candidate';
  else if (returning && hasLuts) persona = 'returning_lut_considerer';
  else if (hasPlugins && hasLuts) persona = 'comparison_shopper';
  else if (hasLuts && (hasProductDetail || activeMs >= 30000)) persona = 'high_intent_lut_shopper';
  else if (hasPlugins && (hasProductDetail || activeMs >= 30000)) persona = 'plugin_workflow_evaluator';
  else if (hasSupport) persona = 'support_policy_checker';
  else if (hasProof && (hasProductListing || hasProductDetail)) persona = 'proof_seeker';
  else if (hasProof) persona = 'portfolio_browser';
  else if (bottlenecks.includes('early_bounce_under_10s')) persona = 'low_intent_bounce';

  let stage = 'Browsing';
  if (hasDownload) stage = 'Downloaded';
  else if (hasSuccess) stage = 'Purchase success';
  else if (hasCheckoutCreated) stage = 'Checkout created';
  else if (hasBuy) stage = 'Buy clicked';
  else if (hasProductDetail) stage = 'Product detail';
  else if (hasProductListing) stage = 'Product listing';
  else if (hasLead) stage = 'Lead clicked';
  else if (bottlenecks.includes('early_bounce_under_10s')) stage = 'Early bounce';

  return {
    persona,
    stage,
    sequenceTags: Array.from(new Set(sequenceTags)),
    bottlenecks: Array.from(new Set(bottlenecks)),
  };
}

function sessionPageActiveSamples(events) {
  const bySessionPage = new Map();

  for (const event of events) {
    if (event.type !== 'page_duration' && event.type !== 'page_ping') continue;
    const page = event.page || 'unknown';
    if (!isContentPage(page)) continue;
    const key = `${event.sessionId || event.visitorHash || 'unknown'}::${page}`;
    const row = ensure(bySessionPage, key, () => ({
      page,
      durationMs: 0,
      pingMs: 0,
    }));
    if (event.type === 'page_duration') row.durationMs += Number(event.activeMs || event.durationMs || 0);
    if (event.type === 'page_ping') row.pingMs = Math.max(row.pingMs, Number(event.activeMs || event.durationMs || 0));
  }

  return Array.from(bySessionPage.values())
    .map(row => ({
      page: row.page,
      activeMs: Math.max(row.durationMs, row.pingMs),
    }))
    .filter(row => row.activeMs > 0);
}

function rankedPaths(sessions) {
  const paths = {};
  for (const session of sessions) {
    const path = session.pages.slice(0, 8).join(' > ');
    if (!path) continue;
    paths[path] = (paths[path] || 0) + 1;
  }
  return Object.entries(paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([path, count]) => ({ path, count }));
}

function rankedCounts(counts, limit = 20) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function countBySession(sessions, key) {
  return sessions.reduce((acc, session) => {
    const value = session[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function countSessionSets(sessions, key) {
  return sessions.reduce((acc, session) => {
    for (const value of session[key] || []) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});
}

function sequenceDefinitions() {
  return {
    single_page_bounce: 'One page, less than 10 seconds of active time.',
    early_bounce_under_10s: 'One page, less than 10 seconds of active time.',
    listing_dropoff: 'Viewed a product listing but did not open a product detail page.',
    product_listing_without_detail: 'Viewed a product listing but did not open a product detail page.',
    detail_consideration_dropoff: 'Spent meaningful time on product detail without a buy click.',
    product_detail_attention_without_buy: 'Spent meaningful time on product detail without a buy click.',
    checkout_dropoff: 'Clicked buy or created checkout without a confirmed success page.',
    checkout_started_without_confirmed_success: 'Clicked buy or created checkout without a confirmed success page.',
    stripe_session_without_success_view: 'A local checkout session was created, but no success page was observed locally.',
    comparison_loop: 'Browsed both LUT and plugin paths without a purchase action.',
    comparison_without_decision: 'Browsed both LUT and plugin paths without a purchase action.',
    trust_check_after_product: 'Viewed support, terms, refund, or compatibility after product interest.',
    trust_or_compatibility_check_after_product: 'Viewed support, terms, refund, or compatibility after product interest.',
    returning_lut_consideration: 'Returned after an earlier visit and engaged with the LUT path.',
    proof_dead_end: 'Spent time on proof/portfolio/service pages without a lead or purchase action.',
    proof_attention_without_action: 'Spent time on proof/portfolio/service pages without a lead or purchase action.',
    lut_interest_without_checkout: 'Spent meaningful time in the LUT path without checkout intent.',
    plugin_interest_without_checkout: 'Spent meaningful time in the plugin path without checkout intent.',
    services_interest_without_brief: 'Spent meaningful time on services without clicking the brief or email path.',
    portfolio_dead_end: 'Spent time in portfolio proof without moving to products or lead capture.',
    homepage_attention_without_product_entry: 'Spent meaningful time on the homepage without entering a product path.',
    lead_intent: 'Clicked an email or brief link.',
    download_after_purchase: 'Requested a download after purchase.',
  };
}

function publicProducts() {
  return Object.fromEntries(Object.entries(PRODUCTS).map(([id, product]) => [
    id,
    {
      name: product.name,
      page: product.page,
      hasStripePrice: Boolean(product.stripePriceId),
      hasDownload: Boolean(product.blobUrl),
    },
  ]));
}

function normalizeRange(value) {
  if (value === '24h' || value === '7d' || value === '30d' || value === 'all') return value;
  return '7d';
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function eventTime(event) {
  const fromTs = Date.parse(event.ts || '');
  if (Number.isFinite(fromTs)) return fromTs;
  const clientTs = Number(event.clientTs || 0);
  if (clientTs > 0) return clientTs;
  return 0;
}

function countEvents(events, type) {
  return events.filter(event => event.type === type).length;
}

function sessionKeyForEvent(event) {
  return event.sessionId || event.visitorHash || event.visitorId || 'unknown';
}

function isVisitSignalEvent(event) {
  const type = event.type;
  if ([
    'page_view',
    'page_duration',
    'page_ping',
    'page_performance',
    'visibility_pause',
    'visibility_resume',
    'journey_snapshot',
    'product_cta_click',
    'buy_click',
    'navigation_click',
    'external_link_click',
    'faq_toggle',
    'lead_click',
    'return_visit',
    'checkout_success_view',
  ].includes(type)) {
    return isContentPage(event.page || '');
  }
  return false;
}

function isPageMetricEvent(event) {
  return [
    'page_view',
    'page_duration',
    'page_ping',
    'page_performance',
    'product_cta_click',
    'buy_click',
    'navigation_click',
    'external_link_click',
    'faq_toggle',
    'lead_click',
    'return_visit',
    'checkout_success_view',
  ].includes(event.type);
}

function isContentPage(page = '') {
  const value = String(page || '');
  return value === 'home' ||
    value === 'plugins' ||
    value === 'luts' ||
    value === 'portfolio' ||
    value === 'services' ||
    value === 'support' ||
    value === 'success' ||
    value === 'terms' ||
    value === 'refund' ||
    value.startsWith('plugin:') ||
    value.startsWith('lut:');
}

function isProductListing(page = '') {
  return page === 'plugins' || page === 'luts';
}

function isProductPage(page = '') {
  return String(page).startsWith('plugin:') || String(page).startsWith('lut:');
}

function isLutPage(page = '') {
  return page === 'luts' || String(page).startsWith('lut:');
}

function isPluginPage(page = '') {
  return page === 'plugins' || String(page).startsWith('plugin:');
}

function isProductPageView(event) {
  return event.type === 'page_view' && isProductPage(event.page);
}

function isSuccessfulDownload(event) {
  return event.type === 'request:get' && event.path === '/api/download' && Number(event.status) === 200;
}

function isDashboardEvent(event) {
  const path = String(event.path || '');
  const page = String(event.page || '');
  return path === '/analytics' ||
    path === '/analytics.' ||
    path === '/analytics-dashboard' ||
    path === '/api/analytics-dashboard-data' ||
    path === '/api/analytics-report' ||
    page === 'analytics' ||
    page === 'analytics.' ||
    page === 'analytics-dashboard' ||
    page === 'api/analytics-dashboard-data' ||
    page === 'api/analytics-report';
}

function floorBucket(time, bucketMs) {
  return Math.floor(time / bucketMs) * bucketMs;
}

function emptyTrafficBucket(startMs, bucketMs) {
  return {
    startMs,
    endMs: startMs + bucketMs,
    label: bucketMs < 24 * 60 * 60 * 1000
      ? new Date(startMs).toLocaleTimeString('en-US', { hour: 'numeric' })
      : new Date(startMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    events: 0,
    pageViews: 0,
    getRequests: 0,
    resources: 0,
    buyClicks: 0,
    checkoutCreated: 0,
    success: 0,
  };
}

function ensure(map, key, create) {
  if (!map.has(key)) map.set(key, create());
  return map.get(key);
}

function pushNumber(list, value) {
  const num = Number(value);
  if (Number.isFinite(num) && num >= 0) list.push(num);
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values) {
  return percentile(values, 50);
}

function percentile(values, p) {
  const clean = values.filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return 0;
  const index = Math.min(clean.length - 1, Math.max(0, Math.ceil((p / 100) * clean.length) - 1));
  return Math.round(clean[index]);
}

function roundPct(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 1000) / 10;
}
