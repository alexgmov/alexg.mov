import React from 'react';
import { useScrollBlur } from './scroll-blur.js';
import { getVideoPosterSrc, useResponsiveVideoSrc, useMediaQuery } from './media.js';
import { PortfolioYouTubePlayer } from './portfolio-youtube.jsx';

// Portfolio, Services, Support, Terms, Refund

const PORTFOLIO_SCROLL_BLUR_SELECTOR = '[data-portfolio-scroll-blur]';

// Source destinations stay attached to each project for the story and original film link.
const PORTFOLIO_VIDEOS = [
  {
    id: 'conviction-launch-film',
    title: 'Conviction — Trading Desk in Your Pocket',
    category: 'launchbrand',
    kind: 'Product launch film',
    client: 'Conviction',
    blurb: 'A launch film introducing Conviction, an AI trading platform that turns ideas into strategies.',
    story: 'A launch film introducing Conviction: a trading desk in your pocket. Live action and product graphics follow an idea from a missed opportunity through backtesting, simulated trading, and deployment.',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7506131071520907264/',
    src: 'videos/portfolio/web/conviction-launch-film.mp4',
    filmSrc: 'videos/portfolio/web/conviction-launch-film.full.mp4',
    layout: 'landscape',
  },
  {
    id: 'wispr-flow-behind-the-scenes-youtube',
    title: 'This Is What Running a $2B AI Startup Looks Like',
    category: 'long-form-youtube',
    kind: 'Behind-the-scenes company vlog',
    client: 'Wispr Flow',
    blurb: 'A behind-the-scenes Wispr Flow vlog I filmed for the team.',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=fhs7voB2eJQ',
    posterSrc: 'https://i.ytimg.com/vi/fhs7voB2eJQ/maxresdefault.jpg',
    youtubeId: 'fhs7voB2eJQ',
    logo: 'mockups/portfolio/wispr-flow-logo.svg',
    story: 'A behind-the-scenes Wispr Flow vlog I filmed for the team.',
    outcome: 'Got 500k+ views and 12k subscribers on the channel in 3 weeks starting from zero.',
    layout: 'feature',
  },
  {
    id: 'lanesurf-ai-agent-challenge',
    title: 'Lanesurf $15K AI Agent Challenge',
    category: 'launchbrand',
    kind: 'Campaign launch film',
    client: 'Lanesurf',
    blurb: "Launch video for Lanesurf's public $15K AI freight broker challenge.",
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7490434929772621824/',
    posterSrc: 'videos/portfolio/web/lanesurf-ai-agent-challenge.poster.jpg',
    src: 'videos/portfolio/web/lanesurf-ai-agent-challenge.mp4',
    layout: 'landscape',
  },
  {
    id: 'omi-launch-film',
    logo: 'mockups/portfolio/omi-logo.png',
    logoLabel: 'omi',
    title: 'OMI launch film',
    category: 'launchbrand',
    kind: 'Product launch film',
    client: 'OMI',
    blurb: '10M views in two weeks across platforms and 100K installs.',
    story: 'The OMI launch film reached 10M views across platforms in two weeks and drove 100K installs. I handled concept, script, production, edit, and onscreen product moments.',
    source: 'X',
    sourceUrl: 'https://x.com/kodjima33/status/2044078767518138555',
    src: 'videos/portfolio/web/omi-launch-film.mp4',
    filmSrc: 'videos/portfolio/web/omi-launch-film.full.mp4',
    filmPosterSrc: 'videos/portfolio/web/omi-launch-film.full.poster.jpg',
    layout: 'feature',
  },
  {
    id: 'ekta-portrait',
    title: 'Horse Edit',
    category: 'ai-speed-ramp-edits',
    kind: 'Travel speed ramp',
    client: 'Ekta',
    blurb: 'A horse encounter in Tonga, cut with fast transitions and island scenery.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DMZNWMJRyu5/',
    src: 'videos/portfolio/web/ekta-portrait.mp4',
    layout: 'portrait offset-lg',
  },
  {
    id: 'alexg-portrait',
    title: 'Pigeon Edit',
    category: 'ai-speed-ramp-edits',
    kind: 'Surreal social edit',
    client: 'Alex Garrett',
    blurb: 'A pigeon becomes the star of a short edit with layered screens and surreal transitions.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DOyrMpyCXV0/',
    src: 'videos/portfolio/web/alexg-portrait.mp4',
    layout: 'portrait',
  },
  {
    id: 'alexg-tiktok-speed-ramp-7556166361496440077',
    title: 'Crab Battle',
    category: 'ai-speed-ramp-edits',
    kind: 'AI speed ramp edit',
    client: 'Higgsfield',
    blurb: 'Shoreline crabs reimagined as a fighting game, with character selection and a victory finish.',
    source: 'TikTok',
    sourceUrl: 'https://www.tiktok.com/@alexg.mov/video/7556166361496440077',
    src: 'videos/portfolio/web/alexg-tiktok-speed-ramp-7556166361496440077.mp4',
    layout: 'portrait offset-sm',
  },
  {
    id: 'interview-coder-linkedin',
    story: 'Introducing Interview Coder 2.0 through a founder-led launch film. A direct-to-camera story puts the person behind the product at the center.',
    posterSrc: 'videos/portfolio/web/interview-coder-work.poster.jpg',
    logo: 'mockups/portfolio/interview-coder-logo.svg',
    logoLabel: 'Interview Coder',
    title: 'Interview Coder launch film',
    category: 'launchbrand',
    kind: 'Product launch film',
    client: 'Interview Coder',
    blurb: 'Launch film for Interview Coder 2.0.',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/abdulla007_i-spent-the-last-few-months-building-interview-activity-7389017263137366017-mnw5?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/interview-coder-linkedin.mp4',
    layout: 'feature',
    videoScale: 1.023,
  },
  {
    id: 'kaedim-launch-post-featured',
    title: 'Kaedim launch post',
    category: 'launchbrand',
    kind: '3D motion launch post',
    client: 'Kaedim',
    blurb: '3D product launch asset with clean motion.',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/kaedim_today-is-a-big-milestone-for-kaedim-for-activity-7434690563268018176--REi?utm_source=share&utm_medium=member_desktop&rcm=ACoAADxqsrkB2ELwiS4XdDkChEYtbz9dxTc-INc',
    src: 'videos/portfolio/web/kaedim-linkedin.mp4',
    layout: 'landscape',
    videoScale: 1.023,
  },
  {
    id: 'cluely-launch-motion-featured',
    posterSrc: 'videos/portfolio/web/cluely-work.poster.jpg',
    title: 'Cluely launch motion graphics',
    category: 'launchbrand',
    kind: 'Product launch motion piece',
    client: 'Cluely',
    blurb: 'UI motion piece with crisp demo energy.',
    source: 'Drive',
    sourceUrl: 'https://drive.google.com/file/d/17DS1xWMJFBe0rNCXQHvWcRSJ1y_vxUPv/view',
    src: 'videos/portfolio/web/motion-graphics-drive.mp4',
    layout: 'landscape-wide',
    videoScale: 1.023,
  },
  {
    id: 'eldo-reel',
    title: 'Eldo — From the Kitchen',
    category: 'talking-heads',
    kind: 'Restaurant reel',
    client: 'Eldo',
    blurb: 'A chef introduces a dish at the counter, followed by close-ups of the finished plate.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reel/DJHzWMmoXz2/',
    src: 'videos/portfolio/web/eldo-reel.mp4',
    layout: 'portrait offset-sm',
  },
  {
    id: 'abdulla-case-study',
    title: 'Gamble Everything',
    category: 'talking-heads',
    kind: 'Founder story',
    client: 'Abdulla',
    blurb: 'Abdulla on taking risks and building a company, with direct-to-camera storytelling and supporting footage.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/DVipr1igHR3/',
    src: 'videos/portfolio/web/abdulla-case-study.mp4',
    layout: 'portrait',
  },

  {
    id: 'infiniteviews-real-estate',
    title: 'Desert Hillside Home',
    category: 'real-estate',
    kind: 'Property tour',
    client: 'Infinite Views',
    blurb: 'A hillside property tour moving from the desert setting and pool into the living spaces.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DHqw-C_pAtq/',
    src: 'videos/portfolio/web/infiniteviews-real-estate.mp4',
    layout: 'portrait offset-lg',
  },
  {
    id: 'infiniteviews-marketing',
    title: 'Waterfront Estate',
    category: 'real-estate',
    kind: 'Property tour',
    client: 'Infinite Views',
    blurb: 'A waterfront home shown through poolside shots, interior transitions, and aerial views.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DN3XI1IYksn/',
    src: 'videos/portfolio/web/infiniteviews-marketing.mp4',
    layout: 'portrait-wide',
  },
  {
    id: 'pcg-luxury-real-estate',
    title: 'Indoor–Outdoor Living',
    category: 'real-estate',
    kind: 'Property tour',
    client: 'PCG',
    blurb: 'A modern home tour connecting the kitchen and living spaces with the terrace and pool.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reels/DJ5J48LgmjQ/',
    src: 'videos/portfolio/web/pcg-luxury-real-estate.mp4',
    layout: 'portrait',
  },
  {
    id: 'pcg-private-client-reel-domos8nkfiw',
    title: 'Desert Villa',
    category: 'real-estate',
    kind: 'Property tour',
    client: 'Private Client Group',
    blurb: 'A desert home with warm exterior tones, arched interiors, and aerial views at dusk.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reel/DOMoS8nkfiw/',
    src: 'videos/portfolio/web/pcg-real-estate-domos8nkfiw.mp4',
    layout: 'portrait offset-sm',
  },
  {
    id: 'pcg-private-client-reel-diklq7kiksf',
    title: 'Courtyard Home',
    category: 'real-estate',
    kind: 'Property tour',
    client: 'Private Client Group',
    blurb: 'A home tour moving from the courtyard into bright living spaces and interior details.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/reel/DIkLq7kiKSF/',
    src: 'videos/portfolio/web/pcg-real-estate-diklq7kiksf.mp4',
    layout: 'portrait',
  },
  {
    id: 'snowflakes-youtube',
    title: 'Snowflake Research Documentary',
    category: 'short-film',
    kind: 'Snowflake research documentary',
    client: 'University of Utah',
    blurb: 'A documentary about snowflake research at the University of Utah.',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=RE6ahIf3kwA&t=61s',
    src: 'videos/portfolio/web/snowflakes-youtube.mp4',
    layout: 'landscape',
    videoScale: 1.023,
  },
  {
    id: 'wide-youtube',
    posterSrc: 'videos/portfolio/web/widescreen-work.poster.jpg',
    title: 'What Lies Beyond',
    category: 'short-film',
    kind: 'Short film',
    client: null,
    blurb: 'What Lies Beyond, a cinematic short film.',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/watch?v=xTR8c4j_DKk&t=13s',
    src: 'videos/portfolio/web/wide-youtube.mp4',
    layout: 'landscape-wide offset-sm',
    videoScale: 1.35,
  },
  {
    id: 'ashlie-realtor',
    title: 'Dream Home Advice',
    category: 'talking-heads',
    kind: 'Realtor tips',
    client: 'Ashlie Brewer',
    blurb: 'Ashlie Brewer shares dream-home advice in a direct-to-camera reel with animated captions.',
    source: 'Instagram',
    sourceUrl: 'https://www.instagram.com/p/C4gJ_6qut97/',
    src: 'videos/portfolio/web/ashlie-realtor.mp4',
    layout: 'portrait',
  },

];

