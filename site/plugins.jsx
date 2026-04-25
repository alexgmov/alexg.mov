// Plugins list + Plugin detail

const PLUGINS = [
  {
    id: 'flowstate',
    name: 'AI Media Browser',
    oneline: 'Analyze Premiere bin footage with AI, then search clips by meaning instead of filenames.',
    price: 28,
    version: '1.0.0',
    badge: 'RELEASED',
    status: 'released',
    variant: 'ai-media-browser',
    what: 'AI Media Browser scans a selected bin subtree, uploads clips to Gemini, extracts qualitative footage metadata, and builds a semantic search catalog.',
    who: 'Editors who need to find useful A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'Premiere CEP panel · Gemini Files API workflow · searchable catalog.json · non-destructive Premiere results bin.',
    install: [
      'Download the installer (.dmg for Mac, .exe for Windows).',
      'Close Premiere if it is currently running.',
      'Double-click the installer. Follow the two prompts.',
      'Reopen Premiere. Window → Extensions → AI Media Browser.',
      'Select a bin subtree, run analysis, then search and send matches to a results bin.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      'Gemini API access required',
      'Writes data/catalog.json',
    ],
  },
  {
    id: 'demonclipper',
    name: 'DemonClipper Coming Soon',
    oneline: 'A faster way to carve long sessions into usable selects.',
    price: null,
    version: 'COMING SOON',
    badge: 'COMING SOON',
    status: 'coming-soon',
    variant: 'toolkit',
    what: 'DemonClipper is built for turning long raw sessions into tighter selects before the real edit begins.',
    who: 'Editors working through interviews, multicam podcasts, and long-form creator shoots.',
    get: 'Premiere extension for Mac & Windows · early access for launch list subscribers.',
    install: [
      'Join the launch list.',
      'Get the release email when DemonClipper ships.',
      'Download the installer for Mac or Windows.',
      'Open Window → Extensions → DemonClipper in Premiere.',
      'Start clipping down long sessions into selects.',
    ],
    specs: [
      'Premiere Pro 2024 (24.0)+',
      'macOS 13+ / Windows 10/11',
      'Release timing: 2026',
      'Launch build is in active development',
    ],
  },
];

