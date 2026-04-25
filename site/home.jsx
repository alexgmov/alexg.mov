// Home page. personal site first, shop second

// Location database. each location carries a wireframe map profile
// (coastlines + landmarks as SVG polylines in a local 1000x600 viewBox)
// so the map renders aesthetically for any place we pin.
const LOCATIONS = {
  'ko-samui': {
    city: 'Ko Samui',
    country: 'Thailand',
    lat: 9.5018, lng: 99.9648,
    map: {
      // Ko Samui island + surrounding islets, stylized
      shapes: [
        // Main island. rounded kite, north-south ~25km
        "M500,180 C560,175 610,200 640,245 C665,285 670,340 650,385 C625,440 575,465 520,458 C465,450 415,420 395,370 C380,325 385,270 415,230 C440,200 470,183 500,180 Z",
        // Ko Phangan (NW, smaller)
        "M320,120 C345,115 365,130 370,155 C372,180 358,200 335,205 C312,208 295,195 293,172 C293,148 305,128 320,120 Z",
        // Ko Tao (NW tiny)
        "M240,60 C252,58 262,66 263,78 C264,90 255,98 243,98 C232,98 225,90 224,79 C224,68 232,62 240,60 Z",
        // Ang Thong islets (W)
        "M300,300 C310,298 318,305 318,315 C318,325 310,330 300,328 C292,326 288,318 290,310 C292,304 296,301 300,300 Z",
        "M280,350 C288,348 294,354 294,362 C294,370 287,374 280,372 C274,370 271,364 272,358 C274,353 277,351 280,350 Z",
        "M340,380 C348,378 354,385 354,392 C354,400 347,404 340,402 C333,400 330,394 331,388 C333,383 336,381 340,380 Z",
      ],
      // Pin is placed at center (Chaweng beach area of Ko Samui)
      pin: { x: 560, y: 330 },
      scale: '~25 KM ACROSS',
    }
  },
  'bangkok': {
    city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018,
    map: {
      shapes: [
        // Chao Phraya river, winding through
        "M200,50 C240,120 210,180 260,240 C310,300 280,360 330,410 C380,460 360,520 420,580",
      ],
      roads: [
        "M0,200 L1000,260", "M0,340 L1000,380", "M400,0 L480,600", "M700,0 L640,600",
      ],
      pin: { x: 340, y: 330 },
      scale: '~15 KM ACROSS',
    }
  },
  'lisbon': {
    city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393,
    map: {
      shapes: [
        // Tagus estuary coastline
        "M0,240 L180,240 C240,245 290,270 340,310 C400,340 480,340 560,320 C640,300 720,290 800,295 L1000,300 L1000,600 L0,600 Z",
      ],
      pin: { x: 260, y: 250 },
      scale: '~10 KM ACROSS',
    }
  },
  'new-york': {
    city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006,
    map: {
      shapes: [
        // Manhattan outline
        "M460,80 C470,75 485,78 490,90 L495,160 L500,260 L510,360 L505,440 C500,480 485,500 470,498 C455,495 448,475 448,450 L445,360 L442,260 L444,160 L448,95 Z",
        // Brooklyn/Queens (simplified)
        "M510,340 L700,360 L720,480 L560,500 L520,460 Z",
        // Jersey
        "M260,120 L420,140 L420,500 L260,500 Z",
      ],
      pin: { x: 475, y: 280 },
      scale: '~20 KM ACROSS',
    }
  },
  'rio': {
    city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729,
    map: {
      shapes: [
        // Guanabara Bay opening and shoreline
        "M0,600 L0,380 C60,340 120,320 200,330 C260,338 300,360 340,340 C380,320 400,280 440,260 C480,240 520,250 560,270 C600,290 630,320 660,310 C700,298 730,270 780,260 L1000,255 L1000,600 Z",
        // Tijuca massif / interior hills suggestion
        "M300,200 C340,160 400,140 460,150 C520,160 560,190 580,220",
        // Niteroi peninsula (east side of bay)
        "M700,260 C730,240 760,230 800,240 C840,250 870,280 860,310 C850,340 820,350 790,340",
      ],
      pin: { x: 420, y: 310 },
      scale: '~18 KM ACROSS',
    }
  },
  'victoria-bc': {
    city: 'Victoria', country: 'Canada', lat: 48.4284, lng: -123.3656,
    map: {
      shapes: [
        // Southern Vancouver Island coast, Victoria Harbour inlet
        "M0,340 C80,320 160,310 240,320 C300,328 340,350 380,340 C400,334 420,310 460,300 C500,290 540,295 580,310 C640,330 700,340 780,330 L1000,320 L1000,600 L0,600 Z",
        // Saanich Inlet (narrow fjord to north)
        "M480,0 C475,60 470,120 468,180 C466,220 470,260 480,300",
        // Oak Bay shoreline notch
        "M620,300 C650,285 680,280 700,295 C720,310 715,335 700,340",
      ],
      pin: { x: 460, y: 330 },
      scale: '~12 KM ACROSS',
    }
  },
  'salt-lake': {
    city: 'Salt Lake City', country: 'USA', lat: 40.7608, lng: -111.891,
    map: {
      shapes: [
        // Great Salt Lake (NW of city, simplified kidney shape)
        "M80,80 C120,60 200,55 280,70 C360,85 400,120 410,160 C420,200 390,230 340,240 C290,250 220,240 170,220 C120,200 70,170 70,140 C70,115 76,93 80,80 Z",
        // Wasatch Front range (east)
        "M760,0 C750,80 740,160 730,240 C720,320 710,400 700,480 C695,520 690,560 688,600",
        // Jordan River (N-S through valley)
        "M440,0 C445,80 450,160 448,240 C446,320 440,400 438,480 C436,540 435,570 434,600",
      ],
      roads: [
        "M0,300 L1000,300", "M500,0 L500,600",
      ],
      pin: { x: 500, y: 310 },
      scale: '~25 KM ACROSS',
    }
  },
  'sydney': {
    city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093,
    map: {
      shapes: [
        // Sydney Harbour — north shore
        "M0,220 C80,215 160,210 240,220 C280,225 310,240 340,230 C370,220 390,200 430,195 C470,190 510,200 540,220 C570,240 580,260 610,255 C650,248 690,230 740,225 L1000,220",
        // Sydney Harbour — south shore / CBD peninsula
        "M0,320 C60,318 120,315 180,320 C220,324 250,335 280,325 C310,315 330,295 360,290 C390,285 420,295 450,310 C480,325 490,345 520,340 C550,335 575,315 600,310 L700,308 L1000,312",
        // Port Jackson heads (harbour entrance)
        "M930,180 C940,200 945,220 940,240",
        "M960,240 C970,255 968,275 958,285",
        // Botany Bay (south)
        "M500,520 C540,510 600,508 650,515 C700,522 730,540 720,560 C710,578 670,585 630,578 C590,571 555,555 530,545 C510,537 500,530 500,520 Z",
      ],
      pin: { x: 490, y: 300 },
      scale: '~20 KM ACROSS',
    }
  },
};

