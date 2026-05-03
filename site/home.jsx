import React from 'react';

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
let _geoPromise = null;
let _geoDepsPromise = null;
const GEO_SCRIPT_URLS = [
  'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
  'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js',
];
const _scriptPromises = {};

function loadScriptOnce(src) {
  if (src.includes('/d3@') && window.d3) return Promise.resolve();
  if (src.includes('/topojson-client@') && window.topojson) return Promise.resolve();

  if (!_scriptPromises[src]) {
    _scriptPromises[src] = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      const script = existing || document.createElement('script');

      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => {
        delete _scriptPromises[src];
        reject(new Error(`Failed to load ${src}`));
      };

      if (existing?.dataset.loaded === 'true') resolve();
      else if (!existing) document.head.appendChild(script);
    });
  }

  return _scriptPromises[src];
}

function loadGeoDeps() {
  if (window.d3 && window.topojson) return Promise.resolve();
  if (!_geoDepsPromise) {
    _geoDepsPromise = Promise.all(GEO_SCRIPT_URLS.map(loadScriptOnce))
      .catch(err => {
        _geoDepsPromise = null;
        throw err;
      });
  }
  return _geoDepsPromise;
}

function loadGeo() {
  if (_geoCache) return Promise.resolve(_geoCache);
  if (!_geoPromise) {
    _geoPromise = loadGeoDeps()
      .then(() => fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'))
      .then(r => r.json())
      .then(world => {
        const topo = window.topojson;
        const d3   = window.d3;
        _geoCache = {
          land:      topo.feature(world, world.objects.land),
          borders:   topo.mesh(world, world.objects.countries, (a, b) => a !== b),
          sphere:    { type: 'Sphere' },
        };
        return _geoCache;
      })
      .catch(err => {
        _geoPromise = null;
        throw err;
      });
  }

  return _geoPromise;
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
  const geoRef    = React.useRef(_geoCache);
  const [depsReady, setDepsReady] = React.useState(Boolean(window.d3 && window.topojson));
  const [geoReady, setGeoReady] = React.useState(Boolean(_geoCache));
  const loc = LOCATIONS[locKey];

  React.useEffect(() => {
    let alive = true;

    loadGeoDeps()
      .then(() => {
        if (alive) setDepsReady(true);
        return loadGeo();
      })
      .then(data => {
        if (!alive) return;
        geoRef.current = data;
        setGeoReady(true);
      })
      .catch(err => console.error('Failed to load map data:', err));

    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    if (!depsReady || !window.d3) return undefined;
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
      const isDesktopTravelLayout = w > 1020;
      const drawHeight = baseHeight + (topBleed * 2);
      const globeVerticalLift = isDesktopTravelLayout ? 4 : 72;
      const globeHorizontalShift = isDesktopTravelLayout ? Math.min(296, Math.max(224, w * 0.216 + 32)) * -1 : 16;
      const globeRadiusScale = isDesktopTravelLayout ? 1.056 : 1.2;
      const cy = (baseHeight / 2) + topBleed - globeVerticalLift;
      const padding = 28;
      const R  = Math.max(0, Math.min((w / 2) - padding, (drawHeight / 2) - padding) * globeRadiusScale);
      const cx = isDesktopTravelLayout ? R : (w / 2) + globeHorizontalShift;

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
  }, [locKey, depsReady, geoReady]);

  return <canvas ref={canvasRef} className="travel2-globe-canvas" style={{ display: 'block' }} />;
}


function TravelLog() {
  const currentKey = ITINERARY.find(i => i.status === 'here').key;
  const currentLoc = LOCATIONS[currentKey];
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
        <div className="travel2-mobile-title">
          <span>WHERE I AM</span>
          <strong>{currentLoc.city}<em>, {currentLoc.country}</em></strong>
        </div>
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

function TravelSection({ deferred = false }) {
  const className = "section-xs " + (deferred ? "travel-mobile-deferred" : "home-travel-overlap");

  return (
    <section className={className} data-home-scroll-blur>
      <div className="wrap">
        <TravelLog />
      </div>
    </section>
  );
}

function useMobileViewport(query = '(max-width: 720px)') {
  const [matches, setMatches] = React.useState(() => (
    typeof window !== 'undefined' && window.matchMedia(query).matches
  ));

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

const HOME_SCROLL_BLUR_MAX = 14;
const HOME_SCROLL_BLUR_SELECTOR = '[data-home-scroll-blur]';
const HOME_SCROLL_BLUR_START_VIEWPORT_RATIO = 0.4;

function useHomeScrollBlur(refreshKey) {
  React.useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    const getElements = () => Array.from(document.querySelectorAll(HOME_SCROLL_BLUR_SELECTOR));
    const setBlur = (element, value) => {
      element.style.setProperty('--home-scroll-blur', `${value.toFixed(2)}px`);
    };
    const update = () => {
      raf = 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const blurStartLine = viewportHeight * HOME_SCROLL_BLUR_START_VIEWPORT_RATIO;
      const reduceMotion = motionQuery.matches;

      getElements().forEach((element) => {
        if (reduceMotion) {
          setBlur(element, 0);
          return;
        }

        const rect = element.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (blurStartLine - rect.bottom) / blurStartLine));
        const eased = progress * progress * (3 - (2 * progress));
        setBlur(element, eased * HOME_SCROLL_BLUR_MAX);
      });
    };
    const requestUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', requestUpdate);
    else motionQuery.addListener(requestUpdate);

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(requestUpdate) : null;
    if (resizeObserver) getElements().forEach((element) => resizeObserver.observe(element));

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', requestUpdate);
      else motionQuery.removeListener(requestUpdate);
      if (resizeObserver) resizeObserver.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      getElements().forEach((element) => element.style.removeProperty('--home-scroll-blur'));
    };
  }, [refreshKey]);
}