function PluginsList({ go }) {
  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Plugins that do one thing well.</h1>
          <p>Small, focused tools that live inside Premiere. No round-tripping, no web apps. Built for editors on deadlines.</p>
          <div className="list-meta">
            <span>{PLUGINS.length} PLUGINS</span>
            <span>·</span>
            <span>MAC + WINDOWS</span>
            <span>·</span>
            <span>PREMIERE 2024+</span>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="list-grid">
          {PLUGINS.map(p => (
            <article
              key={p.id}
              className="card"
              onClick={p.status === 'released' ? () => go('plugin:' + p.id) : undefined}
              style={{ cursor: p.status === 'released' ? 'pointer' : 'default' }}
            >
              <div className="card-media"><PremiereScreenshot variant={p.variant} /></div>
              <div className="card-body">
                <div className="card-eyebrow">
                  <span>v{p.version} · PLUGIN</span>
                  {p.badge && <span style={{ color: p.status === 'released' ? 'var(--blue-ink)' : 'var(--orange-ink)' }}>● {p.badge}</span>}
                </div>
                <h3 className="card-title">{p.name}</h3>
                <p className="card-desc">{p.oneline}</p>
                <div className="card-foot">
                  <div className="card-price">{p.price != null ? `$${p.price}` : 'Soon'}</div>
                  {p.status === 'released'
                    ? <span className="btn btn-secondary btn-sm">View <ArrowIcon /></span>
                    : <span className="btn btn-secondary btn-sm">Coming Soon</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <section className="section-sm">
        <div className="wrap">
          <p className="section-title">HOW IT WORKS</p>
          <div className="how">
            <div className="how-item">
              <div className="how-num">01 / BUY ONCE</div>
              <h4 className="how-h">Instant checkout</h4>
              <p className="how-p">No subscriptions. No seats. Pay once, download immediately.</p>
            </div>
            <div className="how-item">
              <div className="how-num">02 / INSTALL FAST</div>
              <h4 className="how-h">Double-click installer</h4>
              <p className="how-p">Signed installers for Mac and Windows. Under 60 seconds from download to open.</p>
            </div>
            <div className="how-item">
              <div className="how-num">03 / EDIT FASTER</div>
              <h4 className="how-h">Lives in your workflow</h4>
              <p className="how-p">Tools dock inside Premiere. No web apps, no round-tripping, no account required.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PluginDetail({ id, go }) {
  const [thumb, setThumb] = React.useState(0);
  const [buying, setBuying] = React.useState(false);
  const purchased = new URLSearchParams(location.search).get('purchased') === 'true';
  const p = PLUGINS.find(x => x.id === id) || PLUGINS[0];

  async function handleBuy() {
    setBuying(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: p.id }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again or email alex@alexg.mov.');
      setBuying(false);
    }
  }
  return (
    <div className="wrap">
      <div className="pd-crumbs">
        <a href="#" onClick={e => { e.preventDefault(); go('home'); }}>Home</a> <span>/</span>
        <a href="#" onClick={e => { e.preventDefault(); go('plugins'); }}>Plugins</a> <span>/</span>
        <span style={{ color: 'var(--ink)' }}>{p.name}</span>
      </div>
      <div className="pd-hero">
        <div>
          <div className="pd-media">
            <PremiereScreenshot variant={p.variant} scale={1.2} />
            {/* play overlay */}
            {thumb === 0 && (
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5))',
              }}>
                <div className="reel-play-btn" style={{ width: 56, height: 56 }}><PlayIcon size={20} /></div>
              </div>
            )}
            <div className="reel-meta">
              <span>DEMO · 42s</span>
            </div>
          </div>
          <div className="pd-thumbs">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={"pd-thumb " + (thumb === i ? 'active' : '')} onClick={() => setThumb(i)}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {i === 0 && <PremiereScreenshot variant={p.variant} scale={0.4} />}
                  {i === 1 && <LutPreview tone="clean" scale={0.4} />}
                  {i === 2 && <PortfolioStill seed={2} />}
                  {i === 3 && <PortfolioStill seed={6} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-tag"><span className="pd-tag-dot" /> PREMIERE PLUGIN · v{p.version}</div>
          <h1>{p.name}</h1>
          <p className="pd-benefit">{p.oneline}</p>

          {purchased && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '14px 16px', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>Purchase confirmed.</strong>
              <span style={{ color: 'var(--muted)' }}> Check your email for the download link (valid 48 hours). Check spam if it doesn't arrive within a few minutes.</span>
            </div>
          )}
          <div className="pd-price-row">
            <div className="pd-price">{p.price != null ? `$${p.price}` : 'Soon'}</div>
            <div className="pd-price-note">{p.status === 'released' ? 'ONE-TIME · LIFETIME DOWNLOAD' : 'IN DEVELOPMENT · LAUNCH LIST OPEN'}</div>
          </div>
          {p.status === 'released'
            ? <button className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying}>
                <DownloadIcon /> {buying ? 'Redirecting…' : 'Buy & Download'}
              </button>
            : <button className="btn btn-secondary btn-lg pd-buy">Join Launch List</button>}
          <div className="pd-reassure"><CheckIcon /> {p.status === 'released' ? 'Instant download via email · 24h support reply' : 'Shipping updates posted as development continues'}</div>

          <div className="pd-bullets">
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT IT DOES</div><div className="pd-bullet-v">{p.what}</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHO IT'S FOR</div><div className="pd-bullet-v">{p.who}</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT YOU GET</div><div className="pd-bullet-v">{p.get}</div></div>
          </div>
        </div>
      </div>

      <div className="pd-blocks" style={{ paddingBottom: 72 }}>
        <div className="pd-block">
          <h3>Install steps</h3>
          <ol>{p.install.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
        <div className="pd-block">
          <h3>Compatibility</h3>
          <ul>{p.specs.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface)', borderRadius: 6, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
            Hit an install bug? Email <a href="mailto:alex@alexg.mov" style={{ color: 'var(--ink)', fontFamily: 'var(--mono)' }}>alex@alexg.mov</a>. Reply within 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PluginsList, PluginDetail, PLUGINS });
