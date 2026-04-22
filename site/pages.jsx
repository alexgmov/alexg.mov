// Portfolio, Services, Support, Terms, Refund

// Keep source links and per-project metadata on each tile so the next
// click-through / project-file purchase layer can attach to this same model.
const PORTFOLIO_VIDEOS = [
  {
    id: 'ekta-portrait',
    title: 'Ekta portrait cut',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DMZNWMJRyu5/',
    src: 'videos/portfolio/web/ekta-portrait.mp4',
    layout: 'portrait offset-lg',
    projectFileState: 'planned',
  },
  {
    id: 'alexg-portrait',
    title: 'Alex Garrett social spot',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DOyrMpyCXV0/',
    src: 'videos/portfolio/web/alexg-portrait.mp4',
    layout: 'portrait',
    projectFileState: 'planned',
  },
  {
    id: 'interview-coder-linkedin',
    title: 'Interview Coder launch film',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/abdulla007_i-spent-the-last-few-months-building-interview-activity-7389017263137366017-mnw5?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/interview-coder-linkedin.mp4',
    layout: 'feature',
    projectFileState: 'planned',
  },
  {
    id: 'eldo-reel',
    title: 'Eldo reel',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reel/DJHzWMmoXz2/',
    src: 'videos/portfolio/web/eldo-reel.mp4',
    layout: 'portrait offset-sm',
    projectFileState: 'planned',
  },
  {
    id: 'abdulla-case-study',
    title: 'Abdulla case study',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DVipr1igHR3/',
    src: 'videos/portfolio/web/abdulla-case-study.mp4',
    layout: 'portrait',
    projectFileState: 'planned',
  },
  {
    id: 'motion-graphics-drive',
    title: 'Motion graphics build',
    source: 'Drive',
    sourceUrl: 'https://drive.google.com/file/d/17DS1xWMJFBe0rNCXQHvWcRSJ1y_vxUPv/view',
    src: 'videos/portfolio/web/motion-graphics-drive.mp4',
    layout: 'landscape-wide offset-md',
    projectFileState: 'planned',
  },
  {
    id: 'abdulla-showcase',
    title: 'Abdulla showcase cut',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DVrfbfvjkko/',
    src: 'videos/portfolio/web/abdulla-showcase.mp4',
    layout: 'portrait',
    projectFileState: 'planned',
  },
  {
    id: 'infiniteviews-real-estate',
    title: 'Real estate tour promo',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DHqw-C_pAtq/',
    src: 'videos/portfolio/web/infiniteviews-real-estate.mp4',
    layout: 'portrait offset-lg',
    projectFileState: 'planned',
  },
  {
    id: 'infiniteviews-marketing',
    title: 'Infinite Views marketing reel',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DN3XI1IYksn/',
    src: 'videos/portfolio/web/infiniteviews-marketing.mp4',
    layout: 'portrait-wide',
    projectFileState: 'planned',
  },
  {
    id: 'pcg-luxury-real-estate',
    title: 'Luxury real estate promo',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DJ5J48LgmjQ/',
    src: 'videos/portfolio/web/pcg-luxury-real-estate.mp4',
    layout: 'portrait',
    projectFileState: 'planned',
  },
  {
    id: 'snowflakes-youtube',
    title: 'Snowflakes widescreen preview',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=RE6ahIf3kwA&t=61s',
    src: 'videos/portfolio/web/snowflakes-youtube.mp4',
    layout: 'landscape',
    projectFileState: 'planned',
  },
  {
    id: 'wide-youtube',
    title: 'Widescreen interview preview',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=xTR8c4j_DKk&t=13s',
    src: 'videos/portfolio/web/wide-youtube.mp4',
    layout: 'landscape-wide offset-sm',
    projectFileState: 'planned',
  },
  {
    id: 'ashlie-realtor',
    title: 'Ashlie Brewer realtor reel',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/C4gJ_6qut97/',
    src: 'videos/portfolio/web/ashlie-realtor.mp4',
    layout: 'portrait',
    projectFileState: 'planned',
  },
  {
    id: 'kaedim-linkedin',
    title: 'Kaedim launch post',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/kaedim_today-is-a-big-milestone-for-kaedim-for-activity-7434690563268018176--REi?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/kaedim-linkedin.mp4',
    layout: 'landscape',
    projectFileState: 'planned',
  },
];

