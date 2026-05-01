/**
 * Featured reviews carousel: auto-advance horizontal strip when section is visible.
 * Pauses on hover, touch, hidden tab, and prefers-reduced-motion.
 */
(function () {
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setup(section) {
    const track = section.querySelector('[id^="Slider-"]');
    if (!track) return;

    const slides = track.querySelectorAll('.slider__slide');
    if (slides.length < 2) return;

    const intervalMs = Math.max(
      3000,
      parseInt(section.dataset.autoscrollInterval || '5000', 10) || 5000
    );

    let timer = null;
    let visible = false;
    let hovered = false;
    let touchHeld = false;

    function getStep() {
      const first = slides[0];
      return first ? first.offsetWidth || first.getBoundingClientRect().width : 0;
    }

    function advance() {
      const step = getStep();
      if (step <= 0) return;

      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 1) return;

      const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      const nextLeft = track.scrollLeft + step;

      if (nextLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior });
      } else {
        track.scrollBy({ left: step, behavior });
      }
    }

    function startTimer() {
      stopTimer();
      if (prefersReducedMotion()) return;
      if (!visible || hovered || touchHeld) return;
      if (document.hidden) return;

      timer = window.setInterval(advance, intervalMs);
    }

    function stopTimer() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function sync() {
      if (prefersReducedMotion()) {
        stopTimer();
        return;
      }
      if (visible && !hovered && !touchHeld && !document.hidden) {
        startTimer();
      } else {
        stopTimer();
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
          sync();
        });
      },
      { threshold: [0, 0.1, 0.2], rootMargin: '0px 0px -5% 0px' }
    );
    io.observe(section);

    section.addEventListener(
      'mouseenter',
      () => {
        hovered = true;
        stopTimer();
      },
      { passive: true }
    );
    section.addEventListener(
      'mouseleave',
      () => {
        hovered = false;
        sync();
      },
      { passive: true }
    );

    track.addEventListener(
      'touchstart',
      () => {
        touchHeld = true;
        stopTimer();
      },
      { passive: true }
    );
    track.addEventListener(
      'touchend',
      () => {
        touchHeld = false;
        window.setTimeout(sync, 800);
      },
      { passive: true }
    );

    document.addEventListener('visibilitychange', sync);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) {
      mq.addEventListener('change', sync);
    } else if (mq.addListener) {
      mq.addListener(sync);
    }

    window.addEventListener(
      'resize',
      () => {
        /* Recalculate on layout change */
        sync();
      },
      { passive: true }
    );
  }

  function init(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-featured-reviews-autoscroll="true"]').forEach((section) => {
      if (section.dataset.autoscrollReady === 'true') return;
      section.dataset.autoscrollReady = 'true';
      setup(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document));
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', (event) => {
    init(event.target);
  });
})();