function HeroReel() {
  return (
    <div className="hero-bg" data-home-scroll-blur>
      <video
        className="hero-bg-video"
        src="videos/website%20landing%20page.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />
      <div className="hero-bg-grain" />
      <div className="hero-bg-vignette" />
      <div className="hero-bg-dim" />
    </div>
  );
}

function HeroTitle() {
  return (
    <div className="hero-title-block hero-title-enter" data-home-scroll-blur>
      <h1 className="hero-h1 hero-h1-italic">Alex Garrett</h1>
      <p className="hero-role hero-role-lg">Filmmaker and tool-maker.</p>
    </div>
  );
}

function HeroProductShortcut({ kind, name, type, href, onActivate, iconSrc }) {
  const label = `${name} ${type}`;
  return (
    <a
      className={`hero-product-shortcut hero-product-shortcut-${kind}`}
      href={href}
      aria-label={`View ${label}`}
      onClick={(e) => {
        e.preventDefault();
        onActivate();
      }}
    >
      <span className={`hero-product-glyph hero-product-glyph-${kind}${iconSrc ? ' hero-product-glyph-image' : ''}`} aria-hidden="true">
        {iconSrc ? (
          <img className="hero-product-icon-img" src={iconSrc} alt="" />
        ) : kind === 'lut' ? (
          <>
            <span className="hero-lut-band hero-lut-band-a" />
            <span className="hero-lut-band hero-lut-band-b" />
            <span className="hero-lut-band hero-lut-band-c" />
          </>
        ) : (
          <>
            <span className="hero-plugin-panel hero-plugin-panel-a" />
            <span className="hero-plugin-panel hero-plugin-panel-b" />
            <span className="hero-plugin-dot" />
          </>
        )}
      </span>
      <span className="hero-product-copy">
        <span className="hero-product-name">{name}</span>
        <span className="hero-product-type">{type}</span>
      </span>
      <span className="hero-product-arrow" aria-hidden="true"><ArrowIcon size={13} /></span>
    </a>
  );
}

const OMI_CASE_STUDY = {
  client: 'OMI',
  impactValue: '5.5',
  impactUnit: 'M VIEWS',
  label: 'OMI LAUNCH FILM · X + INSTAGRAM · 2026',
  teaserLabelParts: ['OMI LAUNCH FILM', 'FULL STACK VIDEO PRODUCTION', '2026'],
  teaserTitle: 'Shipped a 5.5M-view launch film.',
  teaserSummary: 'Concept, production, edit, and UI moments tied to one metric: reach.',
  videoSrc: 'videos/portfolio/web/omi-launch-film.mp4',
  heroTitle: "Directed OMI's launch film and drove 5.5M views in four days.",
  summary: 'OMI needed a launch film built for reach. I handled concept, script, production, edit, and onscreen product moments.',
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
      body: 'I cut the spot, shaped the voice and UI moments, and the launch reached 5.5M views across X and Instagram in four days.',
    },
  ],
};

const FEATURED_HOME_LUT_IDS = ['cinematic-01', 'onyx'];