// Itinerary loaded from site/travel.js (edit that file to update the site)
const ITINERARY = window.ALEXG_TRAVEL;

// Module-level geo-data cache — fetched once, shared across mounts
let _geoCache = null;
let _geoPending = [];
function loadGeo(cb) {
  if (_geoCache) { cb(_geoCache); return; }
  _geoPending.push(cb);
  if (_geoPending.length > 1) return; // already in-flight
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      const topo = window.topojson;
      const d3   = window.d3;
      _geoCache = {
        land:      topo.feature(world, world.objects.land),
        borders:   topo.mesh(world, world.objects.countries, (a, b) => a !== b),
        sphere:    { type: 'Sphere' },
      };
      _geoPending.forEach(fn => fn(_geoCache));
      _geoPending = [];
    });
}

function withAlpha(color, alpha) {
  if (!color) return `rgba(26,115,184,${alpha})`;
  const value = color.trim();
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (value.startsWith('rgb(')) return value.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
  return value;
}

function HologramGlobe({ locKey }) {
  const canvasRef = React.useRef(null);
  const geoRef    = React.useRef(null);
  const loc = LOCATIONS[locKey];

  React.useEffect(() => { loadGeo(data => { geoRef.current = data; }); }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let scrollY = window.scrollY;
    let phase = 0;
    let raf;
    let baselineRotLng = null;
    let baselineScrollY = scrollY;
    let stableFrames = 0;
    let waitFrames = 0;
    let lastLayoutSignature = '';
    let fontsReady = !document.fonts || document.fonts.status === 'loaded';
    const currentLocHorizontalBias = 2;

    if (document.fonts && !fontsReady) {
      document.fonts.ready.then(() => { fontsReady = true; });
    }

    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (Math.round(canvas.width) !== Math.round(w * dpr)) {
        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      phase = (phase + 0.04) % (Math.PI * 2);

      const styles = getComputedStyle(canvas);
      const baseHeight = parseFloat(styles.getPropertyValue('--travel2-globe-base-height')) || h;
      const topBleed = Math.abs(parseFloat(styles.top) || 0);
      const drawHeight = baseHeight + (topBleed * 2);
      const globeVerticalLift = 72;
      const isDesktopTravelLayout = w > 1020;
      const globeHorizontalShift = isDesktopTravelLayout ? Math.min(296, Math.max(224, w * 0.216 + 32)) : 16;
      const globeRadiusScale = isDesktopTravelLayout ? 1.056 : 1.2;
      const cx = (w / 2) + globeHorizontalShift;
      const cy = (baseHeight / 2) + topBleed - globeVerticalLift;
      const padding = 28;
      const R  = Math.max(0, Math.min((w / 2) - padding, (drawHeight / 2) - padding) * globeRadiusScale);

      if (baselineRotLng == null) {
        const rect = canvas.getBoundingClientRect();
        const viewport = window.visualViewport;
        const viewportHeight = viewport ? viewport.height : window.innerHeight;
        const viewportWidth = viewport ? viewport.width : window.innerWidth;
        const viewportOffsetTop = viewport ? viewport.offsetTop : 0;
        const layoutSignature = [
          Math.round(rect.top * 10),
          Math.round(w),
          Math.round(h),
          Math.round(viewportWidth),
          Math.round(viewportHeight),
          Math.round(viewportOffsetTop * 10),
          fontsReady ? 1 : 0,
        ].join('|');

        if (!fontsReady || !w || !h) {
          lastLayoutSignature = layoutSignature;
          stableFrames = 0;
          raf = requestAnimationFrame(draw);
          return;
        }

        if (layoutSignature === lastLayoutSignature) stableFrames += 1;
        else {
          lastLayoutSignature = layoutSignature;
          stableFrames = 0;
        }

        waitFrames += 1;
        if (stableFrames < 10 && waitFrames < 180) {
          raf = requestAnimationFrame(draw);
          return;
        }
        const sectionTop = rect.top + scrollY;
        const sectionCenterY  = sectionTop + h / 2;
        const viewportCenterY = scrollY + viewportOffsetTop + (viewportHeight / 2);
        const offset  = viewportCenterY - sectionCenterY;
        baselineScrollY = scrollY;
        baselineRotLng = -loc.lng - currentLocHorizontalBias + offset * 0.12;
      }

      const rotLng  = baselineRotLng + ((scrollY - baselineScrollY) * 0.12);
      const rotLat  = -loc.lat * 0.08;

      const d3  = window.d3;
      const geo = geoRef.current;
      const rootStyles = getComputedStyle(document.documentElement);
      const liveBlue = rootStyles.getPropertyValue('--blue').trim() || '#6EC1FF';
      const labelBg = rootStyles.getPropertyValue('--surface').trim()
        || rootStyles.getPropertyValue('--bg').trim()
        || '#0c0c0d';

      const projection = d3.geoOrthographic()
        .scale(R)
        .translate([cx, cy])
        .rotate([rotLng, rotLat, 0])
        .clipAngle(90);

      const path = d3.geoPath().projection(projection).context(ctx);
      const sphere = geo ? geo.sphere : { type: 'Sphere' };

      if (geo) {
        ctx.shadowBlur = 0;
        ctx.beginPath(); path(geo.land);
        ctx.shadowColor = liveBlue;
        ctx.shadowBlur = 11;
        ctx.strokeStyle = withAlpha(liveBlue, 0.96);
        ctx.lineWidth = 1.15;
        ctx.stroke();

        ctx.shadowColor = liveBlue;
        ctx.shadowBlur = 3;
        ctx.beginPath(); path(geo.borders);
        ctx.strokeStyle = withAlpha(liveBlue, 0.82);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Sphere rim
      ctx.shadowColor = liveBlue;
      ctx.shadowBlur = 7;
      ctx.beginPath(); path(sphere);
      ctx.strokeStyle = withAlpha(liveBlue, 0.88);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Current-location ping on the front hemisphere.
      const pinDist = d3.geoDistance([loc.lng, loc.lat], [-rotLng, -rotLat]);
      if (pinDist < Math.PI / 2) {
        const [px, py] = projection([loc.lng, loc.lat]);
        const t = (Math.sin(phase) + 1) / 2;
        ctx.save();
        ctx.font = '500 12px Calibri, "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        const label = loc.city;
        const labelY = py - 24;
        const labelPadX = 7;
        const labelHeight = 20;
        const labelWidth = Math.ceil(ctx.measureText(label).width + labelPadX * 2);
        const labelX = Math.round(px - (labelWidth / 2));
        const labelTop = Math.round(labelY - (labelHeight / 2));
        ctx.fillStyle = labelBg;
        ctx.fillRect(labelX, labelTop, labelWidth, labelHeight);
        ctx.strokeStyle = withAlpha(liveBlue, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(labelX + 0.5, labelTop + 0.5, labelWidth - 1, labelHeight - 1);
        ctx.fillStyle = withAlpha(liveBlue, 0.96);
        ctx.fillText(label, px, labelY);

        ctx.strokeStyle = withAlpha(liveBlue, 0.9 - (t * 0.45));
        ctx.lineWidth = 1.4;
        ctx.shadowColor = liveBlue;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 8 + (t * 11), 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 8;
        ctx.fillStyle = withAlpha(liveBlue, 0.95);
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [locKey]);

  return <canvas ref={canvasRef} className="travel2-globe-canvas" style={{ display: 'block' }} />;
}


function TravelLog() {
  const currentKey = ITINERARY.find(i => i.status === 'here').key;
  const scrollRef = React.useRef(null);
  const hereRef = React.useRef(null);

  React.useEffect(() => {
    if (!scrollRef.current || !hereRef.current) return;
    const container = scrollRef.current;
    const row = hereRef.current;
    const offset = row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
    container.scrollTop = offset;
  }, []);

  return (
    <div className="travel2">
      <div className="travel2-globe-panel">
        <div className="travel2-map">
          <HologramGlobe locKey={currentKey} />
        </div>
      </div>
      <div className="travel2-list">
        <div className="travel2-scroll-cue" aria-hidden="true">
          <span className="travel2-scroll-cue-icon">
            <span />
            <span />
          </span>
        </div>
        <div className="travel2-scroll" ref={scrollRef}>
          {ITINERARY.map((row, i) => {
            const loc = LOCATIONS[row.key];
            return (
              <div key={i} ref={row.status === 'here' ? hereRef : null} className={"travel2-row travel2-" + row.status}>
                <span className="travel2-when">{row.when}</span>
                <span className="travel2-where">{loc.city}<span className="travel2-country">, {loc.country}</span></span>
                {row.status === 'here' && <span className="travel2-status">here</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroReel() {
  // Autoplay b-roll. cycles through cinematic stills as a placeholder for real video
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 8), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hero-bg">
      <div className="hero-bg-inner">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className={"hero-bg-frame " + (frame === i ? 'on' : '')}>
            <PortfolioStill seed={i} />
          </div>
        ))}
      </div>
      <div className="hero-bg-grain" />
      <div className="hero-bg-vignette" />
      <div className="hero-bg-dim" />
    </div>
  );
}

function useHeroScroll() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const y = Math.max(0, window.scrollY);
      const blurT = Math.min(1, y / 800);
      const motionT = Math.min(1, y / 500);
      ref.current.style.setProperty('--hero-scroll-blur', `${blurT * 14}px`);
      ref.current.style.setProperty('--hero-scroll-opacity', `${1 - motionT * 0.85}`);
      ref.current.style.setProperty('--hero-scroll-lift', `${-motionT * 40}px`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return ref;
}

function HeroTitle() {
  const ref = useHeroScroll();
  return (
    <div ref={ref} className="hero-title-block hero-title-enter">
      <h1 className="hero-h1 hero-h1-italic">Alex Garrett</h1>
      <p className="hero-role hero-role-lg">Filmmaker and tool-maker.</p>
    </div>
  );
}

const OMI_CASE_STUDY = {
  client: 'OMI',
  impactValue: '5.5',
  impactUnit: 'M VIEWS',
  label: 'OMI LAUNCH FILM · X + INSTAGRAM · 2026',
  teaserLabel: 'OMI LAUNCH FILM · FULL STACK VIDEO PRODUCTION · 2026',
  teaserTitle: 'Shipped a 5.5M-view launch film.',
  teaserSummary: 'Concept, production, edit, and product UI moments were built around one launch metric: reach.',
  videoSrc: 'videos/portfolio/web/omi-launch-film.mp4',
  heroTitle: "Directed OMI's launch film end-to-end and drove 5.5M views in four days.",
  summary: 'OMI needed a launch asset built for reach. I owned the concept, script, direction, production, edit, and the product UI moments that made the assistant feel alive onscreen.',
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

function Home({ go }) {
  const actionsRef = useHeroScroll();
  const featuredLut = (window.LUTS || []).find(l => l.id === 'cinematic-01') || {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Sculpted for daylight, this look carves deep, luminous contrast across skin and landscape alike, kissing greens with a rich amber glow and surrendering to darkness with cinematic grace.',
    price: 9,
    badge: 'BESTSELLER',
    compare: {
      title: 'Meridian',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Meridian ungraded preview',
      afterTitle: 'Meridian graded preview',
      beforeSrc: 'videos/Solène Ungraded.mp4',
      afterSrc: 'videos/Solène Graded.mp4',
    },
  };

  return (
    <>
      <section className="hero hero-immersive">
        <HeroReel />
        <div className="wrap hero-content hero-content-left">
          <HeroTitle />
        </div>
        <div ref={actionsRef} className="hero-actions hero-title-block hero-title-enter" style={{ animationDelay: '300ms' }}>
          <button className="btn btn-ghost-light btn-lg" onClick={() => go('plugins')}>
            Shop Plugins
          </button>
          <button className="btn btn-ghost-light btn-lg" onClick={() => go('luts')}>
            Shop LUTs
          </button>
        </div>
      </section>

      {/* Travel log */}
      <section className="section-xs">
        <div className="wrap">
          <TravelLog />
        </div>
      </section>

      {/* About strip */}
      <section className="section-sm about-strip">
        <div className="wrap">
          <div className="about-row">
            <p className="section-title">WHAT I DO</p>
            <div className="about-grid">
              <div>
                <h3 className="about-h">Client work.</h3>
                <p className="about-p">Brand films, motion graphics, and full-stack video production for startups and creators.</p>
              </div>
              <div>
                <h3 className="about-h">Digital products.</h3>
                <p className="about-p">Plugins and LUTs. Every tool comes out of a real edit session.</p>
              </div>
              <div>
                <h3 className="about-h">Systems.</h3>
                <p className="about-p">Repeatable workflows. Templates. Fewer clicks. More finished work.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plugin */}
      <section className="section-sm">
        <div className="wrap">
          <p className="section-title">FEATURED · PLUGIN</p>
          <div className="card card-featured">
            <div className="card-media">
              <PremiereScreenshot variant="ai-media-browser" />
            </div>
            <div className="card-body">
              <div className="card-eyebrow">
                <span>v1.0.0 · PREMIERE 2024+</span>
                <span style={{ color: 'var(--blue-ink)' }}>● RELEASED</span>
              </div>
              <h3 className="card-title">AI Media Browser</h3>
              <p className="card-desc">Analyze Premiere bin footage with AI, then search clips by meaning instead of filenames.</p>
              <div className="card-foot">
                <div className="card-price">$19<span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>one-time</span></div>
                <button className="btn btn-primary" onClick={() => go('plugin:flowstate')}>View <ArrowIcon /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured LUT */}
      <section className="section-sm">
        <div className="wrap">
          <p className="section-title">FEATURED · LUT</p>
          <div className="card card-featured" onClick={() => go('lut:' + featuredLut.id)} style={{ cursor: 'pointer' }}>
            <div className="card-media"><LutPreview tone="teal-orange" interactive compare={featuredLut.compare} scrollLinked /></div>
            <div className="card-body">
              <div className="card-eyebrow">
                <span>INDIVIDUAL LUT · .CUBE</span>
                <span style={{ color: 'var(--orange-ink)' }}>★ {featuredLut.badge || 'BESTSELLER'}</span>
              </div>
              <h3 className="card-title">{featuredLut.name}</h3>
              <p className="card-desc">{featuredLut.oneline}</p>
              <div className="card-foot">
                <div className="card-price">${featuredLut.price}<span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>one-time</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="section-sm proof-section">
        <div className="wrap">
          <p className="section-title">PROOF · CASE STUDY</p>
          <div className="proof">
            <div className="proof-grid">
              <div className="proof-stat">
                <h2 className="proof-num">{OMI_CASE_STUDY.impactValue}<span className="unit">{OMI_CASE_STUDY.impactUnit}</span></h2>
                <p className="proof-label">{OMI_CASE_STUDY.teaserLabel}</p>
              </div>
              <div className="proof-body">
                <div className="proof-copy">
                  <h3>{OMI_CASE_STUDY.teaserTitle}</h3>
                  {OMI_CASE_STUDY.teaserSummary && <p className="proof-summary">{OMI_CASE_STUDY.teaserSummary}</p>}
                </div>
                <div className="proof-video">
                  <video
                    src={OMI_CASE_STUDY.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="OMI launch film"
                    title="OMI launch film"
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                  />
                </div>
                <div className="proof-actions">
                  <button className="btn btn-primary btn-sm proof-cta" onClick={() => go('services', { target: 'service-case-studies' })}>See the case study <ArrowIcon /></button>
                  <p className="proof-cta-note">Full breakdown: brief, execution, outcome.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}

Object.assign(window, { Home, OMI_CASE_STUDY });
