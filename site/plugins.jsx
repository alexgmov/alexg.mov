import React from 'react';
import { useResponsiveVideoSrc } from './media.js';
import { PriceDisplay, pricingTrackingAttrs, pricingVariantFor } from './pricing.jsx';

// Plugins list + Plugin detail

const PLUGINS = window.PLUGINS || [
  {
    id: 'sidestream',
    name: 'Sidestream',
    oneline: 'Search YouTube, preview, download, convert, and import media without leaving Premiere.',
    price: 0,
    version: '1.0.2',
    badge: 'LIVE',
    status: 'released',
    variant: 'media-intake',
    visual: 'demo-video',
    demoVideoSrc: 'videos/plugin showcase/sidestream demo.optimized.mp4',
    demoPosterSrc: 'videos/plugin showcase/sidestream demo.optimized.poster.jpg',
    demoDuration: '11s',
    seoTitle: 'Sidestream Premiere Pro Plugin | YouTube Media Intake for Editors',
    seoDescription: 'Sidestream helps Premiere editors search YouTube, preview sources, download video or audio, convert media, and import files without leaving the edit.',
    what: 'Sidestream brings YouTube search, preview, video/audio download, conversion, and project import into a compact Premiere panel.',
    who: 'Editors pulling licensed reference clips, interviews, sound bites, and web footage into active Premiere projects.',
    get: 'Sidestream 1.0.2 Mac install package · signed ZXP inside · Premiere panel · YouTube search · video/audio downloads · lifetime download.',
    install: [
      'Free for now: enter your email at checkout and Sidestream sends one Mac install package.',
      'Open Sidestream-1.0.2-Mac-ZXP-Installer.dmg on your editing Mac.',
      'If the ZXP Installer target is missing, open Get ZXP Installer inside the package and install it.',
      'Drag Sidestream-1.0.2.zxp onto the ZXP Installer target in the Finder window.',
      'Open Window → Extensions → Sidestream in Premiere.',
      'Search YouTube, preview a result, download video or audio, then import the finished file.',
    ],
    specs: [
      'Adobe Premiere Pro 2020 (14.0) or later',
      'macOS Finder-style install package',
      'YouTube-first media intake workflow',
      'Signed ZXP package included inside the DMG',
      'Version 1.0.2',
    ],
    detailGuide: {
      title: 'Sidestream keeps media intake inside Premiere.',
      intro: 'Built for reference pulls, licensed source clips, sound bites, and fast edit-room gathering.',
      items: [
        {
          title: 'YouTube research without browser hopping',
          body: 'Search, inspect, and preview candidates from the Premiere panel before downloading anything.',
        },
        {
          title: 'Video or audio downloads',
          body: 'Pull the format you need, normalize it for Premiere, and keep the handoff close to the timeline.',
        },
        {
          title: 'Project-aware import',
          body: 'Save into a predictable Sidestream folder and import finished media into the active project.',
        },
      ],
    },
    detailFaqs: [
      {
        q: 'What does Sidestream do in Premiere Pro?',
        a: 'It searches YouTube, previews sources, downloads video or audio, converts media when needed, and imports the finished file into Premiere.',
      },
      {
        q: 'Is Sidestream for licensed or permitted media?',
        a: 'Yes. Use it only with media you own, have licensed, or are otherwise permitted to download and edit.',
      },
      {
        q: 'How do I receive Sidestream after checkout?',
        a: 'The free Sidestream checkout sends one Mac install package to your email, so you can claim it on your phone and install it later on your editing Mac.',
      },
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
    title: 'Best for media intake',
    body: 'Search, preview, download, convert, and import web media without leaving Premiere.',
  },
  {
    title: 'Best for deadline pulls',
    body: 'Keep source gathering close to the timeline when a browser detour would slow the edit down.',
  },
  {
    title: 'Best for Premiere-first workflows',
    body: 'Search stays inside Premiere, close to the timeline.',
  },
];

const PLUGIN_FAQS = window.PLUGIN_FAQS || [
  {
    q: 'Which Premiere plugin should I start with?',
    a: 'Use Sidestream when you need YouTube-first media intake, preview, download, conversion, and import inside Premiere.',
  },
  {
    q: 'Do these plugins replace a normal editing workflow?',
    a: 'No. They handle specific bottlenecks inside Premiere so you can keep making the edit decisions.',
  },
  {
    q: 'How do I receive a plugin after checkout?',
    a: 'The download link is sent to the email you use at checkout, so you can buy or claim it on your phone and install later on your editing computer.',
  },
];

const PLUGIN_DETAIL_FAQS = window.PLUGIN_DETAIL_FAQS || [
  {
    q: 'What do these Premiere plugins do?',
    a: 'They handle focused edit-room bottlenecks inside Premiere, from media intake to faster selects.',
  },
  {
    q: 'Are they full editing replacements?',
    a: 'No. They stay narrow so the plugin helps with one workflow without taking over the edit.',
  },
  {
    q: 'What software do I need?',
    a: 'Released plugins ship as ZXP extension packages for Premiere Pro. Check each plugin page for exact version support.',
  },
  {
    q: 'How do I receive a plugin after checkout?',
    a: 'The download link is sent to the email you use at checkout, so you can buy or claim it on your phone and install it later on your editing computer.',
  },
];

const SIDESTREAM_ZXP_INSTALLER_URL = 'https://aescripts.com/learn/zxp-installer/';
const SIDESTREAM_ZXP_INSTALLER_FAQ_URL = 'https://aescripts.com/knowledgebase/index/view/faq/zxp-installer-faq/';

function isFreePlugin(plugin) {
  return plugin && plugin.status === 'released' && plugin.price === 0;
}

function pluginPriceNote(plugin) {
  if (plugin?.priceNote) return plugin.priceNote;
  if (isFreePlugin(plugin)) return 'FREE FOR NOW · LIFETIME DOWNLOAD';
  return plugin?.status === 'released' ? 'ONE-TIME · LIFETIME DOWNLOAD' : 'IN DEVELOPMENT · LAUNCH LIST OPEN';
}

function PluginVisual({ plugin, scale = 1 }) {
  if (plugin.demoVideoSrc) return <PluginDemoVideo plugin={plugin} scale={scale} />;
  if (plugin.visual === 'blank') return <BlankPluginVisual scale={scale} />;
  return <PremiereScreenshot variant={plugin.variant} scale={scale} />;
}

function PluginDemoVideo({ plugin, scale = 1 }) {
  const wrapRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const videoSrc = useResponsiveVideoSrc(plugin.demoVideoSrc);
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);

  React.useEffect(() => {
    const node = wrapRef.current;
    setShouldLoadVideo(false);
    if (!node || !('IntersectionObserver' in window)) {
      setShouldLoadVideo(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoadVideo(true);
      observer.disconnect();
    }, {
      threshold: 0.01,
      rootMargin: '320px 0px',
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [plugin.demoVideoSrc]);

  React.useEffect(() => {
    if (!shouldLoadVideo) return;
    videoRef.current?.play().catch(() => {});
  }, [shouldLoadVideo, videoSrc]);

  return (
    <div
      ref={wrapRef}
      className="plugin-demo-visual"
      style={{ '--plugin-demo-scale': scale }}
      aria-label={`${plugin.name} demo video`}
    >
      <video
        ref={videoRef}
        className="plugin-demo-video"
        src={shouldLoadVideo ? videoSrc : undefined}
        poster={plugin.demoPosterSrc}
        title={`${plugin.name} demo video`}
        aria-label={`${plugin.name} demo video`}
        muted
        loop
        playsInline
        webkit-playsinline="true"
        autoPlay
        preload={shouldLoadVideo ? 'metadata' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        x-webkit-airplay="deny"
      />
    </div>
  );
}

function BlankPluginVisual({ scale = 1 }) {
  return (
    <div className="plugin-blank-visual" style={{ '--blank-visual-scale': scale }} aria-hidden="true">
      <span className="plugin-blank-grid" />
      <span className="plugin-blank-frame">
        <span className="plugin-blank-bar plugin-blank-bar-a" />
        <span className="plugin-blank-bar plugin-blank-bar-b" />
        <span className="plugin-blank-bar plugin-blank-bar-c" />
      </span>
    </div>
  );
}

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
            <span>PREMIERE 2020+</span>
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
                {...pricingTrackingAttrs(p)}
              >
                {released ? (
                  <>
                    <div className="card-media"><PluginVisual plugin={p} /></div>
                    <div className="card-body">
                      <div className="card-eyebrow">
                        <span>v{p.version} · PLUGIN</span>
                        {p.badge && <span style={{ color: 'var(--blue-ink)' }}>● {p.badge}</span>}
                      </div>
                      <h3 className="card-title">{p.name}</h3>
                      <p className="card-desc">{p.oneline}</p>
                      <div className="card-foot">
                        <div className="card-price"><PriceDisplay product={p} showLabel={false} /></div>
                        <a
                          className="btn btn-secondary btn-sm"
                          href={hrefFor('plugin:' + p.id)}
                          {...pricingTrackingAttrs(p)}
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
              <div className="how-num">01 / CLAIM ONCE</div>
              <h4 className="how-h">Instant email link</h4>
              <p className="how-p">No subscriptions. No seats. Paid tools are one-time, and free releases still send the download link by email.</p>
            </div>
            <div className="how-item">
              <div className="how-num">02 / INSTALL FAST</div>
              <h4 className="how-h">Install the package</h4>
              <p className="how-p">Download the Mac install package on your editing computer, drag the ZXP onto the installer target, and open the panel inside Premiere.</p>
            </div>
            <div className="how-item">
              <div className="how-num">03 / EDIT FASTER</div>
              <h4 className="how-h">Lives in your workflow</h4>
              <p className="how-p">Tools dock inside Premiere. No extra web app, no round-tripping, no timeline detours.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SidestreamInstallGuide({ go }) {
  const hrefFor = window.routeHref || ((id) => '#');
  const [installerState, setInstallerState] = React.useState('need');
  const downloadUrl = React.useMemo(() => {
    try {
      return new URLSearchParams(location.search).get('download') || '';
    } catch {
      return '';
    }
  }, []);

  const steps = [
    {
      eyebrow: '01 / GET THE PACKAGE',
      title: 'Download the Mac install package',
      body: 'Use the private download button in your email. Open the DMG on your editing Mac; do not unzip it or hunt for a separate guide.',
      action: downloadUrl ? (
        <a className="btn btn-primary" href={downloadUrl}>
          <DownloadIcon />
          Download Package
        </a>
      ) : (
        <a
          className="btn btn-secondary"
          href={hrefFor('plugin:sidestream')}
          onClick={event => {
            event.preventDefault();
            go('plugin:sidestream');
          }}
        >
          Get Free Link
        </a>
      ),
    },
    {
      eyebrow: '02 / INSTALLER CHECK',
      title: 'Check the ZXP Installer target',
      body: 'The DMG points at the normal ZXP Installer app in Applications. If that target is missing, use the installer link inside the package, install it, then come back.',
      action: (
        <div className="install-segment" role="group" aria-label="ZXP installer status">
          <button
            type="button"
            className={installerState === 'have' ? 'active' : ''}
            onClick={() => setInstallerState('have')}
          >
            I have it
          </button>
          <a href={SIDESTREAM_ZXP_INSTALLER_URL} target="_blank" rel="noreferrer">
            Get installer
          </a>
        </div>
      ),
    },
    {
      eyebrow: '03 / RUN THE INSTALL',
      title: 'Drag the ZXP onto the target',
      body: 'Quit Premiere Pro, then drag Sidestream-1.0.2.zxp onto Drop Sidestream here - ZXP Installer.app inside the DMG window.',
      action: (
        <button
          type="button"
          className={`install-state-pill ${installerState === 'have' ? 'is-ready' : ''}`}
          onClick={() => setInstallerState('have')}
        >
          {installerState === 'have' ? 'Installer ready' : 'Mark installer ready'}
        </button>
      ),
    },
    {
      eyebrow: '04 / LAUNCH',
      title: 'Open Sidestream in Premiere',
      body: 'Reopen Premiere Pro, open a project, then choose Window > Extensions (Legacy) > Sidestream. Some Premiere versions show Window > Extensions > Sidestream.',
      action: (
        <a className="btn btn-secondary" href="mailto:alex@alexg.mov?subject=Sidestream%20install%20help">
          Need help
        </a>
      ),
    },
  ];

  return (
    <main className="sidestream-install">
      <div className="wrap">
        <div className="pd-crumbs">
          <a href={hrefFor('plugins')} onClick={event => { event.preventDefault(); go('plugins'); }}>Plugins</a>
          <span>/</span>
          <a href={hrefFor('plugin:sidestream')} onClick={event => { event.preventDefault(); go('plugin:sidestream'); }}>Sidestream</a>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>Install</span>
        </div>

        <section className="install-hero" aria-labelledby="sidestream-install-title">
          <div className="install-hero-copy">
            <p className="section-title">SIDESTREAM INSTALL</p>
            <h1 id="sidestream-install-title">Install Sidestream step by step.</h1>
            <p>
              This page backs up the Mac install package: open the DMG, drag the signed ZXP onto
              the ZXP Installer target, then open Sidestream inside Premiere.
            </p>
          </div>
          <div className="install-status-panel" aria-label="Install status">
            <div className="install-status-top">
              <span>ZXP package</span>
              <strong>Sidestream 1.0.2</strong>
            </div>
            <div className="install-status-list">
              <span><CheckIcon /> One DMG download</span>
              <span><CheckIcon /> Signed ZXP inside</span>
              <span><CheckIcon /> Drag-and-drop installer handoff</span>
            </div>
          </div>
        </section>

        <section className="install-steps" aria-label="Sidestream installation steps">
          {steps.map((step, index) => (
            <article className="install-step" key={step.eyebrow}>
              <div className="install-step-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="install-step-copy">
                <p>{step.eyebrow}</p>
                <h2>{step.title}</h2>
                <span>{step.body}</span>
              </div>
              <div className="install-step-action">{step.action}</div>
            </article>
          ))}
        </section>

        <section className="install-troubleshoot" aria-label="Install troubleshooting">
          <div>
            <p className="section-title">TROUBLESHOOTING</p>
            <h2>Two fixes solve most installs.</h2>
          </div>
          <div className="install-faq-list">
            <details open>
              <summary>Use the ZXP/UXP Installer, not the Manager App.</summary>
              <p>Sidestream comes from alexg.mov, so you do not need an aescripts account or the aescripts + aeplugins Manager App.</p>
            </details>
            <details>
              <summary>If Premiere does not show Sidestream.</summary>
              <p>Reopen Premiere, check both Extensions menus, then reinstall with the installer set to current-user install if the option appears.</p>
            </details>
            <details>
              <summary>If drag and drop does not work.</summary>
              <p>Open the ZXP/UXP Installer, choose File &gt; Open, and select Sidestream-1.0.2.zxp from the mounted DMG.</p>
            </details>
          </div>
          <div className="install-foot-actions">
            <a className="btn btn-secondary" href={SIDESTREAM_ZXP_INSTALLER_FAQ_URL} target="_blank" rel="noreferrer">
              Installer FAQ
            </a>
            <a className="btn btn-primary" href="mailto:alex@alexg.mov?subject=Sidestream%20install%20help">
              Email Support
            </a>
          </div>
        </section>
      </div>
    </main>
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
  const hasDemoVideo = Boolean(p.demoVideoSrc);
  const hasBlankVisual = p.visual === 'blank' && !hasDemoVideo;
  const showGeneratedPreview = !hasBlankVisual && !hasDemoVideo;
  const detailGuide = p.detailGuide || {
    title: `${p.name} helps you find the right clip faster.`,
    intro: 'Built for long sessions, mixed bins, and generic camera names.',
    items: [
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
    ],
  };
  const detailFaqs = p.detailFaqs || PLUGIN_DETAIL_FAQS;

  async function handleBuy() {
    setBuying(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: p.id,
          offerCode: window.getFirstVisitOfferCode?.() || '',
          offerEmail: window.getFirstVisitOfferEmail?.() || '',
          offerToken: window.getFirstVisitOfferToken?.() || '',
          pricingVariant: pricingVariantFor(p),
        }),
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
            <PluginVisual plugin={p} scale={1.2} />
            {/* play overlay */}
            {showGeneratedPreview && thumb === 0 && (
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5))',
              }}>
                <div className="reel-play-btn" style={{ width: 56, height: 56 }}><PlayIcon size={20} /></div>
              </div>
            )}
            {(hasDemoVideo || showGeneratedPreview) && <div className="reel-meta">
              <span>DEMO · {hasDemoVideo ? (p.demoDuration || '11s') : '42s'}</span>
            </div>}
          </div>
          {showGeneratedPreview && <div className="pd-thumbs">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={"pd-thumb " + (thumb === i ? 'active' : '')} onClick={() => setThumb(i)}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {i === 0 && <PluginVisual plugin={p} scale={0.4} />}
                  {i === 1 && <LutPreview tone="clean" scale={0.4} />}
                  {i === 2 && <PortfolioStill seed={2} />}
                  {i === 3 && <PortfolioStill seed={6} />}
                </div>
              </div>
            ))}
          </div>}
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
            <div className="pd-price"><PriceDisplay product={p} mode="detail" /></div>
            <div className="pd-price-note">{pluginPriceNote(p)}</div>
          </div>
          {p.status === 'released'
            ? <button ref={buyButtonRef} className="btn btn-primary btn-lg pd-buy" onClick={handleBuy} disabled={buying} {...pricingTrackingAttrs(p)}>
                <DownloadIcon />
                <span className="cta-copy-desktop">{buying ? 'Redirecting…' : (isFreePlugin(p) ? 'Get Free Link' : 'Buy & Email Link')}</span>
                <span className="cta-copy-mobile">{buying ? 'Redirecting…' : (isFreePlugin(p) ? 'Free Link' : 'Email Link')}</span>
              </button>
            : <button className="btn btn-secondary btn-lg pd-buy">Join Launch List</button>}
          <div className="pd-reassure"><CheckIcon /> {isFreePlugin(p) ? 'Free Mac install package sent to checkout email · ZXP Installer link included' : (p.status === 'released' ? 'Download link sent to checkout email · 24h support reply' : 'Shipping updates posted as development continues')}</div>

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
        title={detailGuide.title}
        intro={detailGuide.intro}
        items={detailGuide.items}
        faqs={detailFaqs}
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
        productMeta="Premiere plugin · Mac package"
        price={<PriceDisplay product={p} mode="sticky" showLabel={false} />}
        actionLabel={buying ? 'Redirecting…' : (isFreePlugin(p) ? 'Free Link' : 'Email Link')}
        onAction={handleBuy}
        disabled={buying}
        trackingAttrs={pricingTrackingAttrs(p)}
      />
    </div>
  );
}

Object.assign(window, { PluginsList, PluginDetail, SidestreamInstallGuide, PLUGINS, PLUGIN_FAQS, PLUGIN_DETAIL_FAQS });
