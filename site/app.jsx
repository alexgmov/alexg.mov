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

Object.assign(window, { App });
