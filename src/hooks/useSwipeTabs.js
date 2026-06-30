import { useEffect, useRef } from 'react';

const SWIPE_MIN = 60;

/** Swipe left → rightTab, swipe right → leftTab. Uses non-passive touchmove so the browser doesn't steal horizontal gestures. */
export function useSwipeTabs(tab, setTab, leftTab, rightTab) {
  const containerRef = useRef(null);
  const tabRef = useRef(tab);
  const swipeRef = useRef(null);

  useEffect(() => { tabRef.current = tab; }, [tab]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onStart(e) {
      const t = e.touches[0];
      if (!t) return;
      swipeRef.current = { x: t.clientX, y: t.clientY, horizontal: false };
    }

    function onMove(e) {
      const start = swipeRef.current;
      if (!start) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (!start.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        start.horizontal = true;
      }
      if (start.horizontal && e.cancelable) e.preventDefault();
    }

    function onEnd(e) {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start) return;

      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;

      if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;

      const current = tabRef.current;
      if (dx < 0 && current === leftTab) setTab(rightTab);
      else if (dx > 0 && current === rightTab) setTab(leftTab);
    }

    function onCancel() {
      swipeRef.current = null;
    }

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [setTab, leftTab, rightTab]);

  return containerRef;
}
