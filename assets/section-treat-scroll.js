(function () {
  /**
   * Treat scroll section.
   *
   * - Hand: normal document flow, scrolls away naturally.
   * - Treats: centered in a sticky stage (= fixed to viewport center while
   *   the section is in view). Only rotate with scroll — no translation.
   *   Animation begins when the section top reaches the navbar bottom.
   * - Tube: normal document flow at the bottom of the component.
   *   Scrolls into view naturally.
   * - Benefit cards: normal document flow, no JavaScript needed.
   */

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  /**
   * Returns the current height of the sticky navigation bar.
   * Tries the Dawn sticky-header custom element first, then falls back to
   * the first <header> on the page.
   */
  function getNavHeight() {
    var nav =
      document.querySelector('sticky-header') ||
      document.querySelector('header');
    return nav ? nav.getBoundingClientRect().height : 0;
  }

  /**
   * Static scatter offset (vw/vh) from the viewport center for each treat,
   * rotation rate, and optional drift (vh to travel upward over the full scroll).
   * Positive drift = moves down, negative drift = moves up.
   */
  var TREAT_CONFIG = [
    { dx: -3, dy: -2, rotRate:  1.5, drift: -40 }, // treat-1: drifts down
    { dx:  3, dy:  1, rotRate: -2.8, drift:   5 }, // treat-2: drifts down
    { dx: -2, dy:  3, rotRate:  1.1, drift:  -2 }, // treat-3: drifts up
    { dx:  2, dy: -3, rotRate: -1.4, drift: -28 }, // treat-4: drifts down
    { dx:  0, dy:  7, rotRate:  2.7, drift: -17 }, // treat-5: drifts down
    { dx: -4, dy:  2, rotRate:  1.04, drift: -28 }, // treat-6: drifts up
    { dx:  -2, dy: -1, rotRate: -2.05, drift:  15 }, // treat-7: drifts down
  ];

  function initSection(section) {
    var body  = section.querySelector('[data-treat-scroll-body]');
    var stage = section.querySelector('[data-treat-scroll-stage]');
    if (!body || !stage) return;

    var treats = Array.from(stage.querySelectorAll('.treat-scroll__treat'));
    if (treats.length === 0) return;

    var rafQueued = false;

    // Cache the section's top position in the document so we only compute it
    // once (it doesn't change unless the page reflows).  Cleared on resize.
    var sectionDocTop = null;

    function getSectionDocTop() {
      if (sectionDocTop === null) {
        var rect = section.getBoundingClientRect();
        sectionDocTop = (window.pageYOffset || window.scrollY) + rect.top;
      }
      return sectionDocTop;
    }

    window.addEventListener('resize', function () {
      sectionDocTop = null;
    }, { passive: true });

    /**
     * Returns 0 until the section top reaches the navbar bottom, then grows
     * 0 → 1 as the user scrolls through the rest of the component.
     *
     * triggerScrollY  = scroll position where section top == navbar bottom
     * endScrollY      = scroll position where section bottom == viewport bottom
     */
    function getProgress() {
      var navH         = getNavHeight();
      var docTop       = getSectionDocTop();
      var scrollY      = window.pageYOffset || window.scrollY;
      var triggerScrollY = docTop - navH;
      var endScrollY     = docTop + section.offsetHeight - window.innerHeight;
      var total          = endScrollY - triggerScrollY;
      return total > 0 ? clamp((scrollY - triggerScrollY) / total, 0, 1) : 0;
    }

    function render() {
      rafQueued = false;
      var ap = getProgress();

      treats.forEach(function (el, i) {
        var s   = TREAT_CONFIG[i];
        var rot = ap * 100 * s.rotRate;
        var dy  = s.dy + ap * (s.drift || 0);
        el.style.transform =
          'translate(calc(' + s.dx + 'vw - 50%), calc(' + dy + 'vh - 50%)) rotate(' + rot + 'deg)';
      });
    }

    function onScroll() {
      if (!rafQueued) {
        rafQueued = true;
        requestAnimationFrame(render);
      }
    }

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    document.querySelectorAll('[id^="treat-scroll-"]').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
