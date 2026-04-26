(function () {
  const ENDPOINT = '/api/analytics';
  const VERSION = '2026-04-26.1';
  const VISITOR_KEY = 'alexgmov:analyticsVisitorId';
  const SESSION_KEY = 'alexgmov:analyticsSessionId';
  const SESSION_STARTED_KEY = 'alexgmov:analyticsSessionStartedAt';
  const JOURNEY_KEY = 'alexgmov:analyticsJourney';
  const LAST_SEEN_KEY = 'alexgmov:analyticsLastSeenAt';
  const RETURN_GAP_MS = 30 * 60 * 1000;
  const SESSION_GAP_MS = 30 * 60 * 1000;
  const MAX_HISTORY_EVENTS = 120;

  const PERSONA_DEFINITIONS = {
    quick_buyer: 'Moves from product discovery to checkout quickly with little comparison behavior.',
    returning_lut_considerer: 'Returns after a prior LUT visit, usually with meaningful LUT page time and no purchase yet.',
    high_intent_lut_shopper: 'Spends meaningful time with LUT pages, previews, or buy CTAs.',
    plugin_workflow_evaluator: 'Studies FlowState, compatibility, install details, or support before deciding.',
    comparison_shopper: 'Views both plugin and LUT paths before taking a purchase action.',
    service_lead_candidate: 'Engages with services, portfolio, proof, or the brief email flow.',
    proof_seeker: 'Looks for portfolio, case studies, testimonials, or proof before product action.',
    support_policy_checker: 'Checks support, terms, refund, or compatibility information around product consideration.',
    checkout_hesitator: 'Clicks buy or starts checkout without a confirmed success event in the observed sequence.',
    portfolio_browser: 'Consumes portfolio/creative proof without moving into product or service conversion.',
    low_intent_bounce: 'Leaves after a short single-page visit.',
    general_explorer: 'Browses multiple areas without a clear purchase or lead signal yet.',
  };

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }

  function sessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function sessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {}
  }

  function randomId(prefix) {
    const bytes = new Uint8Array(12);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    return `${prefix}_${Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
  }

  function getVisitorId() {
    let id = storageGet(VISITOR_KEY);
    if (!id) {
      id = randomId('v');
      storageSet(VISITOR_KEY, id);
    }
    setCookie('agm_vid', id, 365 * 24 * 60 * 60);
    return id;
  }

  function getSessionId() {
    const now = Date.now();
    const startedAt = parseInt(sessionGet(SESSION_STARTED_KEY) || '0', 10);
    let id = sessionGet(SESSION_KEY);
    if (!id || !startedAt || now - startedAt > SESSION_GAP_MS) {
      id = randomId('s');
      sessionSet(SESSION_KEY, id);
      sessionSet(SESSION_STARTED_KEY, String(now));
    }
    setCookie('agm_sid', id, 30 * 60);
    return id;
  }

  function setCookie(name, value, maxAgeSeconds) {
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
    } catch {}
  }

  const visitorId = getVisitorId();
  let sessionId = getSessionId();

  function currentPageFromLocation() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  }

  function productFromPage(page) {
    if (page === 'plugins' || page.startsWith('plugin:')) {
      return {
        productType: 'plugin',
        productId: page.startsWith('plugin:') ? page.slice(7) : null,
      };
    }
    if (page === 'luts' || page.startsWith('lut:')) {
      return {
        productType: 'lut',
        productId: page.startsWith('lut:') ? page.slice(4) : null,
      };
    }
    return { productType: null, productId: null };
  }

  function getUtm() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    return keys.reduce((acc, key) => {
      if (params.has(key)) acc[key] = params.get(key);
      return acc;
    }, {});
  }

  function loadJourney() {
    try {
      const parsed = JSON.parse(storageGet(JOURNEY_KEY) || '{}');
      if (!Array.isArray(parsed.events)) parsed.events = [];
      return parsed;
    } catch {
      return { events: [] };
    }
  }

  function saveJourney(journey) {
    journey.updatedAt = Date.now();
    journey.events = (journey.events || []).slice(-MAX_HISTORY_EVENTS);
    storageSet(JOURNEY_KEY, JSON.stringify(journey));
  }

  function rememberLocalEvent(event) {
    const journey = loadJourney();
    if (!journey.firstSeenAt) journey.firstSeenAt = Date.now();
    journey.events.push({
      type: event.type,
      page: event.page,
      ts: event.clientTs || Date.now(),
      durationMs: event.durationMs,
      activeMs: event.activeMs,
      scrollDepth: event.scrollDepth,
      productType: event.productType,
      productId: event.productId,
      targetPage: event.targetPage,
    });
    saveJourney(journey);
    return journey;
  }

  function hasPage(events, predicate) {
    return events.some(event => predicate(String(event.page || event.targetPage || '')));
  }

  function totalActiveMs(events, predicate) {
    const durationPages = new Set();
    let total = 0;
    const openPageMax = {};

    for (const event of events) {
      const page = String(event.page || '');
      if (!predicate(page)) continue;
      const activeMs = Number(event.activeMs || event.durationMs || 0);
      if (event.type === 'page_duration') {
        durationPages.add(page);
        total += activeMs;
      } else if (event.type === 'page_ping') {
        openPageMax[page] = Math.max(openPageMax[page] || 0, activeMs);
      }
    }

    for (const [page, activeMs] of Object.entries(openPageMax)) {
      if (!durationPages.has(page)) total += activeMs;
    }

    return total;
  }

  function classifyJourney(journey, currentEvent) {
    const events = (journey.events || []).concat(currentEvent || []);
    const pageViews = events.filter(event => event.type === 'page_view');
    const buyClicks = events.filter(event => event.type === 'buy_click');
    const leadClicks = events.filter(event => event.type === 'lead_click');
    const hasCheckoutSuccess = events.some(event => event.type === 'checkout_success_view');
    const hasBuy = buyClicks.length > 0;
    const hasPlugin = hasPage(events, page => page === 'plugins' || page.startsWith('plugin:'));
    const hasLuts = hasPage(events, page => page === 'luts' || page.startsWith('lut:'));
    const hasSupport = hasPage(events, page => ['support', 'terms', 'refund'].includes(page));
    const hasProof = hasPage(events, page => page === 'portfolio' || page === 'services');
    const hasProduct = hasPlugin || hasLuts;
    const currentPage = String(currentEvent?.page || currentPageFromLocation());
    const lutMs = totalActiveMs(events, page => page === 'luts' || page.startsWith('lut:'));
    const pluginMs = totalActiveMs(events, page => page === 'plugins' || page.startsWith('plugin:'));
    const servicesMs = totalActiveMs(events, page => page === 'services');
    const portfolioMs = totalActiveMs(events, page => page === 'portfolio');
    const homeMs = totalActiveMs(events, page => page === 'home');
    const returnVisit = events.some(event => event.type === 'return_visit' || event.returningVisitor);
    const bottlenecks = [];

    if (pageViews.length <= 1 && currentEvent?.type === 'page_duration' && Number(currentEvent.activeMs || currentEvent.durationMs || 0) < 10000) {
      bottlenecks.push('early_bounce_under_10s');
    }
    if (lutMs >= 45000 && !hasBuy) bottlenecks.push('lut_interest_without_checkout');
    if (pluginMs >= 45000 && !hasBuy) bottlenecks.push('plugin_interest_without_checkout');
    if (hasBuy && !hasCheckoutSuccess) bottlenecks.push('checkout_started_without_confirmed_success');
    if (hasProduct && hasSupport && !hasCheckoutSuccess) bottlenecks.push('trust_or_compatibility_check_after_product');
    if (hasPlugin && hasLuts && !hasBuy) bottlenecks.push('comparison_without_decision');
    if (servicesMs >= 45000 && !leadClicks.length) bottlenecks.push('services_interest_without_brief');
    if (portfolioMs >= 60000 && !hasProduct && !leadClicks.length) bottlenecks.push('portfolio_dead_end');
    if (homeMs >= 30000 && !hasProduct) bottlenecks.push('homepage_attention_without_product_entry');

    let persona = 'general_explorer';
    if (hasCheckoutSuccess) persona = 'quick_buyer';
    else if (hasBuy) persona = buyClicks.length && pageViews.length <= 3 ? 'quick_buyer' : 'checkout_hesitator';
    else if (leadClicks.length || servicesMs >= 45000) persona = 'service_lead_candidate';
    else if (returnVisit && hasLuts && lutMs >= 20000 && !hasCheckoutSuccess) persona = 'returning_lut_considerer';
    else if (hasLuts && (lutMs >= 30000 || currentPage.startsWith('lut:'))) persona = 'high_intent_lut_shopper';
    else if (hasPlugin && (pluginMs >= 30000 || currentPage.startsWith('plugin:'))) persona = 'plugin_workflow_evaluator';
    else if (hasProduct && hasSupport) persona = 'support_policy_checker';
    else if (hasPlugin && hasLuts) persona = 'comparison_shopper';
    else if (hasProof && hasProduct) persona = 'proof_seeker';
    else if (hasProof && !hasProduct) persona = 'portfolio_browser';
    else if (bottlenecks.includes('early_bounce_under_10s')) persona = 'low_intent_bounce';

    return {
      persona,
      bottlenecks: Array.from(new Set(bottlenecks)),
      personaDefinitions: PERSONA_DEFINITIONS,
    };
  }

  function post(event, useBeacon) {
    const body = JSON.stringify(event);
    if (useBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      } catch {}
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  function track(type, payload = {}, options = {}) {
    sessionId = getSessionId();
    const page = payload.page || currentPageFromLocation();
    const product = productFromPage(page);
    const base = {
      type,
      analyticsVersion: VERSION,
      visitorId,
      sessionId,
      clientTs: Date.now(),
      page,
      path: window.location.pathname,
      url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      title: document.title,
      referrer: document.referrer || '',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      utm: getUtm(),
      ...product,
      ...payload,
    };

    const journey = options.remember === false ? loadJourney() : rememberLocalEvent(base);
    const classification = classifyJourney(journey, options.remember === false ? base : null);
    const event = {
      ...base,
      persona: payload.persona || classification.persona,
      bottlenecks: payload.bottlenecks || classification.bottlenecks,
    };
    post(event, options.beacon !== false);
    return event;
  }

  const seenResources = new Set();

  function resourcePath(url) {
    return `${url.pathname}${url.search ? url.search.replace(/([?&](sig|signature|session_id|token|email|exp)=)[^&]+/gi, '$1[redacted]') : ''}`;
  }

  function trackResourceEntry(entry) {
    if (!entry || seenResources.has(entry.name)) return;
    seenResources.add(entry.name);

    let url;
    try {
      url = new URL(entry.name, window.location.href);
    } catch {
      return;
    }

    if (url.pathname === ENDPOINT) return;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    track('resource_get', {
      page: currentPageFromLocation(),
      resourceHost: url.host,
      resourcePath: resourcePath(url),
      sameOrigin: url.origin === window.location.origin,
      initiatorType: entry.initiatorType || 'unknown',
      durationMs: Math.round(entry.duration || 0),
      transferSize: Math.round(entry.transferSize || 0),
      encodedBodySize: Math.round(entry.encodedBodySize || 0),
      decodedBodySize: Math.round(entry.decodedBodySize || 0),
    }, { beacon: false, remember: false });
  }

  if ('PerformanceObserver' in window) {
    try {
      const resourceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(trackResourceEntry);
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch {}
  }

  function trackPagePerformance() {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) return;

    const paints = performance.getEntriesByType('paint');
    const firstPaint = paints.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paints.find(entry => entry.name === 'first-contentful-paint');
    const loadEnd = nav.loadEventEnd || performance.now();

    track('page_performance', {
      navigationType: nav.type || 'navigate',
      redirectMs: Math.round(nav.redirectEnd - nav.redirectStart) || 0,
      dnsMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart) || 0,
      tcpMs: Math.round(nav.connectEnd - nav.connectStart) || 0,
      requestMs: Math.round(nav.responseStart - nav.requestStart) || 0,
      ttfbMs: Math.round(nav.responseStart - nav.requestStart) || 0,
      responseMs: Math.round(nav.responseEnd - nav.responseStart) || 0,
      domInteractiveMs: Math.round(nav.domInteractive) || 0,
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd) || 0,
      loadMs: Math.round(loadEnd) || 0,
      firstPaintMs: firstPaint ? Math.round(firstPaint.startTime) : 0,
      firstContentfulPaintMs: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 0,
      transferSize: Math.round(nav.transferSize || 0),
      encodedBodySize: Math.round(nav.encodedBodySize || 0),
      decodedBodySize: Math.round(nav.decodedBodySize || 0),
      resourceCount: performance.getEntriesByType('resource').length,
    }, { beacon: false, remember: false });
  }

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      trackPagePerformance();
      performance.getEntriesByType('resource').forEach(trackResourceEntry);
    }, 0);
  });

  let pageState = null;
  let scrollFrame = 0;

  function measureScrollDepth() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
    const height = Math.max(
      doc.scrollHeight || 0,
      body.scrollHeight || 0,
      doc.offsetHeight || 0,
      body.offsetHeight || 0
    );
    const viewport = window.innerHeight || doc.clientHeight || 0;
    if (!height || height <= viewport) return 100;
    return Math.max(0, Math.min(100, Math.round(((scrollTop + viewport) / height) * 100)));
  }

  function initPageState(reason) {
    pageState = {
      page: currentPageFromLocation(),
      url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      title: document.title,
      startedAt: performance.now(),
      visibleStartedAt: document.visibilityState === 'visible' ? performance.now() : null,
      activeMs: 0,
      maxScrollDepth: measureScrollDepth(),
      reason,
    };
    track('page_view', {
      page: pageState.page,
      hash: window.location.hash || '',
      navigationReason: reason,
    }, { beacon: false });
    maybeTrackCheckoutSuccess();
  }

  function visibleActiveMs() {
    if (!pageState) return 0;
    const now = performance.now();
    const openVisibleMs = pageState.visibleStartedAt == null ? 0 : now - pageState.visibleStartedAt;
    return Math.max(0, Math.round(pageState.activeMs + openVisibleMs));
  }

  function finishPage(reason, options = {}) {
    if (!pageState) return;
    const durationMs = Math.max(0, Math.round(performance.now() - pageState.startedAt));
    const activeMs = visibleActiveMs();
    const event = track('page_duration', {
      page: pageState.page,
      url: pageState.url,
      title: pageState.title,
      durationMs,
      activeMs,
      scrollDepth: pageState.maxScrollDepth,
      exitReason: reason,
    }, { beacon: options.beacon !== false });

    if (!options.keepOpen) pageState = null;
    if (event.bottlenecks?.length) {
      track('journey_snapshot', {
        page: event.page,
        persona: event.persona,
        bottlenecks: event.bottlenecks,
        trigger: reason,
      }, { beacon: options.beacon !== false });
    }
  }

  function handleRouteChange(reason) {
    finishPage(reason);
    initPageState(reason);
  }

  const originalPushState = history.pushState;
  history.pushState = function () {
    finishPage('push_state');
    const result = originalPushState.apply(this, arguments);
    initPageState('push_state');
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    finishPage('replace_state');
    const result = originalReplaceState.apply(this, arguments);
    initPageState('replace_state');
    return result;
  };

  window.addEventListener('popstate', () => handleRouteChange('pop_state'));

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      if (pageState) pageState.maxScrollDepth = Math.max(pageState.maxScrollDepth, measureScrollDepth());
    });
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (!pageState) return;
    const now = performance.now();
    if (document.visibilityState === 'hidden') {
      if (pageState.visibleStartedAt != null) {
        pageState.activeMs += now - pageState.visibleStartedAt;
        pageState.visibleStartedAt = null;
      }
      track('visibility_pause', {
        page: pageState.page,
        durationMs: Math.max(0, Math.round(now - pageState.startedAt)),
        activeMs: Math.max(0, Math.round(pageState.activeMs)),
        scrollDepth: pageState.maxScrollDepth,
      });
      return;
    }
    pageState.visibleStartedAt = now;
    track('visibility_resume', { page: pageState.page }, { beacon: false });
  });

  window.addEventListener('pagehide', () => {
    finishPage('pagehide', { beacon: true });
    storageSet(LAST_SEEN_KEY, String(Date.now()));
  });

  window.addEventListener('beforeunload', () => {
    finishPage('beforeunload', { beacon: true });
    storageSet(LAST_SEEN_KEY, String(Date.now()));
  });

  window.setInterval(() => {
    if (!pageState || document.visibilityState !== 'visible') return;
    const activeMs = visibleActiveMs();
    if (activeMs < 5000) return;
    track('page_ping', {
      page: pageState.page,
      durationMs: Math.max(0, Math.round(performance.now() - pageState.startedAt)),
      activeMs,
      scrollDepth: pageState.maxScrollDepth,
    }, { beacon: false });
  }, 15000);

  function routeFromHref(href) {
    if (!href) return null;
    try {
      const url = new URL(href, window.location.origin);
      return url.searchParams.get('page') || (url.pathname === '/' ? 'home' : url.pathname.replace(/^\/+/, ''));
    } catch {
      return null;
    }
  }

  function textOf(node) {
    return String(node?.innerText || node?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  document.addEventListener('click', event => {
    const summary = event.target.closest?.('summary');
    if (summary) {
      track('faq_toggle', {
        label: textOf(summary),
        willOpen: !summary.parentElement?.open,
      });
      return;
    }

    const target = event.target.closest?.('a,button,.card,[role="button"]');
    if (!target) return;
    const label = textOf(target);
    const href = target.getAttribute?.('href') || '';
    const targetPage = routeFromHref(href);
    const className = String(target.className || '');
    const currentPage = currentPageFromLocation();
    const product = productFromPage(targetPage || currentPage);
    const lowerLabel = label.toLowerCase();

    if (className.includes('pd-buy') || lowerLabel.includes('buy & download')) {
      track('buy_click', {
        label,
        targetPage,
        ...product,
      });
      return;
    }

    if (href.startsWith('mailto:')) {
      track('lead_click', {
        label,
        href: href.split('?')[0],
        leadType: currentPage === 'services' ? 'service_brief' : 'support_email',
      });
      return;
    }

    if (targetPage && (targetPage.startsWith('plugin:') || targetPage.startsWith('lut:'))) {
      track('product_cta_click', {
        label,
        targetPage,
        ...product,
      });
      return;
    }

    if (targetPage && ['plugins', 'luts', 'portfolio', 'services', 'support', 'terms', 'refund', 'home'].includes(targetPage)) {
      track('navigation_click', {
        label,
        targetPage,
      });
      return;
    }

    if (href && /^https?:\/\//.test(href)) {
      try {
        const url = new URL(href);
        if (url.origin !== window.location.origin) {
          track('external_link_click', {
            label,
            destinationHost: url.hostname,
          });
        }
      } catch {}
    }
  }, true);

  function maybeTrackReturnVisit() {
    const lastSeen = parseInt(storageGet(LAST_SEEN_KEY) || '0', 10);
    const now = Date.now();
    if (lastSeen && now - lastSeen > RETURN_GAP_MS) {
      track('return_visit', {
        returningVisitor: true,
        gapMs: now - lastSeen,
      }, { beacon: false });
    }
    storageSet(LAST_SEEN_KEY, String(now));
  }

  function maybeTrackCheckoutSuccess() {
    const page = currentPageFromLocation();
    if (page !== 'success') return;
    const params = new URLSearchParams(window.location.search);
    const sessionIdParam = params.get('session_id') || 'missing';
    const key = `alexgmov:checkoutSuccess:${sessionIdParam}`;
    if (sessionGet(key)) return;
    sessionSet(key, '1');
    track('checkout_success_view', {
      checkoutSessionPresent: sessionIdParam !== 'missing',
    }, { beacon: false });
  }

  maybeTrackReturnVisit();
  initPageState('initial_load');

  window.alexgAnalytics = {
    track,
    classifyJourney: () => classifyJourney(loadJourney(), null),
    personaDefinitions: PERSONA_DEFINITIONS,
    version: VERSION,
  };
})();