const FEATURED_PORTFOLIO_IDS = [
  'omi-launch-film', 'wispr-flow-behind-the-scenes-youtube', 'interview-coder-linkedin',
];
const FEATURED_PORTFOLIO = FEATURED_PORTFOLIO_IDS.map((id) => PORTFOLIO_VIDEOS.find((item) => item.id === id));
const HORIZONTAL_PORTFOLIO = PORTFOLIO_VIDEOS.filter((item) => !item.layout.includes('portrait'));
const VERTICAL_PORTFOLIO = PORTFOLIO_VIDEOS.filter((item) => item.layout.includes('portrait'));

const FEATURED_SERVICE_CASE_STUDY = window.OMI_CASE_STUDY || {
  client: 'OMI',
  impactValue: '10M',
  impactUnit: 'ORGANIC VIEWS',
  label: 'OMI LAUNCH FILM · X + INSTAGRAM · 2025',
  heroTitle: "Directed OMI's launch film and drove 10M organic views.",
  summary: 'OMI needed a launch film built for reach. I handled concept, script, production, edit, and onscreen product moments.',
  videoSrc: 'videos/portfolio/web/omi-launch-film.mp4',
  services: ['Brand Film', 'Video Editing', 'Motion Graphics'],
  detailSections: [
    {
      title: 'Brief',
      body: 'OMI needed a launch film with one KPI: reach. I led the concept, script, production, edit, and delivery.',
    },
    {
      title: 'Execution',
      body: 'I pivoted to a sharper narrative, ran overnight casting, and managed a lean New York shoot under a tight timeline.',
    },
    {
      title: 'Post + outcome',
      body: 'I cut the spot, shaped the voice and UI moments, and the launch reached 10M organic views across X and Instagram.',
    },
  ],
};

