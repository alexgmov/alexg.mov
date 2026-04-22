// Main SPA shell. routing, tweaks, mounting

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

function App({ initialPage, embedded }) {
  const [page, setPage] = React.useState(initialPage || 'home');
  const [theme, setTheme] = React.useState(TWEAK_DEFAULTS.theme);
  const [editMode, setEditMode] = React.useState(false);

  // Persist & restore
  React.useEffect(() => {
    if (embedded) return;
    const saved = localStorage.getItem('alexgmov:page');
    if (saved) setPage(saved);
  }, []);
  React.useEffect(() => {
    if (!embedded) localStorage.setItem('alexgmov:page', page);
  }, [page]);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (!embedded) localStorage.setItem('alexgmov:theme', theme);
  }, [theme]);

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

  const go = (p) => { setPage(p); window.scrollTo(0, 0); };
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (!embedded) window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: next } }, '*');
  };

  let content = null;
  if (page === 'home') content = <Home go={go} />;
  else if (page === 'plugins') content = <PluginsList go={go} />;
  else if (page === 'luts') content = <LutsList go={go} />;
  else if (page === 'portfolio') content = <Portfolio go={go} />;
  else if (page === 'services') content = <Services go={go} />;
  else if (page === 'support') content = <Support go={go} />;
  else if (page === 'terms') content = <Terms />;
  else if (page === 'refund') content = <Refund />;
  else if (page.startsWith('plugin:')) content = <PluginDetail id={page.slice(7)} go={go} />;
  else if (page.startsWith('lut:')) content = <LutDetail id={page.slice(4)} go={go} />;

  return (
    <>
      <Nav page={page.split(':')[0]} go={go} overlay={page === 'home'} />
      {content}
      <Footer go={go} />
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

// Mount if #root exists on this page
if (document.getElementById('root')) {
  const qs = new URLSearchParams(location.search);
  const initial = qs.get('page') || 'home';
  const embedded = qs.get('embedded') === '1';
  document.documentElement.setAttribute('data-theme', TWEAK_DEFAULTS.theme);
  ReactDOM.createRoot(document.getElementById('root')).render(<App initialPage={initial} embedded={embedded} />);
}
