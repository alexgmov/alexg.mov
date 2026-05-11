import React from 'react';

// LUTs list + LUT detail

const LUTS = window.LUTS || [
  {
    id: 'cinematic-01',
    name: 'MERIDIAN',
    oneline: 'Warm, polished color for footage shot in natural light.',
    seoDescription: 'MERIDIAN is a .CUBE LUT for warm, polished color on footage shot in natural light.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    available: true,
    checkoutProductId: 'solene',
    mockupSrc: 'mockups/meridian mockup.png',
    mockupAlt: 'MERIDIAN LUT product mockup',
    demoLabel: 'MERIDIAN',
    compare: {
      title: 'MERIDIAN',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'MERIDIAN ungraded preview',
      afterTitle: 'MERIDIAN graded preview',
      beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
    },
    compareScenes: [
      {
        id: 'scene-01',
        label: 'Scene 01',
        title: 'MERIDIAN scene 01',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'MERIDIAN scene 01 ungraded preview',
        afterTitle: 'MERIDIAN scene 01 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 1 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 1 graded.mp4',
      },
      {
        id: 'scene-02',
        label: 'Scene 02',
        title: 'MERIDIAN scene 02',
        beforeLabel: 'Ungraded',
        afterLabel: 'Graded',
        beforeTitle: 'MERIDIAN scene 02 ungraded preview',
        afterTitle: 'MERIDIAN scene 02 graded preview',
        beforeSrc: 'videos/lut showcase/meridian 2 ungraded.mp4',
        afterSrc: 'videos/lut showcase/meridian 2 graded.mp4',
      },
    ],
  },
  {
    id: 'onyx',
    name: 'ONYX',
    oneline: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
    seoDescription: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    available: true,
    checkoutProductId: 'onyx',
    mockupSrc: 'mockups/onyx mockup.png',
    mockupAlt: 'ONYX LUT product mockup',
    demoLabel: 'ONYX',
    details: {
      whatItDoes: 'One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea',
      whoItsFor: 'Editors grading underwater, ocean, diving, snorkel, reef, and tropical travel footage.',
      whatYouGet: 'ZIP containing 1 x .CUBE',
    },
    compare: {
      title: 'ONYX',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'ONYX ungraded preview',
      afterTitle: 'ONYX graded preview',
      beforeSrc: 'videos/lut showcase/onyx 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/onyx 1 graded.mp4',
    },
  },
  {
    id: 'haloclyne',
    name: 'HALOCLYNE',
    oneline: 'A one-click underwater grade that separates foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
    seoDescription: 'HALOCLYNE is a .CUBE LUT for underwater footage, separating foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'warm-film',
    available: true,
    checkoutProductId: 'haloclyne',
    mockupSrc: 'mockups/haloclyne mockup.png',
    mockupAlt: 'HALOCLYNE LUT product mockup',
    demoLabel: 'HALOCLYNE',
    details: {
      whatItDoes: 'Separates foreground from background by warming up skin and ocean life into vivid oranges while holding a beautiful turquoise sea, killing haze and quieting sand.',
      whoItsFor: 'Editors grading underwater, ocean, diving, snorkel, reef, and tropical travel footage.',
      whatYouGet: 'ZIP containing 1 x .CUBE',
    },
    compare: {
      title: 'HALOCLYNE',
      label: 'Scene 01',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'HALOCLYNE ungraded preview',
      afterTitle: 'HALOCLYNE graded preview',
      beforeSrc: 'videos/lut showcase/haloclyne 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/haloclyne 1 graded..mp4',
    },
  },
];

const LUT_FAQS = window.LUT_FAQS || [
  {
    q: 'What footage works best with these LUTs?',
    a: 'MERIDIAN performs best with clean natural light. ONYX: One-click underwater grade that warms skin and ocean life into vivid orange against a clean turquoise sea. HALOCLYNE is made for underwater footage, ocean life, turquoise water, and hazy sand-heavy scenes.',
  },
  {
    q: 'Do these LUTs work in Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, and CapCut?',
    a: 'Yes. Each download is a .zip containing a .CUBE file for Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, CapCut Desktop, and most modern color workflows. iMovie does not natively import .CUBE LUTs.',
  },
  {
    q: 'Should I apply a LUT before or after color correction?',
    a: 'Apply the LUT after a base correction or log-to-Rec.709 transform, then fine-tune each shot.',
  },
  {
    q: 'How do I receive the download?',
    a: 'After checkout, the download link is sent to the email you use at checkout, so you can buy on your phone and open the files on your computer.',
  },
];

const LUT_DETAIL_FAQS = window.LUT_DETAIL_FAQS || [
  {
    q: 'Who are these LUTs best for?',
    a: 'Editors who want focused looks for specific lighting conditions instead of a giant bundle.',
  },
  {
    q: 'What software can open these LUTs?',
    a: 'Any editor that accepts .CUBE files, including Premiere Pro, DaVinci Resolve, Final Cut Pro, After Effects, and CapCut Desktop. iMovie does not natively import .CUBE LUTs.',
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
          <p>Cinematic .CUBE LUTs for Premiere, Resolve, Final Cut, After Effects, and CapCut Desktop.</p>
          <div className="list-meta">
            <span>{releasedCount} RELEASED {releasedCount === 1 ? 'LOOK' : 'LOOKS'}</span>
            <span>·</span>
            <span>.CUBE FILES</span>
            <span>·</span>
            <span>PREMIERE + RESOLVE + FCP + AFTER EFFECTS + CAPCUT DESKTOP</span>
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
      <section className="section-sm">
        <div className="wrap">
          <p className="section-title">HOW IT WORKS</p>
          <div className="how">
            <div className="how-item">
              <div className="how-num">01 / DOWNLOAD LUT</div>
              <h4 className="how-h">Get the LUT file</h4>
              <p className="how-p">Use the email link after checkout to download and unzip the LUT package.</p>
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
        body: JSON.stringify({
          productId: l.checkoutProductId || l.id,
          offerCode: window.getFirstVisitOfferCode?.() || '',
          offerEmail: window.getFirstVisitOfferEmail?.() || '',
          offerToken: window.getFirstVisitOfferToken?.() || '',
        }),
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
            <div className="pd-price-note">ONE-TIME · SENT BY EMAIL</div>
          </div>
          <button ref={buyButtonRef} className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying}>
            <MailIcon />
            <span className="cta-copy-desktop">{buying ? 'Redirecting…' : 'Buy'}</span>
            <span className="cta-copy-mobile">{buying ? 'Redirecting…' : 'Buy'}</span>
          </button>
          <div className="pd-reassure"><CheckIcon /> Files sent directly to your email.</div>

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
            <li>Download and unzip the .zip file from the email link.</li>
            <li>Premiere → Lumetri Color panel → Creative → Look dropdown → Browse…</li>
            <li>Point to the .cube file. Done.</li>
            <li>For DaVinci, Final Cut, After Effects, or CapCut Desktop, import or copy the .cube file into the app's LUT workflow.</li>
            <li>Apply on an adjustment layer. Tune intensity 20–100%, usually 30–60%.</li>
          </ol>
        </div>
      </div>
      <MobileProductStickyCta
        active={showStickyCta && !purchased}
        productName={l.name}
        productMeta=".CUBE LUT · files sent by email"
        price={`$${l.price}`}
        actionLabel={buying ? 'Redirecting…' : 'Buy'}
        actionIcon={<MailIcon />}
        onAction={handleBuy}
        disabled={buying}
      />
    </div>
  );
}

Object.assign(window, { LutsList, LutDetail, LUTS, LUT_FAQS, LUT_DETAIL_FAQS });
