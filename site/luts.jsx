import React from 'react';

// LUTs list + LUT detail

const LUTS = window.LUTS || [
  {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Give clean daylight footage warm contrast, richer skin, and polished travel-film color.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/meridian mockup.png',
    mockupAlt: 'Meridian LUT product mockup',
    demoLabel: 'Meridian',
    compare: {
      title: 'Meridian',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Meridian ungraded preview',
      afterTitle: 'Meridian graded preview',
      beforeSrc: 'videos/Solène Ungraded.mp4',
      afterSrc: 'videos/Solène Graded.mp4',
    },
  },
  {
    id: 'interior-03',
    name: 'Haloclyne',
    oneline: 'A softer interior-grade LUT for natural light, talking heads, and lifestyle footage.',
    price: null,
    formats: '.CUBE',
    badge: 'COMING SOON',
    tone: 'warm-film',
    available: false,
    release: 'Q2',
    demoLabel: 'Haloclyne',
  },
];

const LUT_GUIDE_ITEMS = [
  {
    title: 'Best LUT for daylight travel footage',
    body: 'Start with Meridian when your footage is already exposed cleanly and you want warm highlights, deeper contrast, and a cinematic travel-film feel.',
  },
  {
    title: 'Best LUT format for multiple editing apps',
    body: '.CUBE is the practical format for editors moving between Premiere Pro, DaVinci Resolve, and Final Cut Pro because it is widely supported.',
  },
  {
    title: 'Best workflow for log footage',
    body: 'Normalize log footage first, then apply the creative LUT. This keeps skin tones and shadows easier to control than treating the LUT like a full correction.',
  },
];

const LUT_FAQS = window.LUT_FAQS || [
  {
    q: 'What is the best LUT for daylight travel footage?',
    a: 'Meridian is the best fit in this shop for daylight travel, lifestyle, creator, and outdoor footage that already has a clean exposure and white balance.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, and Final Cut Pro?',
    a: 'Yes. The released LUTs ship as .CUBE files, which can be loaded in Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro, and most modern color workflows.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform. Then fine-tune intensity, exposure, and white balance per shot.',
  },
];

const LUT_DETAIL_FAQS = window.LUT_DETAIL_FAQS || [
  {
    q: 'Who is Meridian best for?',
    a: 'Meridian is best for editors, filmmakers, and creators who want one cinematic LUT for daylight, travel, lifestyle, and social video rather than a huge LUT bundle.',
  },
  {
    q: 'What software can open Meridian?',
    a: 'Meridian ships as a .CUBE LUT, so it can be used in Premiere Pro, DaVinci Resolve, Final Cut Pro, and other color tools that accept .CUBE files.',
  },
  {
    q: 'How strong should the LUT be?',
    a: 'For most shots, start around 30 to 60 percent intensity, then adjust exposure and white balance so the look feels intentional instead of crushed.',
  },
];

function LutsList({ go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  const releasedCount = LUTS.filter(l => l.available).length;

  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Looks for footage that already has a clean base.</h1>
          <p>Cinematic .CUBE LUTs for editors working in Premiere Pro, DaVinci Resolve, and Final Cut Pro.</p>
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
                {l.available && <p className="card-desc">{l.oneline}</p>}
                <div className="card-foot">
                  <div className="card-price">{l.available ? `$${l.price}` : l.release}</div>
                  {l.available ? (
                    <a
                      className="btn btn-secondary btn-sm"
                      href={hrefFor('lut:' + l.id)}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); go('lut:' + l.id); }}
                    >
                      View <ArrowIcon />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <BuyerGuide
        eyebrow="LUT BUYER GUIDE"
        title="How to choose the right LUT for your footage."
        intro="The best LUT depends on the footage, not the trend. These LUTs are designed as creative finishing looks after a clean technical base."
        items={LUT_GUIDE_ITEMS}
        faqs={LUT_FAQS}
      />
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
  const hrefFor = window.routeHref || ((id) => '#');
  const [buying, setBuying] = React.useState(false);
  const [activeMediaId, setActiveMediaId] = React.useState(l.mockupSrc ? 'mockup' : 'compare');
  const purchased = new URLSearchParams(location.search).get('purchased') === 'true';
  React.useEffect(() => {
    if (!l.available) go('luts');
  }, [l.available, go]);
  React.useEffect(() => {
    setActiveMediaId(l.mockupSrc ? 'mockup' : 'compare');
  }, [l.id, l.mockupSrc]);
  if (!l.available) return null;

  const mediaItems = [
    l.mockupSrc ? {
      id: 'mockup',
      kind: 'image',
      label: `${l.name} mockup`,
      src: l.mockupSrc,
      alt: l.mockupAlt || `${l.name} LUT mock-up`,
    } : null,
    l.compare ? {
      id: 'compare',
      kind: 'compare',
      label: `${l.name} before and after preview`,
    } : null,
  ].filter(Boolean);
  const activeMedia = mediaItems.find(item => item.id === activeMediaId) || mediaItems[0];

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
        <a href={hrefFor('home')} onClick={e => { e.preventDefault(); go('home'); }}>Home</a> <span>/</span>
        <a href={hrefFor('luts')} onClick={e => { e.preventDefault(); go('luts'); }}>LUTs</a> <span>/</span>
        <span style={{ color: 'var(--ink)' }}>{l.name}</span>
      </div>
      <div className="pd-hero">
        <div className="pd-media-gallery" aria-label={`${l.name} media gallery`}>
          <div className="pd-gallery-thumbs" role="list" aria-label={`${l.name} preview options`}>
            {mediaItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={"pd-gallery-thumb" + (activeMedia?.id === item.id ? ' active' : '')}
                aria-label={`Show ${item.label}`}
                aria-pressed={activeMedia?.id === item.id}
                title={item.label}
                onClick={() => setActiveMediaId(item.id)}
              >
                {item.kind === 'image' ? (
                  <img src={item.src} alt="" />
                ) : (
                  <span className="pd-gallery-thumb-preview" aria-hidden="true">
                    <LutPreview tone={l.tone} scale={0.55} compare={l.compare} showLabels={false} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pd-gallery-main">
            {activeMedia?.kind === 'image' ? (
              <div className="lut-detail-mockup">
                <img src={activeMedia.src} alt={activeMedia.alt} />
              </div>
            ) : (
              <div className="pd-media">
                <LutPreview tone={l.tone} scale={1.4} interactive compare={l.compare} />
                <div className="reel-meta">
                  <span>BEFORE / AFTER</span>
                  <span style={{ opacity: 0.6 }}>{l.demoLabel}</span>
                </div>
              </div>
            )}
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

Object.assign(window, { LutsList, LutDetail, LUTS, LUT_FAQS, LUT_DETAIL_FAQS });
