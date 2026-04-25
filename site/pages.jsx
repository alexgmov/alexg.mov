// Portfolio, Services, Support, Terms, Refund

// Keep source links and per-project metadata on each tile so the next
// click-through / project-file purchase layer can attach to this same model.
const PORTFOLIO_CATEGORIES = [
  {
    id: 'launchbrand',
    label: 'Launch / Brand',
    kicker: '01',
    intro: 'Launch films, founder-led announcements, and brand pieces built to land fast and feel premium on first view.',
  },
  {
    id: 'motion-graphics',
    label: 'Motion Graphics',
    kicker: '02',
    intro: 'Typography, transitions, and designed movement that helps the message feel sharper without getting noisy.',
  },
  {
    id: 'ai-speed-ramp-edits',
    label: 'Speed Ramp Edits',
    kicker: '03',
    intro: 'Fast, stylized social edits built around punchy pacing, kinetic motion, and sharper visual acceleration.',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    kicker: '04',
    intro: 'Property promos, realtor-led spots, and high-end real estate edits designed to sell mood as much as square footage.',
  },
  {
    id: 'short-film',
    label: 'Short Films',
    kicker: '05',
    intro: 'Widescreen edits with more room to breathe, focused on pacing, tone, and cinematic atmosphere.',
  },
  {
    id: 'business-promos',
    label: 'Business Promos',
    kicker: '06',
    intro: 'Business-facing edits for restaurants, local brands, and other client work that needs to advertise clearly and still feel polished.',
  },
];

