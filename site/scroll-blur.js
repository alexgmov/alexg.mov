import React from 'react';

const SCROLL_BLUR_MAX = 14;
const SCROLL_BLUR_START_VIEWPORT_RATIO = 0.4;
const SCROLL_BLUR_ENTER_RATE_MULTIPLIER = 1.05;
const SCROLL_BLUR_CSS_VARIABLE = '--home-scroll-blur';

function smoothstep(progress) {
  return progress * progress * (3 - (2 * progress));
}

export function getScrollBlur(rect, viewportHeight, includeEnterBlur = true) {
  const exitRange = viewportHeight * SCROLL_BLUR_START_VIEWPORT_RATIO;
  const enterRange = exitRange * SCROLL_BLUR_ENTER_RATE_MULTIPLIER;
  const enterFocusLine = viewportHeight - enterRange;
  const exitProgress = Math.max(0, Math.min(1, (exitRange - rect.bottom) / exitRange));
  const enterProgress = includeEnterBlur
    ? Math.max(0, Math.min(1, (rect.top - enterFocusLine) / enterRange))
    : 0;
  return smoothstep(Math.max(exitProgress, enterProgress)) * SCROLL_BLUR_MAX;
}

export function useScrollBlur(selector, refreshKey) {
  React.useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const initiallyVisibleElements = new WeakSet();
    let raf = 0;

    const getElements = () => Array.from(document.querySelectorAll(selector));
    const setBlur = (element, value) => {
      element.style.setProperty(SCROLL_BLUR_CSS_VARIABLE, `${value.toFixed(2)}px`);
    };
    const update = () => {
      raf = 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const reduceMotion = motionQuery.matches;

      getElements().forEach((element) => {
        if (reduceMotion) {
          setBlur(element, 0);
          return;
        }

        const rect = element.getBoundingClientRect();
        setBlur(element, getScrollBlur(rect, viewportHeight, !initiallyVisibleElements.has(element)));
      });
    };
    const requestUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    const initialViewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    getElements().forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < initialViewportHeight) initiallyVisibleElements.add(element);
    });

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
      getElements().forEach((element) => element.style.removeProperty(SCROLL_BLUR_CSS_VARIABLE));
    };
  }, [selector, refreshKey]);
}
