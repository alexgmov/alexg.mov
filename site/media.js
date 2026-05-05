import React from 'react';

export const MOBILE_VIDEO_QUERY = '(max-width: 720px)';

function splitUrlTail(src) {
  const value = String(src || '');
  const match = value.match(/^([^?#]+)([?#].*)?$/);
  return {
    path: match ? match[1] : value,
    tail: match?.[2] || '',
  };
}

export function getVideoVariantSrc(src, suffix = 'mobile') {
  if (!src) return src;
  const { path, tail } = splitUrlTail(src);
  const extIndex = path.toLowerCase().lastIndexOf('.mp4');
  if (extIndex === -1) return src;
  const normalizedSuffix = suffix.startsWith('.') ? suffix : `.${suffix}`;
  return `${path.slice(0, extIndex)}${normalizedSuffix}${path.slice(extIndex)}${tail}`;
}

export function getVideoPosterSrc(src) {
  if (!src) return src;
  const { path, tail } = splitUrlTail(src);
  const extIndex = path.toLowerCase().lastIndexOf('.mp4');
  if (extIndex === -1) return src;
  return `${path.slice(0, extIndex)}.poster.jpg${tail}`;
}

function queryMatches(query) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(() => queryMatches(query));

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

export function getResponsiveVideoSrc(src) {
  return queryMatches(MOBILE_VIDEO_QUERY) ? getVideoVariantSrc(src, 'mobile') : src;
}

export function useResponsiveVideoSrc(src) {
  const isMobile = useMediaQuery(MOBILE_VIDEO_QUERY);
  return React.useMemo(() => (
    isMobile ? getVideoVariantSrc(src, 'mobile') : src
  ), [isMobile, src]);
}
