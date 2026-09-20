(function () {
  'use strict';

  /* ---------- load shared header/footer, then wire up the page ---------- */
  /* Works with any HTTP server (this project's serve.js, VSCode Live Server,
     a static host in production, etc.) — the only requirement is that the
     page be loaded over http(s), not opened directly as a file. */

  var includeEls = document.querySelectorAll('[data-include]');
  var loads = Array.prototype.map.call(includeEls, function (el) {
    var url = el.getAttribute('data-include');
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      })
      .catch(function (err) {
        console.error(err);
      });
  });

  Promise.all(loads).then(initPage);

  function initPage() {
    /* ---------- hamburger nav ---------- */

    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');

    function closeMenu() {
      if (!header) return;
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      if (!header) return;
      header.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    if (toggle && header) {
      toggle.addEventListener('click', function () {
        if (header.classList.contains('is-open')) closeMenu();
        else openMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      document.addEventListener('click', function (e) {
        if (!header.classList.contains('is-open')) return;
        if (header.contains(e.target)) return;
        closeMenu();
      });
    }

    /* mark the current page's nav link (home is "/", pages are /html/<slug>.html) */
    if (nav) {
      var here = location.pathname;
      Array.prototype.forEach.call(nav.querySelectorAll('[data-nav-link]'), function (link) {
        if (link.getAttribute('href') === here) link.classList.add('is-current');
      });
    }

    /* ---------- header shadow on scroll + mobile sticky CTA ---------- */
    /* The sticky bar is hidden on the contact page and whenever another CTA
       (section CTA, form, footer) is already on screen. */

    var stickyCta = document.querySelector('[data-sticky-cta]');
    if (stickyCta && /contact\.html$/.test(location.pathname)) {
      stickyCta.remove();
      stickyCta = null;
    }

    var ctaZonesInView = new Set();

    function updateChrome() {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (stickyCta) stickyCta.classList.toggle('is-visible', y > 480 && ctaZonesInView.size === 0);
    }

    if (stickyCta && 'IntersectionObserver' in window) {
      var zoneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) ctaZonesInView.add(entry.target);
          else ctaZonesInView.delete(entry.target);
        });
        updateChrome();
      });
      Array.prototype.forEach.call(
        document.querySelectorAll('.site-footer, .section-cta, .contact-card, form'),
        function (zone) { zoneObserver.observe(zone); }
      );
    }

    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        scrollTicking = false;
        updateChrome();
      });
    }, { passive: true });
    updateChrome();

    /* ---------- scroll reveal ---------- */
    /* Blocks below the fold fade up as they scroll into view. Anything already on
       screen at load is left alone (no flash), and nothing is hidden at all when
       the visitor prefers reduced motion or the browser lacks IntersectionObserver.
       Classes are removed again once the transition is done, so hover effects work. */

    var REVEAL_SELECTOR = [
      '.section-head', '.split > *', '.pillar', '.flow__item', '.stat-band .stat', '.stat-tile',
      '.step', '.person', '.media', '.bar-compare', '.plan-card', '.simulator', '.coming-soon',
      '.table-wrap', '.section-cta > *'
    ].join(', ');

    var revealEls = document.querySelectorAll(REVEAL_SELECTOR);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (revealEls.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
      var siblingCount = new Map();

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          revealObserver.unobserve(el);
          el.classList.add('is-in');
          setTimeout(function () {
            el.classList.remove('reveal', 'is-in');
            el.style.removeProperty('--i');
          }, 1600);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      Array.prototype.forEach.call(revealEls, function (el) {
        var parent = el.parentElement;
        if (parent && parent.closest('.reveal')) return; /* child of an animating block */
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; /* already visible */
        var index = siblingCount.get(parent) || 0;
        siblingCount.set(parent, index + 1);
        el.style.setProperty('--i', Math.min(index, 5)); /* stagger siblings */
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }

    /* ---------- logo → Home (on the home page itself: back to the top, no reload) ---------- */

    if (location.pathname === '/' || /\/index\.html$/.test(location.pathname)) {
      Array.prototype.forEach.call(document.querySelectorAll('.brand'), function (logo) {
        logo.addEventListener('click', function (e) {
          e.preventDefault();
          var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    }

    /* ---------- price simulator (Plan & Pricing page) ---------- */

    var sim = document.querySelector('[data-simulator]');
    if (sim) {
      var areaInput = sim.querySelector('[data-sim-area]');
      var unitButtons = sim.querySelectorAll('[data-sim-unit]');
      var currencyButtons = sim.querySelectorAll('[data-sim-currency]');
      var baseOut = sim.querySelector('[data-sim-base]');

      var SQFT_PER_SQM = 10.7639;
      // Approximate reference rate only — not a live quote. Update periodically.
      var JPY_PER_USD = 150;

      var unit = 'sqm';
      var currency = 'jpy';

      var formatAmount = function (yen) {
        if (currency === 'usd') {
          return (yen / JPY_PER_USD).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          });
        }
        return '¥' + Math.round(yen).toLocaleString('en-US');
      };

      var recalc = function () {
        var raw = parseFloat(areaInput.value);
        if (!raw || raw <= 0) {
          baseOut.textContent = '—';
          return;
        }
        var sqm = unit === 'sqm' ? raw : raw / SQFT_PER_SQM;
        var base = 500000 + 50000 * sqm;
        baseOut.textContent = formatAmount(base);
      };

      unitButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          unit = btn.getAttribute('data-sim-unit');
          unitButtons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
          areaInput.placeholder = unit === 'sqm' ? 'e.g. 120' : 'e.g. 1,292';
          recalc();
        });
      });

      currencyButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          currency = btn.getAttribute('data-sim-currency');
          currencyButtons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
          recalc();
        });
      });

      areaInput.addEventListener('input', recalc);
    }
  }
})();
