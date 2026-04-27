import React from 'react';

// Plugins list + Plugin detail

const PLUGINS = window.PLUGINS || [
  {
    id: 'flowstate',
    name: 'FlowState',
    oneline: 'Search Premiere footage by meaning, not filenames.',
    price: 28,
    version: '1.0.0',
    badge: 'RELEASED',
    status: 'released',
    variant: 'ai-media-browser',
    what: 'FlowState scans a bin, analyzes clips with Gemini, and builds a searchable catalog.',
    who: 'Editors sorting A-roll, B-roll, transcripts, lighting, motion, and shot details across raw media.',
    get: 'Premiere panel · Gemini workflow · searchable catalog.json · results bin.',
    install: [
      'Download the installer (.dmg for Mac, .exe for Windows).',
      'Close Premiere if it is currently running.',
      'Double-click the installer. Follow the two prompts.',
      'Reopen Premiere. Window → Extensions → FlowState.',
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
    name: 'Demon Clip',
    oneline: 'A faster way to carve long sessions into usable selects.',
    price: null,
    version: 'COMING SOON',
    badge: 'COMING SOON',
    status: 'coming-soon',
    variant: 'toolkit',
    what: 'Demon Clip turns long raw sessions into tight selects before the edit.',
    who: 'Editors cutting interviews, multicam podcasts, and long creator shoots.',
    get: 'Premiere extension for Mac and Windows · launch list early access.',
    install: [
      'Join the launch list.',
      'Get the release email when Demon Clip ships.',
      'Download the installer for Mac or Windows.',
      'Open Window → Extensions → Demon Clip in Premiere.',
      'Start clipping down long sessions into selects.',
    ],
    specs: [
      'Premiere Pro 2024 (24.0)+',
      'macOS 13+ / Windows 10/11',
      'Release timing: 2026',
      'In active development',
    ],
  },
];

const PLUGIN_GUIDE_ITEMS = [
  {
    title: 'Best for AI footage search',
    body: 'Find clips by what is in them, not what they are called.',
  },
  {
    title: 'Best for long shoots',
    body: 'Use it on interviews, B-roll, product demos, creator sessions, and launch edits.',
  },
  {
    title: 'Best for Premiere-first workflows',
    body: 'Search stays inside Premiere, close to the timeline.',
  },
];

const PLUGIN_FAQS = window.PLUGIN_FAQS || [
  {
    q: 'What is the best Premiere Pro plugin for searching footage by meaning?',
    a: 'FlowState analyzes selected bins, builds clip metadata, and lets editors search by content instead of filename.',
  },
  {
    q: 'Does FlowState replace a normal editing workflow?',
    a: 'No. It helps you find and organize footage faster. You still make the edit decisions.',
  },
  {
    q: 'Who should use an AI media browser plugin?',
    a: 'Editors with large bins, interviews, B-roll, product footage, launches, and creator shoots.',
  },
];

const PLUGIN_DETAIL_FAQS = window.PLUGIN_DETAIL_FAQS || [
  {
    q: 'What does FlowState do in Premiere Pro?',
    a: 'It scans selected bins with AI and turns clip details into searchable metadata.',
  },
  {
    q: 'What does FlowState help me find?',
    a: 'A-roll, B-roll, shot type, motion, lighting, subject matter, and clip context.',
  },
  {
    q: 'What software do I need?',
    a: 'FlowState is built for Adobe Premiere Pro 2024 or later on macOS 13+ or Windows 10/11. Gemini API access is required for analysis.',
  },
];

function PluginsList({ go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Plugins that do one thing well.</h1>
          <p>Small Premiere tools for deadlines. No round-trips, no web apps.</p>
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
          {PLUGINS.map(p => {
            const released = p.status === 'released';
            return (
              <article
                key={p.id}
                className={"card plugin-card" + (released ? '' : ' plugin-card-locked')}
                onClick={released ? () => go('plugin:' + p.id) : undefined}
                aria-disabled={released ? undefined : 'true'}
              >
                {released ? (
                  <>
                    <div className="card-media"><PremiereScreenshot variant={p.variant} /></div>
                    <div className="card-body">
                      <div className="card-eyebrow">
                        <span>v{p.version} · PLUGIN</span>
                        {p.badge && <span style={{ color: 'var(--blue-ink)' }}>● {p.badge}</span>}
                      </div>
                      <h3 className="card-title">{p.name}</h3>
                      <p className="card-desc">{p.oneline}</p>
                      <div className="card-foot">
                        <div className="card-price">${p.price}</div>
                        <a
                          className="btn btn-secondary btn-sm"
                          href={hrefFor('plugin:' + p.id)}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); go('plugin:' + p.id); }}
                        >
                          View <ArrowIcon />
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="plugin-locked-content">
                    <div className="plugin-locked-status">Coming Soon</div>
                    <h3 className="plugin-locked-title">{p.name}</h3>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <BuyerGuide
        eyebrow="PLUGIN BUYER GUIDE"
        title="Choose the right Premiere plugin."
        intro="Each plugin solves one editing bottleneck inside Premiere."
        items={PLUGIN_GUIDE_ITEMS}
        faqs={PLUGIN_FAQS}
      />
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
  const buyButtonRef = React.useRef(null);
  const showStickyCta = useStickyCta(buyButtonRef);
  const hrefFor = window.routeHref || ((id) => '#');
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
        <a href={hrefFor('home')} onClick={e => { e.preventDefault(); go('home'); }}>Home</a> <span>/</span>
        <a href={hrefFor('plugins')} onClick={e => { e.preventDefault(); go('plugins'); }}>Plugins</a> <span>/</span>
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
            ? <button ref={buyButtonRef} className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying}>
                <DownloadIcon />
                <span className="cta-copy-desktop">{buying ? 'Redirecting…' : 'Buy & Download'}</span>
                <span className="cta-copy-mobile">{buying ? 'Redirecting…' : 'Download Now'}</span>
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

      <BuyerGuide
        contained
        eyebrow="BEST USE CASES"
        title={`${p.name} helps you find the right clip faster.`}
        intro="Built for long sessions, mixed bins, and generic camera names."
        items={[
          {
            title: 'Interview and talking-head projects',
            body: 'Search by moment, subject, or visual detail without scrubbing the shoot again.',
          },
          {
            title: 'B-roll and product footage libraries',
            body: 'Find shots by frame content, motion, or context.',
          },
          {
            title: 'Launch films and deadline edits',
            body: 'Surface usable options quickly without leaving Premiere.',
          },
        ]}
        faqs={PLUGIN_DETAIL_FAQS}
      />

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
      <MobileProductStickyCta
        active={p.status === 'released' && showStickyCta && !purchased}
        productName={p.name}
        productMeta="Premiere plugin · instant email"
        price={p.price != null ? `$${p.price}` : 'Soon'}
        actionLabel={buying ? 'Redirecting…' : 'Download Now'}
        onAction={handleBuy}
        disabled={buying}
      />
    </div>
  );
}

Object.assign(window, { PluginsList, PluginDetail, PLUGINS, PLUGIN_FAQS, PLUGIN_DETAIL_FAQS });
