import React from 'react';

// LUTs list + LUT detail

const LUTS = window.LUTS || [
  {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Warm, polished color for footage shot in natural light.',
    seoDescription: 'Meridian is a .CUBE LUT for warm, polished color on footage shot in natural light.',
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
      beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
    },
    compareScenes: [
      {
        id: 'scene-01',
        label: 'Scene 01',
        title: 'Meridian scene 01',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'Meridian scene 01 ungraded preview',
        afterTitle: 'Meridian scene 01 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
      },
      {
        id: 'scene-02',
        label: 'Scene 02',
        title: 'Meridian scene 02',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'Meridian scene 02 ungraded preview',
        afterTitle: 'Meridian scene 02 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 2 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 2 graded.mp4',
      },
    ],
  },
  {
    id: 'onyx',
    name: 'Onyx',
    oneline: 'Crafted for the night, where deep shadows meet luminous skin and city light.',
    seoDescription: 'Onyx is a .CUBE LUT crafted for nighttime footage, deep shadows, luminous skin, and city light.',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    available: true,
    checkoutProductId: 'onyx',
    mockupSrc: 'mockups/onyx mockup.png',
    mockupAlt: 'Onyx LUT product mockup',
    demoLabel: 'Onyx',
    details: {
      whatItDoes: 'Shapes nighttime footage with deeper shadows, luminous skin, and controlled city-light glow.',
      whoItsFor: 'Editors grading night streets, low-light portraits, events, and neon-lit creator footage.',
      whatYouGet: '1 x .CUBE',
    },
    compare: {
      title: 'Onyx',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Onyx ungraded preview',
      afterTitle: 'Onyx graded preview',
      beforeSrc: 'videos/lut showcase/onyx 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/onyx 1 graded.mp4',
    },
  },
  {
    id: 'interior-03',
    name: 'Haloclyne',
    oneline: 'Soft interior color for natural light, interviews, and lifestyle footage.',
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
    title: 'Best LUT for footage shot in natural light',
    body: 'Use Meridian when the shot is clean and you want warm contrast, richer skin, and a finished look.',
  },
  {
    title: 'Best LUT for nighttime city footage',
    body: 'Use Onyx when the scene needs deep shadows, luminous skin, and controlled neon or street-light color.',
  },
  {
    title: 'Best LUT format for multiple editing apps',
    body: '.CUBE works across Premiere Pro, DaVinci Resolve, Final Cut Pro, and most modern color workflows.',
  },
];

const LUT_FAQS = window.LUT_FAQS || [
  {
    q: 'What footage works best with these LUTs?',
    a: 'Meridian performs best with clean natural light. Onyx is built for nighttime footage, city lights, and deeper shadow work.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, and Final Cut Pro?',
    a: 'Yes. The LUTs ship as .CUBE files for Premiere Pro, DaVinci Resolve, Final Cut Pro, and most modern color workflows.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform, then fine-tune each shot.',
  },
];

const LUT_DETAIL_FAQS = window.LUT_DETAIL_FAQS || [
  {
    q: 'Who are these LUTs best for?',
    a: 'Editors who want focused looks for specific lighting conditions instead of a giant bundle.',
  },
  {
    q: 'What software can open these LUTs?',
    a: 'Any editor that accepts .CUBE files, including Premiere Pro, DaVinci Resolve, and Final Cut Pro.',
  },
  {
    q: 'How strong should the LUT be?',
    a: 'Start around 30 to 60 percent, then adjust exposure and white balance.',
  },
];

