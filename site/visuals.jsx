import React from 'react';

// Visual components. faked plausible screenshots/stills

// Premiere-like panel chrome with a plugin visible in it
function PremiereScreenshot({ variant = "ai-media-browser", scale = 1 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #1f1f20 0%, #161617 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, Segoe UI, sans-serif',
      fontSize: 10 * scale, color: '#c8c8c8',
    }}>
      {/* title bar */}
      <div style={{
        height: 22 * scale, background: '#2a2a2b',
        borderBottom: '1px solid #0a0a0a',
        display: 'flex', alignItems: 'center', padding: `0 ${10 * scale}px`,
        gap: 6 * scale, fontSize: 9 * scale,
      }}>
        <div style={{ width: 8 * scale, height: 8 * scale, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 8 * scale, height: 8 * scale, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 8 * scale, height: 8 * scale, borderRadius: '50%', background: '#28c840' }} />
        <div style={{ marginLeft: 14 * scale, color: '#888', fontSize: 9 * scale }}>
          Adobe Premiere Pro. Sequence 01
        </div>
      </div>
      {/* main area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* left source monitor */}
        <div style={{ flex: '1 1 0', borderRight: '1px solid #0a0a0a', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #2b4668 0%, #1a2540 60%, #0a0f1c 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* fake clip content */}
            <div style={{ position: 'absolute', left: '12%', top: '25%', right: '12%', bottom: '30%',
              background: 'linear-gradient(180deg, rgba(255,176,102,0.3), rgba(110,193,255,0.15))',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 * scale }} />
            <div style={{ position: 'absolute', right: 8 * scale, bottom: 6 * scale, fontFamily: '"Courier New", monospace',
              fontSize: 8 * scale, color: 'rgba(255,255,255,0.4)' }}>00:01:24:11</div>
          </div>
          <div style={{ height: 18 * scale, background: '#232324', borderTop: '1px solid #0a0a0a', display: 'flex', alignItems: 'center', padding: `0 ${8 * scale}px`, gap: 6 * scale }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ width: 7 * scale, height: 7 * scale, borderRadius: 1, background: '#3a3a3b' }} />
            ))}
          </div>
        </div>
        {/* right: plugin panel */}
        <div style={{ width: `${38 * scale}%`, background: '#1a1a1b', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            height: 20 * scale, background: '#242425', borderBottom: '1px solid #0a0a0a',
            display: 'flex', alignItems: 'center', padding: `0 ${10 * scale}px`,
            fontFamily: '"Courier New", monospace', fontSize: 9 * scale, color: '#e4e4e4',
          }}>
            {variant === 'ai-media-browser' ? 'ai_media_browser.jsx' : 'alexg.toolkit.jsx'}
          </div>
          <div style={{ flex: 1, padding: `${12 * scale}px ${12 * scale}px`, display: 'flex', flexDirection: 'column', gap: 8 * scale }}>
            {variant === 'ai-media-browser' ? (
              <>
                <div style={{ fontSize: 9 * scale, color: '#9b9b9b' }}>Semantic Search</div>
                <div style={{
                  background: '#0f0f10', border: '1px solid #2a2a2b', borderRadius: 3 * scale,
                  padding: `${6 * scale}px ${8 * scale}px`,
                  fontFamily: '"Courier New", monospace', fontSize: 9 * scale, color: '#6EC1FF',
                }}>golden hour interview b-roll</div>
                <div style={{ display: 'flex', gap: 6 * scale, marginTop: 4 * scale }}>
                  <div style={{
                    flex: 1, background: '#6EC1FF', color: '#08314d', textAlign: 'center',
                    fontSize: 9 * scale, fontWeight: 600, padding: `${5 * scale}px 0`, borderRadius: 3 * scale,
                  }}>Analyze</div>
                  <div style={{
                    background: '#2a2a2b', color: '#c8c8c8', textAlign: 'center',
                    fontSize: 9 * scale, padding: `${5 * scale}px ${10 * scale}px`, borderRadius: 3 * scale,
                  }}>Search</div>
                </div>
                <div style={{ marginTop: 8 * scale, fontSize: 8.5 * scale, color: '#6b6b6b', fontFamily: '"Courier New", monospace' }}>MATCHES</div>
                {['interview_keylight.mp4', 'office_broll_04.mp4', 'walkthrough_wide.mp4'].map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontFamily: '"Courier New", monospace', fontSize: 9 * scale, color: '#c8c8c8',
                    padding: `${3 * scale}px 0`, borderBottom: '1px dashed #2a2a2b',
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
                    <span style={{ color: '#6b6b6b' }}>{[92, 87, 81][i]}%</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {['Fast Cut', 'Speed Ramp', 'Auto Sync', 'Subtitle', 'Export'].map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: `${5 * scale}px ${8 * scale}px`,
                    background: i === 0 ? '#2a2a2b' : 'transparent',
                    borderRadius: 2 * scale, fontSize: 9.5 * scale,
                  }}>
                    <span>{n}</span>
                    <span style={{ fontFamily: '"Courier New", monospace', fontSize: 8 * scale, color: '#6b6b6b' }}>⌘{i+1}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {/* timeline strip */}
      <div style={{ height: 34 * scale, background: '#0f0f10', borderTop: '1px solid #0a0a0a', padding: `${4 * scale}px ${8 * scale}px`, display: 'flex', flexDirection: 'column', gap: 2 * scale }}>
        {[0, 1].map(row => (
          <div key={row} style={{ height: 10 * scale, background: '#1a1a1b', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: row === 0 ? '8%' : '22%',
              width: row === 0 ? '54%' : '38%',
              background: row === 0 ? 'linear-gradient(90deg, #3a6a9a, #2a4a70)' : 'linear-gradient(90deg, #7a5a3a, #5a4028)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: '1px solid rgba(0,0,0,0.3)',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// LUT preview. draggable before/after wipe for LUT demos.
function LutPreview({ tone = "teal-orange", scale = 1, interactive = false, initialSplit = 0.5, compare = null, scrollLinked = false, showLabels = true }) {
  const wrapRef = React.useRef(null);
  const baseVideoRef = React.useRef(null);
  const revealVideoRef = React.useRef(null);
  const splitMin = scrollLinked ? 0 : 0.08;
  const splitMax = scrollLinked ? 1 : 0.92;
  const clampSplit = React.useCallback((next) => Math.max(splitMin, Math.min(splitMax, next)), [splitMin, splitMax]);
  const [baseSplit, setBaseSplit] = React.useState(scrollLinked ? 0 : clampSplit(initialSplit));
  const baseSplitRef = React.useRef(scrollLinked ? 0 : clampSplit(initialSplit));
  const dragStartRef = React.useRef(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const split = clampSplit(baseSplit + dragOffset);
  const hasVideoCompare = Boolean(compare && compare.beforeSrc && compare.afterSrc);
  const tones = {
    "teal-orange": {
      a: "linear-gradient(135deg, #2a3540 0%, #1a2028 50%, #0f1519 100%)",
      b: "linear-gradient(135deg, #3a5268 0%, #1a2a3c 40%, #2a1a10 80%, #5a3a20 100%)",
    },
    "moody-blue": {
      a: "linear-gradient(135deg, #2a2a30 0%, #151520 60%, #0a0a14 100%)",
      b: "linear-gradient(135deg, #1a2844 0%, #0f1a2e 50%, #050914 100%)",
    },
    "warm-film": {
      a: "linear-gradient(135deg, #3a3028 0%, #20180f 60%, #0f0a05 100%)",
      b: "linear-gradient(135deg, #6a4a28 0%, #3a2414 40%, #1a0f05 100%)",
    },
    "neon": {
      a: "linear-gradient(135deg, #1a1a22 0%, #0a0a12 60%, #050508 100%)",
      b: "linear-gradient(135deg, #8a2c60 0%, #3a1a44 50%, #101030 100%)",
    },
    "onyx-night": {
      a: "linear-gradient(135deg, #12161c 0%, #07090d 55%, #010204 100%)",
      b: "linear-gradient(135deg, #061522 0%, #09111c 38%, #151226 62%, #2f1024 100%)",
    },
    "clean": {
      a: "linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 60%, #1a1a1a 100%)",
      b: "linear-gradient(135deg, #4a5a6a 0%, #3a4a58 50%, #1a2028 100%)",
    },
  };
  const t = tones[tone] || tones["teal-orange"];
  const updateSplitFromDrag = React.useCallback((clientX) => {
    if (!wrapRef.current || !dragStartRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const next = dragStartRef.current.split + ((clientX - dragStartRef.current.clientX) / rect.width);
    setDragOffset(clampSplit(next) - baseSplitRef.current);
  }, [clampSplit]);
  const nudgeSplit = React.useCallback((amount) => {
    setDragOffset(clampSplit(split + amount) - baseSplitRef.current);
  }, [clampSplit, split]);

  React.useEffect(() => {
    if (!scrollLinked) {
      const nextBase = clampSplit(initialSplit);
      baseSplitRef.current = nextBase;
      setBaseSplit(nextBase);
      return undefined;
    }

    let frame = null;
    const updateBaseSplit = () => {
      frame = null;
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      if (!viewportHeight) return;

      const elementCenter = rect.top + (rect.height / 2);
      const travel = viewportHeight + rect.height;
      const nextBase = clampSplit((viewportHeight + (rect.height / 2) - elementCenter) / travel);

      baseSplitRef.current = nextBase;
      setBaseSplit(prev => Math.abs(prev - nextBase) > 0.001 ? nextBase : prev);
    };

    const requestUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateBaseSplit);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [scrollLinked, initialSplit, clampSplit]);

  React.useEffect(() => {
    if (!hasVideoCompare) return undefined;
    const base = baseVideoRef.current;
    const reveal = revealVideoRef.current;
    if (!base || !reveal) return undefined;

    const syncReveal = () => {
      if (!base || !reveal) return;
      if (Math.abs((reveal.currentTime || 0) - (base.currentTime || 0)) > 0.08) {
        try {
          reveal.currentTime = base.currentTime || 0;
        } catch (err) {}
      }
      if (reveal.playbackRate !== base.playbackRate) reveal.playbackRate = base.playbackRate;
      if (base.paused && !reveal.paused) reveal.pause();
      if (!base.paused && reveal.paused) reveal.play().catch(() => {});
    };

    const handleLoadedMetadata = () => {
      try {
        reveal.currentTime = base.currentTime || 0;
      } catch (err) {}
      if (base.paused) return;
      reveal.play().catch(() => {});
    };

    base.addEventListener('play', syncReveal);
    base.addEventListener('pause', syncReveal);
    base.addEventListener('seeking', syncReveal);
    base.addEventListener('seeked', syncReveal);
    base.addEventListener('ratechange', syncReveal);
    base.addEventListener('timeupdate', syncReveal);
    base.addEventListener('loadedmetadata', handleLoadedMetadata);

    reveal.play().catch(() => {});
    base.play().catch(() => {});

    return () => {
      base.removeEventListener('play', syncReveal);
      base.removeEventListener('pause', syncReveal);
      base.removeEventListener('seeking', syncReveal);
      base.removeEventListener('seeked', syncReveal);
      base.removeEventListener('ratechange', syncReveal);
      base.removeEventListener('timeupdate', syncReveal);
      base.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [hasVideoCompare, compare?.beforeSrc, compare?.afterSrc]);

  const renderSubject = (fill) => (
    <div style={{
      position: 'absolute', left: '30%', top: '35%', width: '30%', height: '40%',
      background: fill,
      borderRadius: '50% 50% 45% 45%',
    }} />
  );

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'auto', userSelect: interactive ? 'none' : 'auto', cursor: 'inherit' }}
    >
      {hasVideoCompare ? (
        <>
          <video
            ref={baseVideoRef}
            src={compare.beforeSrc}
            title={compare.beforeTitle || `${compare.title || 'LUT'} ${compare.beforeLabel || 'ungraded'} preview`}
            aria-label={compare.beforeTitle || `${compare.title || 'LUT'} ${compare.beforeLabel || 'ungraded'} preview`}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(0 ${Math.max(0, (1 - split) * 100)}% 0 0)`,
          }}>
            <video
              ref={revealVideoRef}
              src={compare.afterSrc}
              title={compare.afterTitle || `${compare.title || 'LUT'} ${compare.afterLabel || 'graded'} preview`}
              aria-label={compare.afterTitle || `${compare.title || 'LUT'} ${compare.afterLabel || 'graded'} preview`}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {showLabels && (
            <>
              <div style={{
                position: 'absolute',
                left: 10 * scale,
                top: 10 * scale,
                fontFamily: '"Courier New", monospace',
                fontSize: 9 * scale,
                color: 'rgba(255,255,255,0.9)',
                padding: `${4 * scale}px ${8 * scale}px`,
                background: 'rgba(0,0,0,0.45)',
                borderRadius: 999,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}>{(compare.afterLabel || 'GRADED').toUpperCase()}</div>
              <div style={{
                position: 'absolute',
                right: 10 * scale,
                top: 10 * scale,
                fontFamily: '"Courier New", monospace',
                fontSize: 9 * scale,
                color: 'rgba(255,255,255,0.76)',
                padding: `${4 * scale}px ${8 * scale}px`,
                background: 'rgba(0,0,0,0.35)',
                borderRadius: 999,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}>{(compare.beforeLabel || 'UNGRADED').toUpperCase()}</div>
            </>
          )}
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: t.a }}>
            {renderSubject('radial-gradient(ellipse, rgba(255,255,255,0.08), transparent)')}
            <div style={{ position: 'absolute', left: 10 * scale, top: 10 * scale,
              fontFamily: '"Courier New", monospace', fontSize: 9 * scale, color: 'rgba(255,255,255,0.5)' }}>BEFORE</div>
          </div>

          <div style={{
            position: 'absolute',
            inset: 0,
            background: t.b,
            clipPath: `inset(0 0 0 ${split * 100}%)`,
          }}>
            {renderSubject('radial-gradient(ellipse, rgba(255,200,150,0.2), transparent)')}
            <div style={{ position: 'absolute', right: 10 * scale, top: 10 * scale,
              fontFamily: '"Courier New", monospace', fontSize: 9 * scale, color: 'rgba(255,255,255,0.8)' }}>AFTER</div>
          </div>
        </>
      )}

      {interactive ? (
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(${split * 100}% - 0.5px)`,
            width: 1,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }} />
          <div
            role="slider"
            aria-label="Compare graded and ungraded preview"
            aria-valuemin={Math.round(splitMin * 100)}
            aria-valuemax={Math.round(splitMax * 100)}
            aria-valuenow={Math.round(split * 100)}
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
              e.preventDefault();
              e.stopPropagation();
              nudgeSplit(e.key === 'ArrowLeft' ? -0.04 : 0.04);
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragStartRef.current = { clientX: e.clientX, split };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              e.preventDefault();
              e.stopPropagation();
              updateSplitFromDrag(e.clientX);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragStartRef.current = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragStartRef.current = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            style={{
              position: 'absolute',
              left: `calc(${split * 100}% - ${22 * scale}px)`,
              top: 0,
              bottom: 0,
              width: 44 * scale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 0,
              padding: 0,
              background: 'transparent',
              cursor: 'ew-resize',
              touchAction: 'none',
            }}
          >
            <div style={{
              width: 30 * scale,
              height: 30 * scale,
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}>
              <div style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10 * scale,
                letterSpacing: 0,
                color: 'rgba(255,255,255,0.9)',
              }}>‹›</div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${split * 100}% - 0.5px)`, width: 1, background: 'rgba(255,255,255,0.8)' }} />
      )}
    </div>
  );
}

// Portfolio still. varied cinematic frames
function PortfolioStill({ seed = 0 }) {
  const variants = [
    { bg: 'linear-gradient(135deg, #1a3a5a 0%, #0a1828 50%, #000 100%)', hue: 'rgba(110, 193, 255, 0.25)' },
    { bg: 'linear-gradient(160deg, #5a3418 0%, #2a1808 50%, #0a0400 100%)', hue: 'rgba(255, 176, 102, 0.25)' },
    { bg: 'linear-gradient(200deg, #282828 0%, #101010 80%)', hue: 'rgba(255,255,255,0.05)' },
    { bg: 'linear-gradient(120deg, #3a1a3a 0%, #1a0a2a 60%, #050010 100%)', hue: 'rgba(200, 110, 255, 0.2)' },
    { bg: 'linear-gradient(170deg, #1a3a2a 0%, #0a1a18 60%, #030a08 100%)', hue: 'rgba(110, 255, 180, 0.2)' },
    { bg: 'linear-gradient(140deg, #4a4028 0%, #2a1e10 60%, #0a0604 100%)', hue: 'rgba(255, 210, 110, 0.2)' },
    { bg: 'linear-gradient(200deg, #1a1a2a 0%, #0a0a18 60%, #000 100%)', hue: 'rgba(110, 140, 255, 0.18)' },
    { bg: 'linear-gradient(150deg, #5a2828 0%, #2a1010 60%, #0a0404 100%)', hue: 'rgba(255, 110, 110, 0.2)' },
  ];
  const v = variants[seed % variants.length];
  return (
    <div style={{ position: 'absolute', inset: 0, background: v.bg, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: '20%', top: '15%', right: '20%', bottom: '15%',
        background: `radial-gradient(ellipse at 40% 60%, ${v.hue}, transparent 70%)`,
      }} />
      {/* subject silhouette */}
      <div style={{
        position: 'absolute', left: '32%', top: '30%', width: '36%', height: '60%',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.08), transparent 50%)',
        borderRadius: '40% 40% 10% 10%',
      }} />
      {/* grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '3px 3px', mixBlendMode: 'overlay',
      }} />
    </div>
  );
}

// 3-frame contact sheet for OMI proof
function OmiContactSheet() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, background: '#000' }}>
      <PortfolioStill seed={0} />
      <div style={{ position: 'relative' }}><PortfolioStill seed={3} /></div>
      <div style={{ position: 'relative' }}><PortfolioStill seed={5} /></div>
    </div>
  );
}

Object.assign(window, { PremiereScreenshot, LutPreview, PortfolioStill, OmiContactSheet });