function Home({ go }) {
  const deferTravel = useMobileViewport();
  useHomeScrollBlur(deferTravel);
  const hrefFor = window.routeHref || ((id) => '#');
  const fallbackMeridian = {
    id: 'cinematic-01',
    name: 'Meridian',
    oneline: 'Warm, polished color for footage shot in natural light.',
    price: 18,
    formats: '.CUBE',
    badge: 'BESTSELLER',
    tone: 'teal-orange',
    mockupSrc: 'mockups/meridian mockup.png',
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
  };
  const fallbackOnyx = {
    id: 'onyx',
    name: 'Onyx',
    oneline: 'Crafted for the night, where deep shadows meet luminous skin and city light.',
    price: 18,
    formats: '.CUBE',
    badge: 'NEW',
    tone: 'onyx-night',
    mockupSrc: 'mockups/onyx mockup.png',
    compare: {
      title: 'Onyx',
      beforeLabel: 'Ungraded',
      afterLabel: 'Graded',
      beforeTitle: 'Onyx ungraded preview',
      afterTitle: 'Onyx graded preview',
      beforeSrc: 'videos/lut showcase/onyx 1 ungraded.mp4',
      afterSrc: 'videos/lut showcase/onyx 1 graded.mp4',
    },
  };
  const luts = window.LUTS || [];
  const fallbackLutsById = {
    'cinematic-01': fallbackMeridian,
    onyx: fallbackOnyx,
  };
  const featuredLuts = FEATURED_HOME_LUT_IDS
    .map(id => luts.find(l => l.id === id) || fallbackLutsById[id])
    .filter(Boolean);
  return (
    <>
      <section className="hero hero-immersive">
        <HeroReel />
        <div className="wrap hero-content hero-content-left">
          <HeroTitle />
        </div>
        <div className="hero-actions hero-product-actions hero-title-block hero-title-enter" style={{ animationDelay: '300ms' }} data-home-scroll-blur>
          {featuredLuts.map(lut => (
            <HeroProductShortcut
              key={lut.id}
              kind="lut"
              name={lut.name}
              type="LUT"
              href={hrefFor('lut:' + lut.id)}
              onActivate={() => go('lut:' + lut.id)}
              iconSrc={lut.mockupSrc}
            />
          ))}
          <div className="hero-mobile-proof">Instant downloads · service replies within 24h</div>
        </div>
      </section>

      {/* Travel log */}
      {!deferTravel && <TravelSection />}

      {/* Featured Products */}
      <section id="featured-products" className="section-sm featured-products">
        <div className="wrap featured-products-stack">
          {featuredLuts.map(lut => (
            <div key={lut.id} data-home-scroll-blur>
              <p className="section-title">FEATURED · LUT</p>
              <div className="card card-featured" onClick={() => go('lut:' + lut.id)} style={{ cursor: 'pointer' }}>
                <div className="card-media"><LutPreview tone={lut.tone || 'teal-orange'} interactive compare={lut.compare} scrollLinked /></div>
                <div className="card-body">
                  <div className="card-eyebrow">
                    <span>INDIVIDUAL LUT · {lut.formats || '.CUBE'}</span>
                    <span style={{ color: 'var(--orange-ink)' }}>★ {lut.badge || 'BESTSELLER'}</span>
                  </div>
                  <h3 className="card-title">{lut.name}</h3>
                  <p className="card-desc">{lut.oneline}</p>
                  <div className="card-foot">
                    <div className="card-price">${lut.price}<span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>one-time</span></div>
                    <a className="btn btn-primary" href={hrefFor('lut:' + lut.id)} onClick={(e) => { e.preventDefault(); e.stopPropagation(); go('lut:' + lut.id); }}>View <ArrowIcon /></a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About strip */}
      <section className="section-sm about-strip">
        <div className="wrap">
          <div className="about-row" data-home-scroll-blur>
            <p className="section-title">WHAT I DO</p>
            <div className="about-grid">
              <div>
                <h3 className="about-h">Client work.</h3>
                <p className="about-p">Brand films, motion graphics, and production for startups and creators.</p>
              </div>
              <div>
                <h3 className="about-h">Digital products.</h3>
                <p className="about-p">Plugins and LUTs. Every tool comes out of a real edit session.</p>
              </div>
              <div>
                <h3 className="about-h">Systems.</h3>
                <p className="about-p">Workflows, templates, fewer clicks, more finished work.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="section-sm proof-section">
        <div className="wrap" data-home-scroll-blur>
          <p className="section-title">PROOF · CASE STUDY</p>
          <div className="proof">
            <div className="proof-grid">
              <div className="proof-stat">
                <h2 className="proof-num">{OMI_CASE_STUDY.impactValue}<span className="unit">{OMI_CASE_STUDY.impactUnit}</span></h2>
                <p className="proof-label">
                  {OMI_CASE_STUDY.teaserLabelParts.map(part => (
                    <span key={part}>{part}</span>
                  ))}
                </p>
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

      {deferTravel && <TravelSection deferred />}

    </>
  );
}

Object.assign(window, { Home, OMI_CASE_STUDY });
