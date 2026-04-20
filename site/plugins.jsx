// Plugins list + Plugin detail

const PLUGINS = [
  {
    id: 'youtube-downloader',
    name: 'YouTube Downloader',
    oneline: 'Pull reference clips into Premiere without leaving your timeline.',
    price: 9,
    version: '1.2.0',
    badge: 'NEW',
    variant: 'youtube-dl',
    what: 'Download YouTube videos from inside Premiere so you can reference, cut, and iterate faster.',
    who: 'Editors who grab references, temp clips, or inspiration during a session.',
    get: 'Self-contained Premiere extension · installer for Mac & Windows · quick start guide · free updates for 1 year.',
    install: [
      'Download the installer (.dmg for Mac, .exe for Windows).',
      'Close Premiere if it is currently running.',
      'Double-click the installer. Follow the two prompts.',
      'Reopen Premiere. Window → Extensions → YouTube Downloader.',
      'Paste any YouTube URL. Pick resolution. Hit Download.',
    ],
    specs: [
      'Adobe Premiere Pro 2024 (24.0) or later',
      'macOS 13+ · Windows 10/11',
      '~40 MB install · Network connection required for downloads',
      'Works with CPU & Apple Silicon',
    ],
  },
  {
    id: 'smart-cut',
    name: 'Smart Cut',
    oneline: 'Silence detection + jump-cut generator. One pass, clean timeline.',
    price: 19,
    version: '0.9.0 BETA',
    badge: 'BETA',
    variant: 'toolkit',
    what: 'Auto-detect silences in dialogue tracks and generate clean jump cuts across V1.',
    who: 'YouTubers, podcasters on video, and editors who cut a lot of talking-head content.',
    get: 'Premiere extension · presets for pace (tight/medium/loose) · 1 year of updates.',
    install: [
      'Download and run the installer.',
      'Restart Premiere if it was open.',
      'Open Window → Extensions → Smart Cut.',
      'Select a clip on V1 with audio on A1.',
      'Pick a preset. Click Analyze. Review. Apply.',
    ],
    specs: [
      'Premiere Pro 2024 (24.0)+',
      'macOS 13+ / Windows 10/11',
      'Requires ffmpeg (bundled)',
      'Beta: expect weekly updates',
    ],
  },
];

function PluginsList({ go }) {
  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Premiere plugins that do one thing well.</h1>
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
            <article key={p.id} className="card" onClick={() => go('plugin:' + p.id)} style={{ cursor: 'pointer' }}>
              <div className="card-media"><PremiereScreenshot variant={p.variant} /></div>
              <div className="card-body">
                <div className="card-eyebrow">
                  <span>v{p.version} · PLUGIN</span>
                  {p.badge && <span style={{ color: p.badge === 'NEW' ? 'var(--blue-ink)' : 'var(--orange-ink)' }}>● {p.badge}</span>}
                </div>
                <h3 className="card-title">{p.name}</h3>
                <p className="card-desc">{p.oneline}</p>
                <div className="card-foot">
                  <div className="card-price">${p.price}</div>
                  <span className="btn btn-secondary btn-sm">View <ArrowIcon /></span>
                </div>
              </div>
            </article>
          ))}
          {/* Empty slot. "max 5 ever" narrative */}
          <article className="card" style={{ borderStyle: 'dashed', background: 'var(--surface)', opacity: 0.7, display: 'grid', placeItems: 'center', minHeight: 280 }}>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>IN DEVELOPMENT</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, margin: '0 0 8px' }}>Plugin #3</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Next drop ships Q2.</p>
            </div>
          </article>
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
  const p = PLUGINS.find(x => x.id === id) || PLUGINS[0];
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

          <div className="pd-price-row">
            <div className="pd-price">${p.price}</div>
            <div className="pd-price-note">ONE-TIME · LIFETIME DOWNLOAD</div>
          </div>
          <button className="btn btn-primary btn-lg pd-buy"><DownloadIcon /> Buy &amp; Download</button>
          <div className="pd-reassure"><CheckIcon /> Instant download · 24h support reply · No refunds</div>

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
