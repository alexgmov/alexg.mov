// LUTs list + LUT detail

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'Cinematic Pack Vol. 01',
    oneline: 'Ten hand-calibrated looks for narrative work.',
    price: 24,
    count: 10,
    formats: '.CUBE · .LOOK',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    looks: ['Night Teal', 'Orange Glow', 'Dusk Fog', 'Clean Neutral', 'Warm Film', 'Cold Steel', 'Golden Hour', 'Mid-Afternoon', 'Interior Soft', 'Blue Hour'],
  },
  {
    id: 'street-02',
    name: 'Street Pack Vol. 02',
    oneline: 'Gritty, moody looks built for documentary and b-roll.',
    price: 19,
    count: 8,
    formats: '.CUBE · .LOOK',
    tone: 'moody-blue',
    looks: ['Wet Asphalt', 'Rainy Neon', 'Alley Blue', 'Morning Haze', 'Subway Glow', 'Late Night', 'Concrete', 'Brick & Rust'],
  },
  {
    id: 'warm-film-03',
    name: 'Warm Film Vol. 03',
    oneline: 'Kodak-inspired warmth for lifestyle and brand work.',
    price: 19,
    count: 8,
    formats: '.CUBE · .LOOK',
    tone: 'warm-film',
    looks: ['Portra Light', 'Ektar Gold', 'Faded 200', 'Sunset 400', 'Beach Warm', 'Paper Ivory', 'Gold Leaf', 'Peach'],
  },
];

function LutsList({ go }) {
  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>LUTs that actually sit on the shot.</h1>
          <p>Calibrated on real cameras: S-Log3, V-Log, LOG-C, Rec.709. No neon overreach, no crushed shadows.</p>
          <div className="list-meta">
            <span>{LUTS.length} PACKS</span>
            <span>·</span>
            <span>.CUBE + .LOOK FORMATS</span>
            <span>·</span>
            <span>PREMIERE · DAVINCI · FINAL CUT</span>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="list-grid">
          {LUTS.map(l => (
            <article key={l.id} className="card" onClick={() => go('lut:' + l.id)} style={{ cursor: 'pointer' }}>
              <div className="card-media"><LutPreview tone={l.tone} /></div>
              <div className="card-body">
                <div className="card-eyebrow">
                  <span>{l.count} LOOKS · {l.formats}</span>
                  {l.badge && <span style={{ color: 'var(--orange-ink)' }}>★ {l.badge}</span>}
                </div>
                <h3 className="card-title">{l.name}</h3>
                <p className="card-desc">{l.oneline}</p>
                <div className="card-foot">
                  <div className="card-price">${l.price}</div>
                  <span className="btn btn-secondary btn-sm">View <ArrowIcon /></span>
                </div>
              </div>
            </article>
          ))}
          <article className="card" style={{ borderStyle: 'dashed', background: 'var(--surface)', opacity: 0.7, display: 'grid', placeItems: 'center', minHeight: 280 }}>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>IN DEVELOPMENT</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, margin: '0 0 8px' }}>Pack Vol. 04</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Interior and natural light. Q2.</p>
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

function LutDetail({ id, go }) {
  const [active, setActive] = React.useState(0);
  const l = LUTS.find(x => x.id === id) || LUTS[0];
  const tones = ['teal-orange', 'moody-blue', 'warm-film', 'clean', 'neon'];
  return (
    <div className="wrap">
      <div className="pd-crumbs">
        <a href="#" onClick={e => { e.preventDefault(); go('home'); }}>Home</a> <span>/</span>
        <a href="#" onClick={e => { e.preventDefault(); go('luts'); }}>LUTs</a> <span>/</span>
        <span style={{ color: 'var(--ink)' }}>{l.name}</span>
      </div>
      <div className="pd-hero">
        <div>
          <div className="pd-media">
            <LutPreview tone={tones[active % tones.length]} scale={1.4} />
            <div className="reel-meta">
              <span>BEFORE / AFTER</span>
              <span style={{ opacity: 0.6 }}>{l.looks[active]}</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>BROWSE LOOKS · {l.count}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {l.looks.map((n, i) => (
                <div key={i} onClick={() => setActive(i)} style={{
                  aspectRatio: '4/3', borderRadius: 4,
                  border: '1px solid ' + (active === i ? 'var(--ink)' : 'var(--hairline)'),
                  overflow: 'hidden', position: 'relative', cursor: 'pointer',
                }}>
                  <LutPreview tone={tones[i % tones.length]} scale={0.3} />
                  <div style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: '#fff', fontFamily: 'var(--mono)', fontSize: 9,
                    padding: '8px 6px 4px', textAlign: 'center',
                  }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-tag"><span className="pd-tag-dot" style={{ background: 'var(--orange)' }} /> LUT PACK · {l.count} LOOKS</div>
          <h1>{l.name}</h1>
          <p className="pd-benefit">{l.oneline}</p>

          <div className="pd-price-row">
            <div className="pd-price">${l.price}</div>
            <div className="pd-price-note">ONE-TIME · ALL FORMATS INCLUDED</div>
          </div>
          <button className="btn btn-primary btn-lg pd-buy"><DownloadIcon /> Buy &amp; Download</button>
          <div className="pd-reassure"><CheckIcon /> Instant download · ZIP · 120 MB</div>

          <div className="pd-bullets">
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT IT DOES</div><div className="pd-bullet-v">Adds ready-to-grade looks that preserve skin tones and shadow detail. Drop on an adjustment layer, dial opacity.</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHO IT'S FOR</div><div className="pd-bullet-v">Editors and DPs grading S-Log3 / V-Log / LOG-C / Rec.709 who want a sane starting point, not a hard look.</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT YOU GET</div><div className="pd-bullet-v">{l.count} × .CUBE · {l.count} × .LOOK · a README with recommended exposure & base grade · free updates for 1 year.</div></div>
          </div>
        </div>
      </div>

      <div className="pd-blocks" style={{ paddingBottom: 72 }}>
        <div className="pd-block">
          <h3>Install steps</h3>
          <ol>
            <li>Unzip the download.</li>
            <li>Premiere → Lumetri Color panel → Creative → Look dropdown → Browse…</li>
            <li>Point to the .look file. Done.</li>
            <li>For DaVinci / Final Cut, copy the .cube file to your LUT library.</li>
            <li>Apply on an adjustment layer. Tune opacity 40–100%.</li>
          </ol>
        </div>
        <div className="pd-block">
          <h3>Compatibility</h3>
          <ul>
            <li>Premiere Pro · Final Cut Pro · DaVinci Resolve</li>
            <li>Works with .cube-compatible apps (AE, FCP, Resolve, Premiere)</li>
            <li>Source profiles: S-Log3, V-Log, LOG-C, Rec.709</li>
            <li>Best applied on correctly exposed footage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LutsList, LutDetail, LUTS });
