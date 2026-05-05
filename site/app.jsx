import React from 'react';
import { Analytics } from '@vercel/analytics/react';

// Main SPA shell. routing, tweaks, mounting

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

const routeChunkLoaders = {
  home: () => import('./home.jsx'),
  plugins: () => import('./plugins.jsx'),
  luts: () => import('./luts.jsx'),
  pages: () => import('./pages.jsx'),
};

const routeChunkCache = new Map();
const FIRST_VISIT_OFFER_CODE = 'HIFRIEND';
const FIRST_VISIT_OFFER_STORAGE_KEY = 'alexgmov:firstVisitOffer:v1';

function loadRouteChunk(chunk) {
  if (!routeChunkCache.has(chunk)) {
    routeChunkCache.set(chunk, routeChunkLoaders[chunk]());
  }
  return routeChunkCache.get(chunk);
}

function routeForPage(page) {
  if (page?.startsWith('plugin:')) {
    return { chunk: 'plugins', componentName: 'PluginDetail', id: page.slice(7) };
  }
  if (page?.startsWith('lut:')) {
    return { chunk: 'luts', componentName: 'LutDetail', id: page.slice(4) };
  }

  const routes = {
    home: { chunk: 'home', componentName: 'Home' },
    plugins: { chunk: 'plugins', componentName: 'PluginsList' },
    luts: { chunk: 'luts', componentName: 'LutsList' },
    portfolio: { chunk: 'pages', componentName: 'Portfolio' },
    services: { chunk: 'pages', componentName: 'Services' },
    support: { chunk: 'pages', componentName: 'Support' },
    success: { chunk: 'pages', componentName: 'CheckoutSuccess' },
    terms: { chunk: 'pages', componentName: 'Terms' },
    refund: { chunk: 'pages', componentName: 'Refund' },
  };

  return routes[page] || routes.home;
}

function readFirstVisitOffer() {
  try {
    return JSON.parse(localStorage.getItem(FIRST_VISIT_OFFER_STORAGE_KEY) || 'null') || {};
  } catch {
    return {};
  }
}

function writeFirstVisitOffer(patch) {
  try {
    const current = readFirstVisitOffer();
    localStorage.setItem(FIRST_VISIT_OFFER_STORAGE_KEY, JSON.stringify({
      ...current,
      ...patch,
      code: FIRST_VISIT_OFFER_CODE,
      updatedAt: Date.now(),
    }));
  } catch {}
}

function getFirstVisitOfferToken() {
  const saved = readFirstVisitOffer();
  return saved?.state === 'claimed' && saved.offerToken ? saved.offerToken : '';
}

function getFirstVisitOfferEmail() {
  const saved = readFirstVisitOffer();
  return saved?.state === 'claimed' && saved.email ? saved.email : '';
}

function isOfferSuppressed() {
  const saved = readFirstVisitOffer();
  return ['shown', 'dismissed', 'claimed'].includes(saved?.state);
}

function CopyIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function FirstVisitOffer({ page }) {
  const [visible, setVisible] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  const [message, setMessage] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const claimed = status === 'claimed';

  React.useEffect(() => {
    if (isOfferSuppressed()) return undefined;
    if (String(page || '').startsWith('success')) return undefined;

    let didShow = false;
    const show = () => {
      if (didShow || isOfferSuppressed()) return;
      didShow = true;
      writeFirstVisitOffer({ state: 'shown', shownAt: Date.now() });
      setVisible(true);
    };

    const delayMs = String(page || '').startsWith('lut') ? 4200 : 7200;
    const timer = window.setTimeout(show, delayMs);
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if ((window.scrollY / maxScroll) > 0.35) show();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [page]);

  React.useEffect(() => {
    if (!visible) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeOffer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  if (!visible) return null;

  function closeOffer() {
    writeFirstVisitOffer({ state: claimed ? 'claimed' : 'dismissed', dismissedAt: Date.now() });
    setVisible(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(FIRST_VISIT_OFFER_CODE);
    } catch {
      const node = document.createElement('textarea');
      node.value = FIRST_VISIT_OFFER_CODE;
      node.setAttribute('readonly', '');
      node.style.position = 'fixed';
      node.style.opacity = '0';
      document.body.appendChild(node);
      node.select();
      document.execCommand('copy');
      document.body.removeChild(node);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setMessage('Enter your email first.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          page,
          path: `${location.pathname}${location.search}${location.hash}`,
          referrer: document.referrer || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.offerToken) throw new Error(data.error || 'Could not unlock offer');
      writeFirstVisitOffer({
        state: 'claimed',
        claimedAt: Date.now(),
        email: value,
        offerToken: data.offerToken,
      });
      setStatus('claimed');
      setMessage('');
      copyCode();
    } catch (err) {
      setStatus('idle');
      setMessage(err.message || 'Could not unlock offer. Try again.');
    }
  }

  return (
    <aside className="first-offer" role="dialog" aria-label="First visit discount" aria-live="polite">
      <button type="button" className="first-offer-close" aria-label="Close offer" onClick={closeOffer}>
        <span aria-hidden="true">×</span>
      </button>
      {!claimed ? (
        <form className="first-offer-body" onSubmit={handleSubmit}>
          <p className="first-offer-kicker">First visit unlock</p>
          <h2>Take 10% off the LUT shop.</h2>
          <p className="first-offer-copy">Drop your email for the private code.</p>
          <label className="first-offer-field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              onChange={event => setEmail(event.target.value)}
              disabled={status === 'loading'}
            />
          </label>
          {message && <p className="first-offer-error">{message}</p>}
          <button type="submit" className="first-offer-submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Unlocking' : 'Unlock'}
          </button>
        </form>
      ) : (
        <div className="first-offer-body first-offer-success">
          <p className="first-offer-kicker">You're in</p>
          <h2>Your promo code</h2>
          <button type="button" className="first-offer-code" onClick={copyCode} aria-label={`Copy discount code ${FIRST_VISIT_OFFER_CODE}`}>
            <span>{FIRST_VISIT_OFFER_CODE}</span>
            <span className="first-offer-copy-action">
              <span className={`first-offer-copied ${copied ? 'is-visible' : ''}`}>Copied</span>
              <CopyIcon />
            </span>
          </button>
          <p className="first-offer-copy">The discount will auto apply at checkout from this browser.</p>
        </div>
      )}
    </aside>
  );
}

function RouteContent({ page, go, onLoaded }) {
  const route = React.useMemo(() => routeForPage(page), [page]);
  const [state, setState] = React.useState({
    page: null,
    Component: null,
    error: null,
  });

  React.useEffect(() => {
    let alive = true;

    setState(prev => (
      prev.page === page && prev.Component
        ? prev
        : { page, Component: null, error: null }
    ));

    loadRouteChunk(route.chunk)
      .then(() => {
        const Component = window[route.componentName];
        if (!Component) throw new Error(`Route component ${route.componentName} did not register`);
        if (!alive) return;
        setState({ page, Component, error: null });
        onLoaded(page);
      })
      .catch(error => {
        console.error(error);
        if (alive) setState({ page, Component: null, error });
      });

    return () => { alive = false; };
  }, [page, route.chunk, route.componentName, onLoaded]);

  if (state.error) {
    return (
      <main className="route-state">
        <div className="wrap">
          <p>Something went wrong loading this page. Refresh and try again.</p>
        </div>
      </main>
    );
  }

  if (!state.Component) {
    return (
      <main className="route-state" aria-live="polite">
        <div className="wrap">
          <p>Loading.</p>
        </div>
      </main>
    );
  }

  return <state.Component id={route.id} go={go} />;
}

export function prefetchRoute(page) {
  return loadRouteChunk(routeForPage(page).chunk);
}

export function App({ initialPage, embedded }) {
  const [page, setPage] = React.useState(initialPage || 'home');
  const [theme, setTheme] = React.useState(TWEAK_DEFAULTS.theme);
  const [editMode, setEditMode] = React.useState(false);
  const [pendingScrollTarget, setPendingScrollTarget] = React.useState(null);
  const [loadedPage, setLoadedPage] = React.useState(null);
  const handleRouteLoaded = React.useCallback((loaded) => setLoadedPage(loaded), []);

  // Keep SPA state, URL, and metadata in sync for shareable/crawlable pages.
  React.useEffect(() => {
    if (embedded) return;
    const onPopState = () => {
      const qs = new URLSearchParams(location.search);
      setPage(qs.get('page') || 'home');
      setPendingScrollTarget(location.hash ? location.hash.slice(1) : null);
    };
    window.addEventListener('popstate', onPopState);
    if (location.hash) setPendingScrollTarget(location.hash.slice(1));
    return () => window.removeEventListener('popstate', onPopState);
  }, [embedded]);

  React.useEffect(() => {
    if (!embedded) localStorage.setItem('alexgmov:page', page);
  }, [page, embedded]);
  React.useEffect(() => {
    if (!embedded && loadedPage === page && window.applyPageSeo) window.applyPageSeo(page);
  }, [page, loadedPage, embedded]);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (!embedded) localStorage.setItem('alexgmov:theme', theme);
  }, [theme]);

  React.useEffect(() => {
    if (loadedPage !== page) return undefined;
    if (!pendingScrollTarget) return undefined;
    let rafA = 0;
    let rafB = 0;
    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        const node = document.getElementById(pendingScrollTarget);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingScrollTarget(null);
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [page, loadedPage, pendingScrollTarget]);

  // Tweaks
  React.useEffect(() => {
    if (embedded) return;
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEditMode(true);
      if (d.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const go = (p, options = {}) => {
    const [nextPage, inlineTarget] = String(p).split('#');
    const target = options.target || inlineTarget || null;
    setPendingScrollTarget(target);
    setPage(nextPage);
    if (!embedded && window.routeHref) {
      const href = window.routeHref(nextPage, target);
      const current = `${location.pathname}${location.search}${location.hash}`;
      if (href !== current) history.pushState({ page: nextPage, target }, '', href);
    }
    if (!target) window.scrollTo(0, 0);
  };
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (!embedded) window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: next } }, '*');
  };

  return (
    <>
      <Nav page={page.split(':')[0]} go={go} />
      <RouteContent page={page} go={go} onLoaded={handleRouteLoaded} />
      <Footer go={go} />
      <MobileBottomNav page={page} go={go} />
      {!embedded && <FirstVisitOffer page={page} />}
      {!embedded && <Analytics />}
      {!embedded && (
        <div className={"tweaks " + (editMode ? 'on' : '')}>
          <div className="tweaks-title">TWEAKS</div>
          <div className="tweaks-row">
            <label>Dark mode</label>
            <div className={"switch " + (theme === 'dark' ? 'on' : '')} onClick={toggleTheme} />
          </div>
        </div>
      )}
    </>
  );
}

Object.assign(window, { App, getFirstVisitOfferEmail, getFirstVisitOfferToken });