function PortfolioVideoTile({ item, priority = false }) {
  const cardRef = React.useRef(null);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return undefined;

    let hydrated = Boolean(video.currentSrc || video.getAttribute('src'));
    let inView = false;

    const ensureHydrated = () => {
      if (hydrated) return;
      hydrated = true;
      video.src = item.src;
      video.load();
    };

    const play = () => {
      ensureHydrated();
      const pending = video.play();
      if (pending && typeof pending.catch === 'function') pending.catch(() => {});
    };

    const pause = () => {
      video.pause();
    };

    const handleVisibility = () => {
      if (document.hidden) pause();
      else if (inView) play();
    };

    const handleCanPlay = () => {
      if (inView && !document.hidden) play();
    };

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    if (priority) ensureHydrated();

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (entry.isIntersecting && !document.hidden) play();
      else pause();
    }, {
      threshold: 0.15,
      rootMargin: '160px 0px',
    });

    observer.observe(card);
    document.addEventListener('visibilitychange', handleVisibility);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      video.removeEventListener('canplay', handleCanPlay);
      pause();
    };
  }, [item.src, priority]);

  return (
    <article
      ref={cardRef}
      className={"port-item port-video " + item.layout}
      data-portfolio-id={item.id}
      data-project-file-state={item.projectFileState}
      data-source={item.source}
      data-source-url={item.sourceUrl}
    >
      <video
        ref={videoRef}
        src={priority ? item.src : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'none'}
        aria-label={item.title}
        title={item.title}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />
    </article>
  );
}

