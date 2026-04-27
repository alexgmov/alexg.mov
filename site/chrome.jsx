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
        <a className="nav-cta" href={hrefFor('home', 'featured-products')} aria-label="Shop products" onClick={handleProductsClick}>
          <span className="nav-cta-text">Shop products</span>
          <span style={{ opacity: 0.65 }}><ShoppingBagIcon /></span>
        </a>
      </div>
    </nav>
  );
}

function MobileBottomNav({ page, go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  const pageKey = String(page || 'home').split(':')[0];
  const isProductDetail = String(page || '').startsWith('plugin:') || String(page || '').startsWith('lut:');
  if (isProductDetail) return null;

  const items = [
    { id: 'services', label: 'Services', helper: 'Brief' },
    { id: 'portfolio', label: 'Portfolio', helper: 'Work' },
    { id: 'plugins', label: 'Plugins', helper: 'Tools' },
    { id: 'luts', label: 'LUTs', helper: 'Color' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      <svg className="mobile-liquid-glass-defs" width="0" height="0" focusable="false" aria-hidden="true">
        <filter id="mobile-nav-liquid-glass" x="-8%" y="-28%" width="116%" height="156%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.024" numOctaves="1" seed="9" result="navLiquidNoise" />
          <feGaussianBlur in="navLiquidNoise" stdDeviation="1.1" result="navLiquidSoftNoise" />
          <feDisplacementMap in="SourceGraphic" in2="navLiquidSoftNoise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="mobile-bottom-nav-inner">
        {items.map(item => {
          const active = pageKey === item.id;
          const href = hrefFor(item.id);
          return (
            <a
              key={item.label}
              className={"mobile-bottom-nav-item" + (active ? " active" : "")}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
            >
              <span className="mobile-bottom-nav-dot" aria-hidden="true" />
              <span className="mobile-bottom-nav-copy">
                <span className="mobile-bottom-nav-label">{item.label}</span>
                <span className="mobile-bottom-nav-helper">{item.helper}</span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function useStickyCta(anchorRef) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === 'undefined') return undefined;

    const media = window.matchMedia('(max-width: 720px)');
    const updateFromRect = () => {
      const rect = anchor.getBoundingClientRect();
      setVisible(media.matches && rect.bottom < 0);
    };

    updateFromRect();

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => setVisible(media.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0),
        { threshold: 0, rootMargin: '0px 0px -72px 0px' }
      );
      observer.observe(anchor);
    } else {
      window.addEventListener('scroll', updateFromRect, { passive: true });
    }

    const onMediaChange = () => updateFromRect();
    if (media.addEventListener) media.addEventListener('change', onMediaChange);
    else media.addListener(onMediaChange);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', updateFromRect);
      if (media.removeEventListener) media.removeEventListener('change', onMediaChange);
      else media.removeListener(onMediaChange);
    };
  }, [anchorRef]);

  return visible;
}

function MobileProductStickyCta({ active, productName, productMeta, price, actionLabel, onAction, disabled }) {
  return (
    <div className={"mobile-product-cta" + (active ? " show" : "")} aria-hidden={active ? undefined : 'true'}>
      <div className="mobile-product-cta-copy">
        <span className="mobile-product-cta-name">{productName}</span>
        <span className="mobile-product-cta-meta">{productMeta}</span>
      </div>
      <div className="mobile-product-cta-actions">
        <span className="mobile-product-cta-price">{price}</span>
        <button type="button" className="btn btn-primary mobile-product-cta-button" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </button>
      </div>
    </div>
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
            <p className="foot-tag">Filmmaker, editor, tool-maker. Plugins and LUTs for faster edits and cleaner color.</p>
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
          <span>Creative work and editor tools.</span>
          <a href="https://www.instagram.com/alexg.mov/" target="_blank" rel="noreferrer">@alexg.mov ↗</a>
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, MobileBottomNav, useStickyCta, MobileProductStickyCta, Footer, PlayIcon, ArrowIcon, ShoppingBagIcon, DownloadIcon, CheckIcon });