function LutsList({ go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  const releasedCount = LUTS.filter(l => l.available).length;

  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Looks for clean color, day or night.</h1>
          <p>Cinematic .CUBE LUTs for Premiere, Resolve, and Final Cut.</p>
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
        title="Choose the right LUT for your footage."
        intro="Use these after a clean base correction. Let the footage lead."
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
              <p className="how-p">Download and unzip the .cube file. A quick usage note is included.</p>
            </div>
            <div className="how-item">
              <div className="how-num">02 / APPLY AFTER BASE GRADE</div>
              <h4 className="how-h">Drop it on normalized footage</h4>
              <p className="how-p">Convert log first, or start from clean Rec.709. Apply the LUT on a clip or adjustment layer.</p>
            </div>
            <div className="how-item">
              <div className="how-num">03 / DIAL IT IN</div>
              <h4 className="how-h">Tune intensity shot by shot</h4>
              <p className="how-p">Adjust exposure, white balance, and opacity until the look sits cleanly.</p>
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
  const buyButtonRef = React.useRef(null);
  const showStickyCta = useStickyCta(buyButtonRef);
  const purchased = new URLSearchParams(location.search).get('purchased') === 'true';
  React.useEffect(() => {
    if (!l.available) go('luts');
  }, [l.available, go]);
  React.useEffect(() => {
    setActiveMediaId(l.mockupSrc ? 'mockup' : 'compare');
  }, [l.id, l.mockupSrc]);
  if (!l.available) return null;
  const detailCopy = {
    whatItDoes: l.details?.whatItDoes || 'Adds a finished warm look after base correction. Tune with opacity and exposure.',
    whoItsFor: l.details?.whoItsFor || 'Editors who want one focused LUT, not a giant bundle.',
    whatYouGet: l.details?.whatYouGet || '1 x .CUBE',
  };
  const compareScenes = (
    Array.isArray(l.compareScenes) && l.compareScenes.length
      ? l.compareScenes
      : (l.compare ? [l.compare] : [])
  ).map((compare, index) => ({
    ...compare,
    id: compare.id || `scene-${index + 1}`,
    label: compare.label || `Scene ${String(index + 1).padStart(2, '0')}`,
  }));

  const mediaItems = [
    l.mockupSrc ? {
      id: 'mockup',
      kind: 'image',
      label: `${l.name} mockup`,
      src: l.mockupSrc,
      alt: l.mockupAlt || `${l.name} LUT mock-up`,
    } : null,
    ...compareScenes.map((compare, index) => ({
      id: `compare-${compare.id || index}`,
      kind: 'compare',
      label: `${l.name} ${compare.label} before and after preview`,
      compare,
    })),
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
                    <LutPreview tone={l.tone} scale={0.55} compare={item.compare} showLabels={false} />
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
                <LutPreview tone={l.tone} scale={1.4} interactive compare={activeMedia.compare} />
                <div className="reel-meta">
                  <span>BEFORE / AFTER</span>
                  <span style={{ opacity: 0.6 }}>{activeMedia.compare?.label || l.demoLabel}</span>
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
          <button ref={buyButtonRef} className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying}>
            <DownloadIcon />
            <span className="cta-copy-desktop">{buying ? 'Redirecting…' : 'Buy & Download'}</span>
            <span className="cta-copy-mobile">{buying ? 'Redirecting…' : 'Get Instant Access'}</span>
          </button>
          <div className="pd-reassure"><CheckIcon /> Instant download · ZIP · .cube</div>

          <div className="pd-bullets">
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT IT DOES</div><div className="pd-bullet-v">{detailCopy.whatItDoes}</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHO IT'S FOR</div><div className="pd-bullet-v">{detailCopy.whoItsFor}</div></div>
            <div className="pd-bullet"><div className="pd-bullet-k">WHAT YOU GET</div><div className="pd-bullet-v">{detailCopy.whatYouGet}</div></div>
          </div>
        </div>
      </div>

      {compareScenes.length > 1 && (
        <section className="pd-compare-showcase" aria-label={`${l.name} look tests`}>
          <div className="pd-compare-heading">
            <p className="section-title">LOOK TESTS</p>
            <h2>{l.name} in different conditions.</h2>
          </div>
          <div className="pd-compare-stack">
            {compareScenes.map((compare, index) => (
              <article className="pd-compare-item" key={compare.id || index}>
                <div className="pd-compare-head">
                  <span>{compare.label}</span>
                  <strong>{compare.title || `${l.name} scene ${index + 1}`}</strong>
                </div>
                <div className="pd-media pd-compare-media">
                  <LutPreview tone={l.tone} scale={1.15} interactive compare={compare} />
                  <div className="reel-meta">
                    <span>BEFORE / AFTER</span>
                    <span style={{ opacity: 0.6 }}>{compare.label}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="pd-blocks" style={{ paddingBottom: 72 }}>
        <div className="pd-block">
          <h3>Install steps</h3>
          <ol>
            <li>Unzip the download.</li>
            <li>Premiere → Lumetri Color panel → Creative → Look dropdown → Browse…</li>
            <li>Point to the .cube file. Done.</li>
            <li>For DaVinci / Final Cut, copy the .cube file to your LUT library.</li>
            <li>Apply on an adjustment layer. Tune intensity 20–100%, usually 30–60%.</li>
          </ol>
        </div>
      </div>
      <MobileProductStickyCta
        active={showStickyCta && !purchased}
        productName={l.name}
        productMeta=".CUBE LUT · instant download"
        price={`$${l.price}`}
        actionLabel={buying ? 'Redirecting…' : 'Get Instant Access'}
        onAction={handleBuy}
        disabled={buying}
      />
    </div>
  );
}

Object.assign(window, { LutsList, LutDetail, LUTS, LUT_FAQS, LUT_DETAIL_FAQS });