function Portfolio({ go }) {
  return (
    <>
      <section className="list-head portfolio-head">
        <div className="wrap">
          <h1>Selected video work.</h1>
          <p>Short form, motion, real estate, and widescreen edits playing silently as soon as the page lands.</p>
        </div>
      </section>
      <div className="wrap">
        <div className="port-grid">
          {PORTFOLIO_VIDEOS.map((item, index) => (
            <PortfolioVideoTile
              key={item.id}
              item={item}
              priority={index < 6}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const SERVICES = [
  { n: '01', name: 'Brand Film', sub: 'Full Stack Video Production', desc: 'Launch or anthem film. Concept, shoot, edit, deliver. Best when you need one sharp hero asset.', price: 'from $5k', turnaround: '4–6 weeks' },
  { n: '02', name: 'Video Editing', desc: 'You shot it, I cut it. Bring camera originals and a reference. I deliver a polished cut and grade.', price: 'from $199', turnaround: '1–2 weeks' },
  { n: '03', name: 'Motion Graphics', desc: 'Title sequences, lower thirds, explainer overlays, logo animations. After Effects native.', price: 'from $1500', turnaround: '1–3 weeks' },
  { n: '04', name: 'Consulting', desc: 'Audit of your edit workflow, stack, or short-form strategy. 90 min call plus written notes.', price: '$90/hour', turnaround: '1 week' },
];

const SVC_PROCESS = [
  { k: '01', h: 'Brief', p: 'You email a brief. I reply in 24 hours with fit, scope, and a timeline.' },
  { k: '02', h: 'Kickoff', p: '30-min call to lock creative direction. I send a written scope and invoice.' },
  { k: '03', h: 'Build', p: 'I work in small loops. Daily progress in a shared folder. Two revision rounds baked in.' },
  { k: '04', h: 'Deliver', p: 'Final masters in your preferred specs. Project file included if you want it.' },
];

const SVC_CLIENTS = ['OMI', 'Cluely', 'Starbucks', 'InterviewCoder', 'Fazm', 'University of Utah', 'Kaedim'];

function openBriefEmail() {
  const subject = 'Project brief';
  const body = [
    'Hi Alex,',
    '',
    'Here is my project brief:',
    '',
    'Project type:',
    'Scope:',
    'Timeline:',
    'Budget:',
    'Links:',
    '',
    'Best,',
    '',
  ].join('\n');
  window.location.href = `mailto:alex@alexg.mov?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Services({ go }) {
  return (
    <>
      <div className="wrap">
        <div className="svc-intro">
          <h1>Services.</h1>
        </div>

        {/* Availability strip */}
        <div className="svc-avail">
          <div className="svc-avail-dot" />
          <div>
            <div className="svc-avail-k">AVAILABILITY</div>
            <div className="svc-avail-v">Booking Q3 2026. Two slots open.</div>
          </div>
          <div className="svc-avail-divider" />
          <div>
            <div className="svc-avail-k">BASED</div>
            <div className="svc-avail-v">Remote. Travels for shoots.</div>
          </div>
          <div className="svc-avail-divider" />
          <div>
            <div className="svc-avail-k">REPLY</div>
            <div className="svc-avail-v">Within 24 hours</div>
          </div>
        </div>

        <div className="svc-list">
          {SERVICES.map(s => (
            <div key={s.n} className="svc-row">
              <div className="svc-num">{s.n}</div>
              <div>
                <div className="svc-name">{s.name}</div>
                {s.sub && <div className="svc-sub">{s.sub}</div>}
              </div>
              <div className="svc-desc">{s.desc}<div className="svc-turn">Turnaround: {s.turnaround}</div></div>
              <div className="svc-price"><span className="from">{s.price.split(' ')[0]} </span>{s.price.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="svc-process">
          <p className="section-title">PROCESS</p>
          <div className="svc-proc-grid">
            {SVC_PROCESS.map(p => (
              <div key={p.k} className="svc-proc-item">
                <div className="svc-proc-k">{p.k}</div>
                <h4 className="svc-proc-h">{p.h}</h4>
                <p className="svc-proc-p">{p.p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past clients */}
        <div className="svc-clients">
          <p className="section-title">PAST CLIENTS</p>
          <div className="svc-clients-row">
            {SVC_CLIENTS.map((c, i) => (
              <div key={i} className="svc-client">{c}</div>
            ))}
          </div>
        </div>

        <div style={{ padding: '48px 0 72px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={openBriefEmail}>Email a brief</button>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>alex@alexg.mov · reply within 24h</span>
        </div>
      </div>
    </>
  );
}

const FAQS = [
  { q: 'Do your plugins work on Windows?', a: 'Yes. Every plugin ships with a signed installer for Mac and Windows. Premiere Pro 2024 (24.0) or later.' },
  { q: 'Can I use the LUTs in client work?', a: 'Yes. Personal and commercial use are both allowed. Don\'t redistribute the files themselves or resell the pack.' },
  { q: 'Do you offer refunds?', a: 'No. These are digital downloads. Once the files hit your machine, there is no way to un-deliver them. If you hit an install bug or something is broken on my end, email me and I will fix it or replace the file.' },
  { q: 'How fast do you respond to support?', a: 'Within 24 hours on weekdays. Often same-day. Include your OS, Premiere version, and a screen recording. It cuts debugging time in half.' },
];

function Support({ go }) {
  const [open, setOpen] = React.useState(0);
  return (
    <>
      <section className="list-head">
        <div className="wrap">
          <h1>Support.</h1>
          <p>Bug reports and direct help are welcome. Reply within 24 hours on weekdays.</p>
        </div>
      </section>
      <div className="wrap">
        <div className="sup-grid">
          <div className="sup-card">
            <h3>Email me directly.</h3>
            <p style={{ color: 'var(--muted)', margin: '0 0 4px' }}>The only support channel. No ticket system, no forms. Goes straight to my inbox.</p>
            <a className="sup-email" href="mailto:alex@alexg.mov">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)' }} />
              alex@alexg.mov
            </a>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>RESPONSE · WITHIN 24 HOURS · MON–FRI</div>
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--hairline)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>INCLUDE IN YOUR EMAIL</div>
              <ul className="sup-fields">
                <li>Operating system (macOS / Windows + version)</li>
                <li>Premiere Pro version</li>
                <li>Steps to reproduce the bug</li>
                <li>Screenshot or screen recording (helps a lot)</li>
                <li>Order / download email</li>
              </ul>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 12, letterSpacing: '0.04em' }}>FREQUENTLY ASKED</div>
            <dl className="faq">
              {FAQS.map((f, i) => (
                <React.Fragment key={i}>
                  <dt className={open === i ? 'open' : ''} onClick={() => setOpen(open === i ? -1 : i)}>
                    {f.q}<span className="plus">+</span>
                  </dt>
                  <dd className={open === i ? 'open' : ''}>{f.a}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

function Terms() {
  return (
    <div className="wrap" style={{ maxWidth: 720, padding: '56px 32px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>LAST UPDATED · APR 2026</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 32px' }}>Terms.</h1>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, marginTop: 32, marginBottom: 8 }}>License</h3>
        <p>You get a personal + commercial license to use the files on your projects, for yourself or your clients. Don't redistribute the files, don't resell them, don't include them in bundles.</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, marginTop: 32, marginBottom: 8 }}>Updates</h3>
        <p>Free updates for 12 months from the purchase date. After that, upgrades are offered at a reduced price.</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, marginTop: 32, marginBottom: 8 }}>Liability</h3>
        <p>Software is provided as-is. Test on non-critical projects first. I will fix bugs promptly but cannot be liable for project-level losses.</p>
      </div>
    </div>
  );
}

function Refund() {
  return (
    <div className="wrap" style={{ maxWidth: 720, padding: '56px 32px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>LAST UPDATED · APR 2026</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 16px' }}>Refund policy.</h1>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--muted)', fontStyle: 'italic', margin: '0 0 40px' }}>All sales are final. Broken files get fixed or replaced.</p>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        <p>All sales are final. These are digital downloads. Once the files are on your machine there is no way to un-deliver them.</p>
        <p>If something is broken (install bug, missing file, LUT that will not load) email <a href="mailto:alex@alexg.mov" style={{ fontFamily: 'var(--mono)' }}>alex@alexg.mov</a> within 14 days. I will fix it or replace the file.</p>
        <p>If you bought the wrong product by mistake, email me and I will swap it for the right one.</p>
      </div>
    </div>
  );
}

Object.assign(window, { Portfolio, Services, Support, Terms, Refund });
