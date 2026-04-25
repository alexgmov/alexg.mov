// LUTs list + LUT detail

const LUTS = [
  {
    id: 'cinematic-01',
    name: 'Solène',
    oneline: 'Sculpted for daylight, this look carves deep, luminous contrast across skin and landscape alike, kissing greens with a rich amber glow and surrendering to darkness with cinematic grace.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/ChatGPT Image Apr 25, 2026, 02_25_16 PM.png',
    mockupAlt: 'Solène LUT mock-up',
    demoLabel: 'Solène',
    compare: {
      title: 'Solène',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Solène ungraded preview',
      afterTitle: 'Solène graded preview',
      beforeSrc: 'videos/Solène Ungraded.mp4',
      afterSrc: 'videos/Solène Graded.mp4',
    },
  },
  {
    id: 'interior-03',
    name: 'Soft Linen LUT',
    oneline: 'A softer interior-grade LUT for natural light, talking heads, and lifestyle footage.',
    price: null,
    formats: '.CUBE',
    badge: 'COMING SOON',
    tone: 'warm-film',
    available: false,
    release: 'Q2',
    demoLabel: 'Soft Linen',
  },
];

function LutsList({ go }) {
  const releasedCount = LUTS.filter(l => l.available).length;

  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Looks for footage that already has a clean base.</h1>
          <div className="list-meta">
            <span>{releasedCount} RELEASED {releasedCount === 1 ? 'LOOK' : 'LOOKS'}</span>
            <span>·</span>
            <span>.CUBE FILES</span>
            <span>·</span>
            <span>PREMIERE, RESOLVE + FCP</span>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="list-grid lut-grid">
          {LUTS.map(l => (
            <article
              key={l.id}
              className={"card lut-card" + (l.available ? '' : ' lut-card-soon')}
              onClick={l.available ? () => go('lut:' + l.id) : undefined}
              style={{
                cursor: l.available ? 'pointer' : 'default',
                opacity: l.available ? 1 : 0.72,
                borderStyle: l.available ? 'solid' : 'dashed',
                background: l.available ? 'var(--bg)' : 'var(--surface)',
              }}
            >
              <div className="card-media">
                {l.available ? (
                  <LutPreview tone={l.tone} interactive compare={l.compare} />
                ) : (
                  <div className="lut-card-soon-art" />
                )}
              </div>
              <div className="card-body">
                <div className="card-eyebrow">
                  <span>{l.available ? `INDIVIDUAL LUT · ${l.formats}` : 'COMING SOON'}</span>
                  {l.badge && <span style={{ color: l.available ? 'var(--orange-ink)' : 'var(--muted)' }}>{l.available ? '★ ' : ''}{l.badge}</span>}
                </div>
                <h3 className="card-title">{l.name}</h3>
                <div className="card-foot">
                  <div className="card-price">{l.available ? `$${l.price}` : l.release}</div>
                  {l.available ? <span className="btn btn-secondary btn-sm">View <ArrowIcon /></span> : null}
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
              <div className="how-num">01 / DOWNLOAD LUT</div>
              <h4 className="how-h">Get the LUT file</h4>
              <p className="how-p">Download the LUT and unzip it. You’ll get the `.cube` file and a quick usage note.</p>
            </div>
            <div className="how-item">
              <div className="how-num">02 / APPLY AFTER BASE GRADE</div>
              <h4 className="how-h">Drop it on normalized footage</h4>
              <p className="how-p">Convert your log footage first or start from a clean Rec.709 base. Then apply the LUT on a clip or adjustment layer.</p>
            </div>
            <div className="how-item">
              <div className="how-num">03 / DIAL IT IN</div>
              <h4 className="how-h">Tune intensity shot by shot</h4>
              <p className="how-p">Adjust exposure, white balance, and opacity so the look sits on the footage instead of crushing the image.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function LutDetail({ id, go }) {
  const l = LUTS.find(x => x.id === id) || LUTS[0];
  const [buying, setBuying] = React.useState(false);
  const purchased = new URLSearchParams(location.search).get('purchased') === 'true';
  React.useEffect(() => {
    if (!l.available) go('luts');
  }, [l.available, go]);
  if (!l.available) return null;

  async function handleBuy() {
    setBuying(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: l.checkoutProductId || l.id }),
      });
      const { url, error } = await res.json();
      if (error || !url) throw new Error(error || 'Missing checkout URL');
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
        <a href="#" onClick={e => { e.preventDefault(); go('luts'); }}>LUTs</a> <span>/</span>
        <span style={{ color: 'var(--ink)' }}>{l.name}</span>
      </div>
      <div className="pd-hero">
        <div className="pd-media-stack">
          {l.mockupSrc && (
            <div className="lut-detail-mockup">
              <img src={l.mockupSrc} alt={l.mockupAlt || `${l.name} LUT mock-up`} />
            </div>
          )}
          <div className="pd-media">
            <LutPreview tone={l.tone} scale={1.4} interactive compare={l.compare} />
            <div className="reel-meta">
              <span>BEFORE / AFTER</span>
              <span style={{ opacity: 0.6 }}>{l.demoLabel}</span>
            </div>
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-tag"><span className="pd-tag-dot" style={{ background: 'var(--orange)' }} /> INDIVIDUAL LUT · .CUBE</div>
          <h1>{l.name}</h1>
          <p className="pd-benefit">{l.oneline}</p>

          {purchased && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '14px 16px', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>Purchase confirmed.</strong>
              <span style={{ color: 'var(--muted)' }}> Check your email for the download link (valid 48 hours). Check spam if it doesn't arrive within a few minutes.</span>
            </div>
          )}
          <div className="pd-price-row">
            <div className="pd-price">${l.price}</div>
            <div className="pd-price-note">ONE-TIME · .CUBE FILE INCLUDED</div>
          </div>
          <button className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying}>
            <DownloadIcon /> {buying ? 'Redirecting…' : 'Buy & Download'}
          </button>
          <div className="pd-reassure"><CheckIcon /> Instant download · ZIP · .cube</div>

          <div className="pd-bullets">
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT IT DOES</div><div className="pd-bullet-v">Gives you one finished look you can apply after your base correction, then tune with opacity and exposure.</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHO IT'S FOR</div><div className="pd-bullet-v">Editors and filmmakers who want one reliable LUT for a specific mood instead of a large bundle they will never fully use.</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT YOU GET</div><div className="pd-bullet-v">1 × .CUBE</div></div>
          </div>
        </div>
      </div>

      <div className="pd-blocks" style={{ paddingBottom: 72 }}>
        <div className="pd-block">
          <h3>Install steps</h3>
          <ol>
            <li>Unzip the download.</li>
            <li>Premiere → Lumetri Color panel → Creative → Look dropdown → Browse…</li>
            <li>Point to the .cube file. Done.</li>
            <li>For DaVinci / Final Cut, copy the .cube file to your LUT library.</li>
            <li>Apply on an adjustment layer. Tune intensity 20–100%. I find the best results between 30 and 60% for most footage.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LutsList, LutDetail, LUTS });
