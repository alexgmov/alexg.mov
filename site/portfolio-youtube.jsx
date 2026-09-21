import React from 'react';

let youtubeAPI;

function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeAPI) {
    youtubeAPI = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const previousReady = window.onYouTubeIframeAPIReady;
      const timeout = window.setTimeout(() => reject(new Error('YouTube did not load')), 10000);
      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timeout);
        window.onYouTubeIframeAPIReady = previousReady;
        resolve(window.YT);
        previousReady?.();
      };
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('YouTube did not load'));
      };
      document.head.appendChild(script);
    });
  }
  return youtubeAPI;
}

export function PortfolioYouTubePlayer({ item, preview = false, onUnavailable }) {
  const hostRef = React.useRef(null);
  const onUnavailableRef = React.useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;
  const [started, setStarted] = React.useState(preview);
  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!started) return undefined;
    let cancelled = false;
    let unavailable = false;
    let player;
    const fail = () => {
      if (cancelled || unavailable) return;
      unavailable = true;
      window.clearTimeout(timeout);
      player?.stopVideo?.();
      setFailed(true);
      onUnavailableRef.current?.();
    };
    const timeout = window.setTimeout(fail, 15000);
    loadYouTubeAPI().then((YT) => {
      if (cancelled || unavailable) return;
      const mount = document.createElement('div');
      hostRef.current.appendChild(mount);
      player = new YT.Player(mount, {
        width: '100%',
        height: '100%',
        videoId: item.youtubeId,
        playerVars: {
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
          autoplay: 1,
          mute: preview ? 1 : 0,
          controls: preview ? 0 : 1,
          ...(preview ? { loop: 1, playlist: item.youtubeId } : {}),
        },
        events: {
          onReady: (event) => {
            if (cancelled || unavailable) return;
            window.clearTimeout(timeout);
            setReady(true);
            if (preview) event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (!cancelled && event.data === 1) setPlaying(true);
          },
          onError: fail,
          onAutoplayBlocked: () => { if (preview) fail(); },
        },
      });
      const iframe = player.getIframe();
      iframe.title = preview ? `${item.client} video preview` : item.title;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      if (preview) iframe.tabIndex = -1;
    }).catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      player?.destroy();
    };
  }, [started, item.youtubeId, item.title, item.client, preview]);

  return (
    <div className={preview ? 'work-youtube-preview' : 'work-youtube-player'}>
      <div ref={hostRef} className="work-youtube-host" hidden={failed} aria-hidden={preview || failed || undefined}
        style={{ opacity: preview && !playing ? 0 : 1 }} />
      {!preview && (!started || !ready || failed) && (
        <div className="work-youtube-cover">
          {failed ? (
            <>
              <p>YouTube couldn’t play this video here.</p>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube <span aria-hidden="true">↗</span></a>
            </>
          ) : started ? <p>Loading video…</p> : (
            <button type="button" onClick={() => setStarted(true)} aria-label={`Play ${item.title}`}>
              <span aria-hidden="true">▶</span> Play vlog
            </button>
          )}
        </div>
      )}
    </div>
  );
}
