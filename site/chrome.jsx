// Shared UI pieces. Nav, Footer, Buttons, Icons

const PlayIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 5v14l11-7z" fill="#0a0a0a" />
  </svg>
);
const ArrowIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const ShoppingBagIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 8H6" />
  </svg>
);
const DownloadIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12M6 9l6 6 6-6M4 21h16" />
  </svg>
);
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

function Nav({ page, go, overlay }) {
  const hrefFor = window.routeHref || ((id) => '#');
  const links = [
    { id: 'plugins', label: 'Plugins' },
    { id: 'luts', label: 'LUTs' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'services', label: 'Services' },
    { id: 'support', label: 'Support' },
  ];
  const handleProductsClick = (e) => {
    e.preventDefault();
    go('home', { target: 'featured-products' });
  };
  return (
    <nav className={"nav" + (overlay ? " nav-overlay" : "")}>
      <div className="nav-inner">
        <a className="brand" href={hrefFor('home')} onClick={(e) => { e.preventDefault(); go('home'); }}>
          <span className="brand-dot" />alexg.mov
        </a>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.id} href={hrefFor(l.id)} className={page === l.id ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); go(l.id); }}>{l.label}</a>
          ))}
        </div>
        <a className="nav-cta" href={hrefFor('home', 'featured-products')} onClick={handleProductsClick}>
          <span className="nav-cta-label">Shop products</span>
          <span className="nav-cta-icon"><ShoppingBagIcon /></span>
        </a>
      </div>
    </nav>
  );
}

function Footer({ go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <div className="foot-brand">alexg.mov</div>
            <p className="foot-tag">Filmmaker, editor, tool-maker. Plugins and LUTs for editors who want fewer clicks and faster turnaround.</p>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
              <a href="mailto:alex@alexg.mov">alex@alexg.mov</a>
            </div>
          </div>
          <div className="foot-col">
            <h5>Products</h5>
            <ul>
              <li><a href={hrefFor('plugins')} onClick={e => { e.preventDefault(); go('plugins'); }}>Plugins</a></li>
              <li><a href={hrefFor('luts')} onClick={e => { e.preventDefault(); go('luts'); }}>LUTs</a></li>
              <li><a href={hrefFor('services')} onClick={e => { e.preventDefault(); go('services'); }}>Services</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Channels</h5>
            <ul>
              <li><a href="https://www.instagram.com/alexg.mov/" target="_blank" rel="noreferrer">Instagram ↗</a></li>
              <li><a href="https://www.tiktok.com/@alexg.mov" target="_blank" rel="noreferrer">TikTok ↗</a></li>
              <li><a href="https://www.linkedin.com/in/alex-garrett-a21564243/" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Help</h5>
            <ul>
              <li><a href={hrefFor('support')} onClick={e => { e.preventDefault(); go('support'); }}>Support</a></li>
              <li><a href={hrefFor('terms')} onClick={e => { e.preventDefault(); go('terms'); }}>Terms</a></li>
              <li><a href={hrefFor('refund')} onClick={e => { e.preventDefault(); go('refund'); }}>Refund policy</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 alexg.mov</span>
          <span>Creative work and digital products.</span>
          <a href="https://www.instagram.com/alexg.mov/" target="_blank" rel="noreferrer">@alexg.mov ↗</a>
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Footer, PlayIcon, ArrowIcon, ShoppingBagIcon, DownloadIcon, CheckIcon });