const PORTFOLIO_VIDEOS = [
  {
    id: 'omi-launch-film',
    title: 'OMI launch film',
    category: 'launchbrand',
    kind: 'Product launch film',
    blurb: 'A full-stack launch film that drove 5.5M views.',
    source: 'alexg.mov',
    sourceUrl: 'videos/portfolio/web/omi-launch-film.mp4',
    src: 'videos/portfolio/web/omi-launch-film.mp4',
    layout: 'feature',
  },
  {
    id: 'ekta-portrait',
    title: 'Ekta portrait cut',
    category: 'ai-speed-ramp-edits',
    kind: 'Portrait social reel',
    blurb: 'A clean portrait reel with a quiet cinematic feel.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DMZNWMJRyu5/',
    src: 'videos/portfolio/web/ekta-portrait.mp4',
    layout: 'portrait offset-lg',
  },
  {
    id: 'alexg-portrait',
    title: 'Alex Garrett social spot',
    category: 'ai-speed-ramp-edits',
    kind: 'Personal brand spot',
    blurb: 'A fast personal-brand spot with sharper visual rhythm.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DOyrMpyCXV0/',
    src: 'videos/portfolio/web/alexg-portrait.mp4',
    layout: 'portrait',
  },
  {
    id: 'interview-coder-linkedin',
    title: 'Interview Coder launch film',
    category: 'launchbrand',
    kind: 'Product launch film',
    blurb: 'A high-stakes launch film for Interview Coder 2.0.',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/abdulla007_i-spent-the-last-few-months-building-interview-activity-7389017263137366017-mnw5?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/interview-coder-linkedin.mp4',
    layout: 'feature',
    videoScale: 1.023,
  },
  {
    id: 'eldo-reel',
    title: 'Eldo reel',
    category: 'business-promos',
    kind: 'Restaurant promo',
    blurb: 'A punchy restaurant promo built around one hero dish.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reel/DJHzWMmoXz2/',
    src: 'videos/portfolio/web/eldo-reel.mp4',
    layout: 'portrait offset-sm',
  },
  {
    id: 'abdulla-case-study',
    title: 'Abdulla case study',
    category: 'launchbrand',
    kind: 'Founder case study',
    blurb: 'A founder-facing startup edit with momentum and polish.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DVipr1igHR3/',
    src: 'videos/portfolio/web/abdulla-case-study.mp4',
    layout: 'portrait',
  },
  {
    id: 'motion-graphics-drive',
    title: 'Motion graphics build',
    category: 'motion-graphics',
    kind: 'Product UI motion piece',
    blurb: 'A clean UI motion piece with sharper demo energy.',
    source: 'Drive',
    sourceUrl: 'https://drive.google.com/file/d/17DS1xWMJFBe0rNCXQHvWcRSJ1y_vxUPv/view',
    src: 'videos/portfolio/web/motion-graphics-drive.mp4',
    layout: 'landscape-wide offset-md',
    videoScale: 1.023,
  },
  {
    id: 'abdulla-showcase',
    title: 'Abdulla showcase cut',
    category: 'launchbrand',
    kind: 'Showcase edit',
    blurb: 'A build showcase cut for Interview Coder 3.0.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DVrfbfvjkko/',
    src: 'videos/portfolio/web/abdulla-showcase.mp4',
    layout: 'portrait',
  },
  {
    id: 'infiniteviews-real-estate',
    title: 'Real estate tour promo',
    category: 'real-estate',
    kind: 'Property tour promo',
    blurb: 'A polished vertical walkthrough with premium pacing.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DHqw-C_pAtq/',
    src: 'videos/portfolio/web/infiniteviews-real-estate.mp4',
    layout: 'portrait offset-lg',
  },
  {
    id: 'infiniteviews-marketing',
    title: 'Infinite Views marketing reel',
    category: 'real-estate',
    kind: 'Marketing reel',
    blurb: 'A fast brand reel for a real estate team.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DN3XI1IYksn/',
    src: 'videos/portfolio/web/infiniteviews-marketing.mp4',
    layout: 'portrait-wide',
  },
  {
    id: 'pcg-luxury-real-estate',
    title: 'Luxury real estate promo',
    category: 'real-estate',
    kind: 'Luxury listing promo',
    blurb: 'A smooth luxury listing edit with a polished finish.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DJ5J48LgmjQ/',
    src: 'videos/portfolio/web/pcg-luxury-real-estate.mp4',
    layout: 'portrait',
  },
  {
    id: 'snowflakes-youtube',
    title: 'Snowflakes widescreen preview',
    category: 'short-film',
    kind: 'Widescreen short',
    blurb: 'A widescreen science short about avalanche prevention.',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=RE6ahIf3kwA&t=61s',
    src: 'videos/portfolio/web/snowflakes-youtube.mp4',
    layout: 'landscape',
    videoScale: 1.023,
  },
  {
    id: 'wide-youtube',
    title: 'Widescreen interview preview',
    category: 'short-film',
    kind: 'Interview short',
    blurb: 'An experimental short with a slower cinematic mood.',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=xTR8c4j_DKk&t=13s',
    src: 'videos/portfolio/web/wide-youtube.mp4',
    layout: 'landscape-wide offset-sm',
    videoScale: 1.35,
  },
  {
    id: 'ashlie-realtor',
    title: 'Ashlie Brewer realtor reel',
    category: 'real-estate',
    kind: 'Realtor social reel',
    blurb: 'A realtor-led reel with a clear dream-home hook.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/C4gJ_6qut97/',
    src: 'videos/portfolio/web/ashlie-realtor.mp4',
    layout: 'portrait',
  },
  {
    id: 'kaedim-linkedin',
    title: 'Kaedim launch post',
    category: 'motion-graphics',
    kind: '3D motion launch post',
    blurb: 'A 3D product launch asset with clean motion design.',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/kaedim_today-is-a-big-milestone-for-kaedim-for-activity-7434690563268018176--REi?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/kaedim-linkedin.mp4',
    layout: 'landscape',
    videoScale: 1.023,
  },
];

const PORTFOLIO_SECTIONS = PORTFOLIO_CATEGORIES.map((category) => ({
  ...category,
  items: PORTFOLIO_VIDEOS.filter((item) => item.category === category.id),
}));