function PortfolioVideoTile({ item, featured = false, onOpen }) {
  const cardRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const [visible, setVisible] = React.useState(!document.hidden);
  const [failed, setFailed] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const playbackSrc = useResponsiveVideoSrc(item.src);
  const active = ((hovered && canHover) || focused) && inView && visible && !reduceMotion && !failed;
  const poster = item.posterSrc || getVideoPosterSrc(item.src);
  const cardTitle = item.layout.includes('portrait') ? item.title : item.client || item.title;

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(cardRef.current);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return undefined;
    let cancelled = false;
    if (video.getAttribute('src') !== playbackSrc) {
      video.src = playbackSrc;
      video.load();
    }
    const pending = video.play();
    if (pending) pending.then(() => { if (cancelled) video.pause(); }).catch(() => {});
    return () => { cancelled = true; video.pause(); };
  }, [active, playbackSrc]);

  return (
    <a
      ref={cardRef}
      href={`?page=portfolio&project=${item.id}`}
      className={'work-card' + (featured ? ' work-card-featured' : '')}
      style={{ '--video-scale': item.videoScale || 1 }}
      data-portfolio-id={item.id}
      data-portfolio-scroll-blur
      aria-label={`View ${item.title}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        setHovered(false);
        setFocused(false);
        onOpen(item);
      }}
    >
      <img className="work-poster" src={poster} alt="" loading={featured ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
      {item.src && !failed && (
        <video ref={videoRef} className={active && ready ? 'work-preview is-playing' : 'work-preview'}
          muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}
          onPlaying={() => setReady(true)} onError={() => setFailed(true)} disablePictureInPicture />
      )}
      {item.youtubeId && active && (
        <PortfolioYouTubePlayer item={item} preview onUnavailable={() => setFailed(true)} />
      )}
      <span className="work-shade" />
      {featured && (
        <span className={'work-logo' + (item.logoLabel ? ' work-logo-with-label' : '')} aria-hidden="true">
          <img src={item.logo} alt="" />
          {item.logoLabel && <span>{item.logoLabel}</span>}
        </span>
      )}
      <span className="work-card-arrow" aria-hidden="true">↗</span>
      <span className="work-caption">
        <span className="work-client">{cardTitle}</span>
        <span className="work-description">{item.kind}</span>
      </span>
      {featured && <span className="work-story-hint" aria-hidden="true">View project ↗</span>}
    </a>
  );
}

function PortfolioProjectStory({ item, onClose }) {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(null);
  const previewSrc = useResponsiveVideoSrc(item?.src);

  React.useEffect(() => {
    if (!item) return undefined;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [item]);

  if (!item) return null;
  const omi = item.id === 'omi-launch-film';
  return (
    <dialog ref={dialogRef} className="work-story" aria-labelledby="work-story-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="work-story-inner">
        <div className="work-story-nav">
          <span>{item.client || item.title} / {item.kind}</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close project">Back to work <span aria-hidden="true">×</span></button>
        </div>
        <div className={'work-story-media' + (item.layout.includes('portrait') ? ' is-portrait' : '')}
          style={item.youtubeId ? { backgroundImage: `url("${item.posterSrc}")`, backgroundSize: 'cover' } : undefined}>
          {item.youtubeId ? (
            <PortfolioYouTubePlayer key={item.id} item={item} />
          ) : item.src ? (
            <video key={item.id} src={item.filmSrc || previewSrc} poster={item.filmPosterSrc || item.posterSrc || getVideoPosterSrc(item.src)} controls playsInline preload="metadata" />
          ) : <img src={item.posterSrc} alt={item.title} />}
        </div>
        <div className="work-story-copy">
          <div>
            <p className="work-eyebrow">{item.client || item.kind}</p>
            <h2 id="work-story-title">{item.title}</h2>
            <p className="work-story-summary">{item.story || (omi ? FEATURED_SERVICE_CASE_STUDY.summary : item.blurb)}</p>
            {item.outcome && <p className="work-story-outcome">{item.outcome}</p>}
            <a className="work-original" href={item.sourceUrl || item.src} target="_blank" rel="noopener noreferrer">
              Watch original on {item.source} <span aria-hidden="true">↗</span>
            </a>
            {!item.youtubeId && !item.filmSrc && <p className="work-preview-note">Preview above. Watch the full film at the original link.</p>}
          </div>
          <dl className="work-story-facts">
            {item.client && <div><dt>Client</dt><dd>{item.client}</dd></div>}
            <div><dt>Project</dt><dd>{item.kind}</dd></div>
            {omi && <div><dt>Scope</dt><dd>{FEATURED_SERVICE_CASE_STUDY.services.join(' / ')}</dd></div>}
            {item.youtubeId && <div><dt>Role</dt><dd>Filming</dd></div>}
          </dl>
        </div>
        {omi && <div className="work-story-chapters">
          {FEATURED_SERVICE_CASE_STUDY.detailSections.map((section) => (
            <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>
          ))}
        </div>}
      </div>
    </dialog>
  );
}

function PortfolioAbout() {
  const facts = [
    {
      label: 'Distribution',
      value: 'Founder-led short-form systems',
    },
    {
      label: 'Background',
      value: 'Computer Science + a decade of production',
    },
    {
      label: 'Focus',
      value: 'Products, launches, and cultural moments',
    },
  ];

  return (
    <section className="portfolio-about" aria-labelledby="portfolio-about-title">
      <div className="portfolio-about-intro" data-portfolio-scroll-blur>
        <p className="portfolio-about-kicker">About Alex</p>
        <div className="portfolio-about-copy">
          <h2 id="portfolio-about-title">Creative direction for technical products that need attention to convert.</h2>
          <p>
            Alex Garrett is a creative director and software engineer obsessed with founder-led distribution. He's built viral videos for some of the most ambitious AI startups and creators of this generation, racking up tens of millions of views and turning technical products into cultural moments on short-form. With a Computer Science degree from the University of Victoria and a decade of video production experience, Alex sits at a rare intersection: he can read a product spec, produce the launch video, and build the funnel that converts the attention. He's spent the last two years quietly becoming one of the most effective shorts strategists working with founders, and he's now turning that playbook into products of his own.
          </p>
        </div>
      </div>
      <div className="portfolio-about-facts" aria-label="About Alex Garrett" data-portfolio-scroll-blur>
        {facts.map((fact) => (
          <div className="portfolio-about-fact" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function Portfolio() {
  const readProject = () => PORTFOLIO_VIDEOS.find((item) => item.id === new URLSearchParams(window.location.search).get('project')) || null;
  const [project, setProject] = React.useState(readProject);
  useScrollBlur(PORTFOLIO_SCROLL_BLUR_SELECTOR);

  React.useEffect(() => {
    const onPopState = () => setProject(readProject());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openProject = (item) => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', item.id);
    window.history.pushState({ ...window.history.state, portfolioProject: true }, '', url);
    setProject(item);
  };
  const closeProject = () => {
    if (window.history.state?.portfolioProject) window.history.back();
    else {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      window.history.replaceState(window.history.state, '', url);
      setProject(null);
    }
  };

  return (
    <div className="portfolio-page">
      <header className="work-heading">
        <div><p className="work-eyebrow">Alex Garrett / Selected projects</p><h1>Recent Work</h1></div>
      </header>
      <section className="work-featured" aria-label="Featured projects">
        {FEATURED_PORTFOLIO.map((item) => <PortfolioVideoTile key={item.id} item={item} featured onOpen={openProject} />)}
      </section>
      <section className="work-collection" aria-label="All horizontal films">
        <div className="work-collection-label"><span>The films</span><span>{String(HORIZONTAL_PORTFOLIO.length).padStart(2, '0')} projects</span></div>
        <div className="work-grid">
          {HORIZONTAL_PORTFOLIO.map((item) => <PortfolioVideoTile key={item.id} item={item} onOpen={openProject} />)}
        </div>
      </section>
      <section className="work-vertical" aria-label="Vertical films">
        <div className="work-divider"><span>Short form content</span><span>9:16 / In motion</span></div>
        <div className="work-zigzag">
          {VERTICAL_PORTFOLIO.map((item) => <PortfolioVideoTile key={item.id} item={item} onOpen={openProject} />)}
        </div>
      </section>
      <PortfolioAbout />
      <PortfolioProjectStory item={project} onClose={closeProject} />
    </div>
  );
}

const SERVICES = [
  { n: '01', name: 'Brand Film', sub: 'Full Stack Video Production', desc: 'Concept, shoot, edit, and delivery for one sharp hero asset.', price: 'from $10k', turnaround: '4–6 weeks' },
  { n: '02', name: 'Video Editing', desc: 'You shot it, I cut it. Bring camera originals and a reference. I deliver a polished cut and grade.', price: 'from $199', turnaround: '1–2 weeks' },
  { n: '03', name: 'Motion Graphics', desc: 'Titles, lower thirds, explainers, and logo motion. After Effects native.', price: 'from $1500', turnaround: '1–3 weeks' },
  { n: '04', name: 'Consulting', desc: 'Workflow, stack, or short-form strategy audit. 90-minute call plus notes.', price: '$90/hour', turnaround: '1 week' },
];

const SVC_PROCESS = [
  { k: '01', h: 'Brief', p: 'Email a brief. I reply within 24 hours with fit, scope, and timeline.' },
  { k: '02', h: 'Kickoff', p: '30-minute call, written scope, and invoice.' },
  { k: '03', h: 'Build', p: 'Small work loops, shared progress, and two revision rounds.' },
  { k: '04', h: 'Deliver', p: 'Final masters in your specs. Project file available on request.' },
];

const SVC_CLIENTS = ['OMI', 'Cluely', 'Starbucks', 'InterviewCoder', 'Fazm', 'University of Utah', 'Kaedim'];
const SVC_TESTIMONIALS = [
  {
    id: 'founder-launch',
    label: 'Sample founder quote',
    avatar: { initials: 'CF', from: '#7fc8ff', to: '#ffb870' },
    quote: 'Alex turned a moving launch brief into a sharp film from the first second.',
    author: 'Consumer app founder',
    role: 'Launch film',
  },
  {
    id: 'product-marketing',
    label: 'Sample marketing quote',
    avatar: { initials: 'PM', from: '#ffcd94', to: '#b9f2d5' },
    quote: 'He found the story, tightened the hook, and made the product clear.',
    author: 'Product marketing lead',
    role: 'Software launch asset',
  },
  {
    id: 'creative-director',
    label: 'Sample creative quote',
    avatar: { initials: 'CD', from: '#9fd5ff', to: '#d7b8ff' },
    quote: 'Fast turnaround, clean pacing, and polished motion.',
    author: 'Creative director',
    role: 'Motion graphics sprint',
  },
  {
    id: 'real-estate',
    label: 'Sample client quote',
    avatar: { initials: 'RE', from: '#ffd6a5', to: '#89c2d9' },
    quote: 'We sent raw footage and a loose direction. The final cut felt clear and premium.',
    author: 'Real estate team lead',
    role: 'Vertical property promo',
  },
  {
    id: 'restaurant',
    label: 'Sample hospitality quote',
    avatar: { initials: 'HO', from: '#f5b7b1', to: '#f9e79f' },
    quote: 'Alex found the strongest moments fast and made people stop scrolling.',
    author: 'Hospitality owner',
    role: 'Short-form social edit',
  },
  {
    id: 'operator',
    label: 'Sample operator quote',
    avatar: { initials: 'SO', from: '#a3e4d7', to: '#f5cba7' },
    quote: 'Writing, directing, editing, and finishing in one place made the deadline lighter.',
    author: 'Startup operator',
    role: 'Founder-led campaign',
  },
];

function getTestimonialAvatarSrc(avatar) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="avatarGradient" x1="14" y1="12" x2="82" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${avatar.from}"/>
          <stop offset="1" stop-color="${avatar.to}"/>
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .16"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#avatarGradient)"/>
      <rect width="96" height="96" rx="48" filter="url(#grain)" opacity=".34"/>
      <path d="M16 74c11-16 22-24 33-24 12 0 23 8 34 24v22H16V74Z" fill="rgba(12,12,13,.34)"/>
      <circle cx="48" cy="35" r="18" fill="rgba(12,12,13,.24)"/>
      <text x="48" y="57" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#fff">${avatar.initials}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

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
  const videoSrc = useResponsiveVideoSrc(study.videoSrc);
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
              src={videoSrc}
              poster={getVideoPosterSrc(study.videoSrc)}
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
          <h2>Proof from the other end of the deadline.</h2>
        </div>
        <p>Sample placeholders for the final testimonial section.</p>
      </div>
      <div className="svc-testimonial-rail" aria-label="Sample testimonial panels">
        {SVC_TESTIMONIALS.map((item, index) => (
          <article key={item.id} className="svc-testimonial" data-default-open={index === 0 ? 'true' : 'false'}>
            <div className="svc-testimonial-inner">
              <div className="svc-testimonial-top">
                <div className="svc-testimonial-person">
                  <img
                    className="svc-testimonial-avatar"
                    src={getTestimonialAvatarSrc(item.avatar)}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="svc-testimonial-person-copy">
                    <strong>{item.author}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
                <span className="svc-testimonial-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <span className="svc-testimonial-chip">{item.label}</span>
              <div className="svc-testimonial-full">
                <blockquote>{item.quote}</blockquote>
              </div>
              <div className="svc-testimonial-peek" aria-hidden="true">
                <span>{item.quote}</span>
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
          <p className="svc-mobile-intro-copy">Launch films, edits, and motion work with a clear brief, fast feedback loops, and direct email access.</p>
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
        <a className="btn btn-primary btn-lg svc-mobile-brief-cta" href={getBriefMailtoHref()}>Email a brief</a>

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

        {/* TODO: Re-enable the testimonials section once it is ready to feel happy on the page. */}
        {/* <ServiceTestimonials /> */}

        <div style={{ padding: '48px 0 72px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <a className="btn btn-primary btn-lg" href={getBriefMailtoHref()}>Email a brief</a>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>alex@alexg.mov · reply within 24h</span>
        </div>
      </div>
    </>
  );
}

const FAQS = window.FAQS || [
  { q: 'Do your plugins work on Windows?', a: 'Sidestream is Mac-first right now through the signed native installer DMG. Email support if you need a Windows fallback.' },
  { q: 'Can I use the LUTs in client work?', a: 'Yes. Personal and commercial use are both allowed. Don\'t redistribute the files themselves or resell the pack.' },
  { q: 'Do you offer refunds?', a: 'No. These are digital downloads, so all sales are final. If something is broken on my end, email me and I will fix or replace it.' },
  { q: 'How fast do you respond to support?', a: 'Within 24 hours on weekdays. Include your OS, Premiere version, and a screen recording if possible.' },
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
            <p style={{ color: 'var(--muted)', margin: '0 0 4px' }}>No ticket system, no forms. Straight to my inbox.</p>
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
        <p>You can use the files on personal and client projects. Don't redistribute, resell, or bundle them.</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, marginTop: 32, marginBottom: 8 }}>Updates</h3>
        <p>Free updates for 12 months from the purchase date. After that, upgrades are offered at a reduced price.</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, marginTop: 32, marginBottom: 8 }}>Liability</h3>
        <p>Software is provided as-is. Test on non-critical projects first. I will fix bugs promptly, but cannot cover project-level losses.</p>
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
        <p>All sales are final because these are digital downloads.</p>
        <p>If something is broken, email <a href="mailto:alex@alexg.mov" style={{ fontFamily: 'var(--mono)' }}>alex@alexg.mov</a> within 14 days. I will fix it or replace the file.</p>
        <p>If you bought the wrong product by mistake, email me and I will swap it for the right one.</p>
      </div>
    </div>
  );
}

function CheckoutSuccess({ go }) {
  const [state, setState] = React.useState({ status: 'loading', email: '', productName: 'your files' });

  React.useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (!sessionId) {
      setState({ status: 'missing', email: '', productName: 'your files' });
      return;
    }

    let cancelled = false;
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (!cancelled) {
          setState({
            status: 'ready',
            email: data.email || '',
            productName: data.productName || 'your files',
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', email: '', productName: 'your files' });
      });

    return () => { cancelled = true; };
  }, []);

  const emailText = state.email || 'the email you used at checkout';
  const downloadEmailText = state.productName === 'your files'
    ? 'download email'
    : `${state.productName} download email`;

  return (
    <main className="success-page">
      <div className="success-confetti" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} style={{
            '--x': `${(i * 37) % 100}%`,
            '--delay': `${(i % 9) * 90}ms`,
            '--dur': `${1100 + (i % 7) * 120}ms`,
            '--rot': `${(i * 29) % 180}deg`,
          }} />
        ))}
      </div>

      <section className="success-panel">
        <div className="success-mark"><CheckIcon size={24} /></div>
        <p className="success-kicker">Order complete</p>
        <h1>Thank you.</h1>

        {state.status === 'loading' ? (
          <p className="success-copy">Confirming your order and preparing the download email.</p>
        ) : (
          <p className="success-copy">
            Your {downloadEmailText} was sent to <strong>{emailText}</strong>.
            Check your inbox, and peek at spam if it does not show up in a minute or two.
          </p>
        )}

        {state.status === 'error' && (
          <p className="success-note">I could not load the order details here. If checkout completed, the download email still sends automatically.</p>
        )}

        <button className="btn btn-primary btn-lg success-back" onClick={() => { window.location.href = '/'; }}>
          Go back
        </button>
      </section>
    </main>
  );
}

Object.assign(window, { Portfolio, Services, Support, Terms, Refund, CheckoutSuccess, FAQS });
