/**
 * Featured reviews carousel: slow continuous horizontal scroll when section is visible.
 * Pauses on hover, touch, wheel, hidden tab, and prefers-reduced-motion.
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

    const pixelsPerSecond = Math.max(
      4,
      parseFloat(section.dataset.autoscrollSpeed || '20') || 20
    );

    let rafId = null;
    let lastTs = null;
    let visible = false;
    let hovered = false;
    let touchHeld = false;
    let wheelCooldown = null;

    function shouldRun() {
      return (
        visible &&
        !hovered &&
        !touchHeld &&
        !document.hidden &&
        !prefersReducedMotion() &&
        wheelCooldown === null
      );
    }

    function stopLoop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastTs = null;
    }

    function tick(ts) {
      if (!shouldRun()) {
        stopLoop();
        return;
      }

      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 1) {
        stopLoop();
        return;
      }

      if (lastTs === null) lastTs = ts;
      let dt = (ts - lastTs) / 1000;
      if (dt > 0.25) dt = 0.25;
      lastTs = ts;

      track.scrollLeft += pixelsPerSecond * dt;

      if (track.scrollLeft >= maxScroll - 0.75) {
        track.scrollLeft = 0;
      }

      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      stopLoop();
      if (!shouldRun()) return;
      lastTs = null;
      rafId = requestAnimationFrame(tick);
    }

    function sync() {
      if (prefersReducedMotion()) {
        stopLoop();
        return;
      }
      if (shouldRun()) {
        startLoop();
      } else {
        stopLoop();
      }
    }

    /* Any intersection counts — ratio alone breaks thin/short sections */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          sync();
        });
      },
      { threshold: [0, 0.01, 0.05, 0.1], rootMargin: '0px' }
    );
    io.observe(section);

    /* IO can be delayed first paint — kick sync once layout exists */
    requestAnimationFrame(() => {
      const pending = io.takeRecords();
      if (pending.length) {
        pending.forEach((entry) => {
          visible = entry.isIntersecting;
        });
      } else {
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        visible = r.top < vh && r.bottom > 0;
      }
      sync();
    });

    section.addEventListener(
      'mouseenter',
      () => {
        hovered = true;
        stopLoop();
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
        stopLoop();
      },
      { passive: true }
    );
    track.addEventListener(
      'touchend',
      () => {
        touchHeld = false;
        window.setTimeout(sync, 600);
      },
      { passive: true }
    );

    track.addEventListener(
      'wheel',
      () => {
        stopLoop();
        if (wheelCooldown !== null) clearTimeout(wheelCooldown);
        wheelCooldown = setTimeout(() => {
          wheelCooldown = null;
          sync();
        }, 2800);
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