const FEATURED_SERVICE_CASE_STUDY = window.OMI_CASE_STUDY || {
  client: 'OMI',
  impactValue: '5.5',
  impactUnit: 'M VIEWS',
  impactWindow: 'in 4 days',
  label: 'OMI LAUNCH FILM · X + INSTAGRAM · 2025',
  heroTitle: "Directed OMI's launch film end-to-end and drove 5.5M views in four days.",
  summary: 'OMI needed a launch asset built for reach. I owned the concept, script, direction, production, edit, and the product UI moments that made the assistant feel alive onscreen.',
  videoSrc: 'videos/portfolio/web/omi-launch-film.mp4',
  services: ['Brand Film', 'Video Editing', 'Motion Graphics'],
  detailSections: [
    {
      title: 'Brief',
      body: 'OMI needed a launch film with one clear KPI: reach. I produced and directed the project end-to-end, owning the concept, scripting, and full creative execution from first idea through final delivery.',
    },
    {
      title: 'Execution',
      body: 'To maximize distribution, I led a rapid pivot to a higher-stakes narrative designed to create emotion and debate without losing polish. I built a fast shoot plan, ran casting overnight, assembled a three-actor lineup, and managed lean production in New York City under intense time pressure.',
    },
    {
      title: 'Post + outcome',
      body: 'In post, I cut the final spot and engineered the voice and on-screen product moments that made the assistant feel alive. The launch broke out quickly, driving 5.5M views across X and Instagram in four days.',
    },
  ],
};

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
      video.preload = priority ? 'metadata' : 'none';
      video.src = item.src;
      video.load();
    };

    const play = () => {
      ensureHydrated();
      if (video.preload !== 'auto') {
        video.preload = 'auto';
        video.load();
      }
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
      threshold: 0.01,
      rootMargin: '180px 0px',
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
      style={{ '--video-scale': item.videoScale || 1 }}
      data-portfolio-id={item.id}
      data-category={item.category}
      data-source={item.source}
      data-source-url={item.sourceUrl}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={priority ? item.src : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'metadata' : 'none'}
        aria-label={item.title}
        title={item.title}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />
      <div className="port-overlay">
        <div className="port-caption">
          <p className="port-kicker">{item.kind}</p>
          <h3 className="port-title">{item.title}</h3>
        </div>
        <div className="port-details">
          <p className="port-copy">{item.blurb}</p>
          <div className="port-actions">
            <a
              className="port-link"
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Watch ${item.title} on ${item.source}`}
            >
              Watch
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function PortfolioCategorySection({ category, priority = false }) {
  return (
    <section
      id={`portfolio-${category.id}`}
      className="portfolio-section"
      data-category={category.id}
    >
      <div className="portfolio-section-head">
        <div className="portfolio-section-copy">
          <div>
            <h2>{category.label}</h2>
            <p>{category.intro}</p>
          </div>
          <span className="portfolio-count">{category.items.length} pieces</span>
        </div>
      </div>
      <div className="portfolio-rail">
        {category.items.map((item, index) => (
          <PortfolioVideoTile
            key={item.id}
            item={item}
            priority={priority && index < 2}
          />
        ))}
      </div>
    </section>
  );
}

function Portfolio({ go }) {
  const [activeCategory, setActiveCategory] = React.useState(PORTFOLIO_SECTIONS[0].id);

  React.useEffect(() => {
    const sections = PORTFOLIO_SECTIONS.map((category) =>
      document.getElementById(`portfolio-${category.id}`)
    ).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveCategory(visible.target.dataset.category || PORTFOLIO_SECTIONS[0].id);
    }, {
      threshold: [0.2, 0.35, 0.5, 0.7],
      rootMargin: '-18% 0px -48% 0px',
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const section = document.getElementById(`portfolio-${categoryId}`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="list-head portfolio-head">
        <div className="wrap">
          <h1>Selected Video Work</h1>
          <div className="portfolio-jump-wrap">
            <div className="portfolio-jump-list" aria-label="Portfolio categories">
              {PORTFOLIO_SECTIONS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={"portfolio-jump" + (activeCategory === category.id ? ' active' : '')}
                  onClick={() => scrollToCategory(category.id)}
                >
                  <span>{category.label}</span>
                  <strong>{category.items.length}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="portfolio-body">
          {PORTFOLIO_SECTIONS.map((category, index) => (
            <PortfolioCategorySection
              key={category.id}
              category={category}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const SERVICES = [
  { n: '01', name: 'Brand Film', sub: 'Full Stack Video Production', desc: 'Launch or anthem film. Concept, shoot, edit, deliver. Best when you need one sharp hero asset.', price: 'from $10k', turnaround: '4–6 weeks' },
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
const SVC_TESTIMONIALS = [
  {
    id: 'founder-launch',
    label: 'Sample founder quote',
    quote: 'Alex took a moving launch brief and turned it into a film that felt sharp, expensive, and deliberate from the first second.',
    author: 'Consumer app founder',
    role: 'Launch film',
  },
  {
    id: 'product-marketing',
    label: 'Sample marketing quote',
    quote: 'He did more than cut footage. He found the story, tightened the hook, and made the product easier to understand immediately.',
    author: 'Product marketing lead',
    role: 'Software launch asset',
  },
  {
    id: 'creative-director',
    label: 'Sample creative quote',
    quote: 'The turnaround was fast without ever feeling rushed. The pacing, motion details, and final polish all felt considered.',
    author: 'Creative director',
    role: 'Motion graphics sprint',
  },
  {
    id: 'real-estate',
    label: 'Sample client quote',
    quote: 'We handed over raw footage and a loose direction. What came back felt premium, clear, and much stronger than what we could have done internally.',
    author: 'Real estate team lead',
    role: 'Vertical property promo',
  },
  {
    id: 'restaurant',
    label: 'Sample hospitality quote',
    quote: 'Alex found the strongest visual moments immediately and turned them into something that actually made people stop scrolling.',
    author: 'Hospitality owner',
    role: 'Short-form social edit',
  },
  {
    id: 'operator',
    label: 'Sample operator quote',
    quote: 'Having one person who can write, direct, edit, and finish the piece removes a huge amount of overhead when the deadline is real.',
    author: 'Startup operator',
    role: 'Founder-led campaign',
  },
];

function getBriefMailtoHref() {
  const subject = 'Project brief inquiry';
  const body = [
    'Hi Alex,',
    '',
    'I would like to inquire about a project.',
    '',
    'Project type:',
    'Scope:',
    'Video length:',
    'Timeline:',
    'Budget range:',
    'Distribution platform:',
    'References / links:',
    '',
    'Best,',
    '',
  ].join('\n');
  return `mailto:alex@alexg.mov?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ServiceCaseStudyCard({ study }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <article className="svc-case-card">
      <div className="svc-case-main">
        <div className="svc-case-head">
          <div>
            <p className="section-title">CASE STUDY · {study.client}</p>
            <h3>{study.heroTitle}</h3>
          </div>
        </div>
        {study.videoSrc && (
          <div className="svc-case-video">
            <video
              src={study.videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${study.client} launch film`}
              title={`${study.client} launch film`}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            />
          </div>
        )}
        <p className="svc-case-summary">{study.summary}</p>
        <button
          className="svc-case-more"
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((open) => !open)}
        >
          <span>See more</span>
          <span className="svc-case-more-arrow" aria-hidden="true" />
        </button>
        <div className="svc-case-more-panel" data-open={isExpanded ? 'true' : 'false'}>
          <div className="svc-case-more-copy">
            {study.detailSections.map((section) => (
              <section key={section.title} className="svc-case-detail">
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ServiceTestimonials() {
  return (
    <section className="svc-testimonials" aria-label="Sample testimonials">
      <div className="svc-testimonials-intro">
        <div>
          <p className="section-title">TESTIMONIALS</p>
          <h2>Quick proof from the people on the other end of the deadline.</h2>
        </div>
        <p>Hover across the panels to preview the different quotes. These are sample placeholders for the final testimonial section.</p>
      </div>
      <div className="svc-testimonial-rail" aria-label="Sample testimonial panels">
        {SVC_TESTIMONIALS.map((item, index) => (
          <article key={item.id} className="svc-testimonial" data-default-open={index === 0 ? 'true' : 'false'}>
            <div className="svc-testimonial-inner">
              <div className="svc-testimonial-top">
                <span className="svc-testimonial-chip">{item.label}</span>
                <span className="svc-testimonial-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="svc-testimonial-full">
                <blockquote>{item.quote}</blockquote>
                <div className="svc-testimonial-author">
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
              <div className="svc-testimonial-peek" aria-hidden="true">
                <strong>{item.author}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
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

        <section id="service-case-studies" className="svc-case-studies">
          <ServiceCaseStudyCard study={FEATURED_SERVICE_CASE_STUDY} />
        </section>

        <ServiceTestimonials />

        <div style={{ padding: '48px 0 72px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <a className="btn btn-primary btn-lg" href={getBriefMailtoHref()}>Email a brief</a>
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
