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

function HologramGlobe({ locKey }) {
  const canvasRef = React.useRef(null);
  const loc = LOCATIONS[locKey];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let scrollY = window.scrollY;
    let phase = 0;
    let raf;
    let sectionTop = canvas.getBoundingClientRect().top + scrollY;

    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const D2R = Math.PI / 180;

    const proj = (latD, lngD, rotY, rotX, cx, cy, R) => {
      const phi = latD * D2R, th = lngD * D2R + rotY;
      const x  =  Math.cos(phi) * Math.sin(th);
      const y  =  Math.sin(phi);
      const z  =  Math.cos(phi) * Math.cos(th);
      const y2 =  y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 =  y * Math.sin(rotX) + z * Math.cos(rotX);
      return { sx: cx + x * R, sy: cy - y2 * R, z: z2 };
    };

    const strokeSegs = (pts, frontStyle, frontW, backStyle, backW) => {
      if (backStyle) {
        ctx.beginPath();
        let m = true;
        for (const p of pts) { m ? (ctx.moveTo(p.sx, p.sy), m = false) : ctx.lineTo(p.sx, p.sy); }
        ctx.strokeStyle = backStyle; ctx.lineWidth = backW; ctx.stroke();
      }
      ctx.beginPath();
      let d = false;
      for (const p of pts) {
        if (p.z > 0) { d ? ctx.lineTo(p.sx, p.sy) : (ctx.moveTo(p.sx, p.sy), d = true); }
        else { d = false; }
      }
      ctx.strokeStyle = frontStyle; ctx.lineWidth = frontW; ctx.stroke();
    };

    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (Math.round(canvas.width) !== Math.round(w * dpr)) {
        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        sectionTop = canvas.getBoundingClientRect().top + scrollY;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = w / 2, cy = h / 2;
      const Rg = Math.min(w, h) * 0.39;
      // rotY = 0 when section center aligns with viewport center → pin faces viewer
      const sectionCenterY = sectionTop + h / 2;
      const viewportCenterY = scrollY + window.innerHeight / 2;
      const offset = viewportCenterY - sectionCenterY;
      const rotY = -loc.lng * D2R + offset * 0.002;
      const rotX = loc.lat * D2R * 0.08;
      phase = (phase + 0.045) % (Math.PI * 2);

      // Background
      ctx.fillStyle = '#030e18';
      ctx.fillRect(0, 0, w, h);
      const bgG = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rg * 1.4);
      bgG.addColorStop(0, 'rgba(0,55,100,0.32)'); bgG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgG; ctx.fillRect(0, 0, w, h);

      const NLAT = 10, NLNG = 18, NSEG = 90;
      ctx.shadowColor = '#00ccff';

      // Latitude parallels
      for (let i = 0; i <= NLAT; i++) {
        const lat = -90 + 180 * i / NLAT;
        const eq  = i === NLAT / 2;
        const pts = Array.from({ length: NSEG + 1 }, (_, j) =>
          proj(lat, -180 + 360 * j / NSEG, rotY, rotX, cx, cy, Rg));
        ctx.shadowBlur = eq ? 9 : 3;
        strokeSegs(pts,
          eq ? 'rgba(0,210,255,0.45)' : 'rgba(0,195,255,0.14)', eq ? 0.9 : 0.48,
          'rgba(0,180,255,0.04)', eq ? 0.5 : 0.25);
      }

      // Longitude meridians
      ctx.shadowBlur = 2;
      for (let i = 0; i < NLNG; i++) {
        const lng = -180 + 360 * i / NLNG;
        const pts = Array.from({ length: NSEG / 2 + 1 }, (_, j) =>
          proj(-90 + 180 * j / (NSEG / 2), lng, rotY, rotX, cx, cy, Rg));
        strokeSegs(pts, 'rgba(0,190,255,0.09)', 0.4, 'rgba(0,180,255,0.02)', 0.25);
      }

      // Coastlines + geographic features
      if (window.WORLD_LINES) {
        ctx.shadowColor = '#00e0ff'; ctx.shadowBlur = 6;
        ctx.lineWidth = 0.9;
        for (const line of window.WORLD_LINES) {
          // Faint back hemisphere trace
          ctx.beginPath();
          let m = true;
          for (const [lng, lat] of line) {
            const p = proj(lat, lng, rotY, rotX, cx, cy, Rg);
            m ? (ctx.moveTo(p.sx, p.sy), m = false) : ctx.lineTo(p.sx, p.sy);
          }
          ctx.strokeStyle = 'rgba(0,220,255,0.04)'; ctx.lineWidth = 0.5; ctx.stroke();
          // Front hemisphere bright
          ctx.beginPath();
          let d = false;
          for (const [lng, lat] of line) {
            const p = proj(lat, lng, rotY, rotX, cx, cy, Rg);
            if (p.z > 0) { d ? ctx.lineTo(p.sx, p.sy) : (ctx.moveTo(p.sx, p.sy), d = true); }
            else { d = false; }
          }
          ctx.strokeStyle = 'rgba(0,220,255,0.62)'; ctx.lineWidth = 0.85; ctx.stroke();
        }
      }

      // Rim glow
      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 26;
      ctx.strokeStyle = 'rgba(0,200,255,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, Rg, 0, Math.PI * 2); ctx.stroke();

      // Atmospheric halo
      ctx.shadowBlur = 0;
      const ha = ctx.createRadialGradient(cx, cy, Rg * 0.84, cx, cy, Rg * 1.13);
      ha.addColorStop(0,   'rgba(0,180,255,0)');
      ha.addColorStop(0.5, 'rgba(0,180,255,0.04)');
      ha.addColorStop(1,   'rgba(0,180,255,0.20)');
      ctx.beginPath(); ctx.arc(cx, cy, Rg * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = ha; ctx.fill();

      // Pin
      const pin = proj(loc.lat, loc.lng, rotY, rotX, cx, cy, Rg);
      if (pin.z > 0.1) {
        const { sx: px, sy: py } = pin;
        const pt = (Math.sin(phase) + 1) / 2;
        ctx.save();
        ctx.shadowColor = '#00e5ff';

        // Expanding pulse rings
        [[14, 0.55], [22, 0.35], [30, 0.20]].forEach(([maxR, baseA]) => {
          const rr = 3 + (maxR - 3) * pt;
          const a  = baseA * (1 - pt);
          ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,229,255,${a.toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke();
        });

        // Crosshair
        const arm = 20, gap = 8;
        ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(0,229,255,0.92)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - arm, py); ctx.lineTo(px - gap, py);
        ctx.moveTo(px + gap,  py); ctx.lineTo(px + arm, py);
        ctx.moveTo(px, py - arm); ctx.lineTo(px, py - gap);
        ctx.moveTo(px, py + gap); ctx.lineTo(px, py + arm);
        ctx.stroke();

        // Center dot
        ctx.shadowBlur = 24;
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff'; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; ctx.fill();

        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [locKey]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

function TravelLog() {
  const currentKey = ITINERARY.find(i => i.status === 'here').key;
  const current = LOCATIONS[currentKey];
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
      <div className="travel2-map" style={{ background: '#030e18' }}>
        <HologramGlobe locKey={currentKey} />
        <div className="travel2-map-overlay" style={{ background: 'rgba(2,14,24,0.78)', borderColor: 'rgba(0,200,255,0.18)' }}>
          <div className="travel2-eyebrow" style={{ color: '#00c8ff' }}>
            <span className="travel2-dot" style={{ background: '#00c8ff', boxShadow: '0 0 0 3px rgba(0,200,255,0.2)' }} />
            <span>CURRENTLY · LIVE</span>
          </div>
          <div className="travel2-city" style={{ color: '#fff' }}>{current.city}</div>
          <div className="travel2-coords" style={{ color: 'rgba(0,200,255,0.65)' }}>
            {current.lat.toFixed(4)}°N &nbsp;·&nbsp; {current.lng.toFixed(4)}°E
          </div>
        </div>
      </div>
      <div className="travel2-list">
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
      const t = Math.min(1, y / 500);
      ref.current.style.setProperty('--hero-scroll-blur', `${t * 14}px`);
      ref.current.style.setProperty('--hero-scroll-opacity', `${1 - t * 0.85}`);
      ref.current.style.setProperty('--hero-scroll-lift', `${-t * 40}px`);
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

function Home({ go }) {
  const actionsRef = useHeroScroll();
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
          <div className="travel2-head">
            <p className="section-title">TRAVEL LOG</p>
            <p className="travel2-sub">Where I am, where I've been, where I'm going.</p>
          </div>
          <TravelLog />
        </div>
      </section>

      {/* About strip */}
      <section className="section-sm">
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
                <p className="about-p">Premiere plugins and LUTs. Every tool comes out of a real edit session.</p>
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
              <PremiereScreenshot variant="youtube-dl" />
            </div>
            <div className="card-body">
              <div className="card-eyebrow">
                <span>v1.2.0 · PREMIERE 2024+</span>
                <span style={{ color: 'var(--blue-ink)' }}>● NEW</span>
              </div>
              <h3 className="card-title">YouTube Downloader for Premiere</h3>
              <p className="card-desc">Pull reference clips into your timeline without leaving Premiere. Paste a URL, pick a resolution, cut.</p>
              <div className="card-foot">
                <div className="card-price">$9<span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>one-time</span></div>
                <button className="btn btn-primary" onClick={() => go('plugin:youtube-downloader')}>View <ArrowIcon /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured LUT */}
      <section className="section-sm">
        <div className="wrap">
          <p className="section-title">FEATURED · LUT</p>
          <div className="card" onClick={() => go('lut:cinematic-01')} style={{ cursor: 'pointer' }}>
            <div className="card-media"><LutPreview tone="teal-orange" /></div>
            <div className="card-body">
              <div className="card-eyebrow">
                <span>10 LOOKS · .CUBE + .LOOK</span>
                <span style={{ color: 'var(--orange-ink)' }}>★ BESTSELLER</span>
              </div>
              <h3 className="card-title">Cinematic Pack Vol. 01</h3>
              <p className="card-desc">Ten hand-calibrated looks. Teal/orange, moody blue, warm film. Tested on S-Log3, V-Log, LOG-C, Rec.709.</p>
              <div className="card-foot">
                <div className="card-price">$24<span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>one-time</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="section">
        <div className="wrap">
          <p className="section-title">PROOF · CASE STUDY</p>
          <div className="proof">
            <div className="proof-grid">
              <div>
                <h2 className="proof-num">3.8<span className="unit">M VIEWS</span></h2>
                <p className="proof-label">OMI LAUNCH VIDEO · END-TO-END · 2025</p>
              </div>
              <div className="proof-body">
                <h3>Shipped a 3.8M-view launch video. Strategy, production, and post.</h3>
                <p>I use the same tools I sell. Every plugin here came out of real editing sessions, on real deadlines, cutting real footage.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => go('portfolio')}>See the case study <ArrowIcon /></button>
                <div className="proof-meta">
                  <span><strong>Client</strong>OMI</span>
                  <span><strong>Role</strong>Strategy + Edit</span>
                  <span><strong>Platform</strong>TikTok</span>
                  <span><strong>Duration</strong>3 weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}

Object.assign(window, { Home });
