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

    /* ---------- price simulator (Transparent Pricing page) ---------- */

    var sim = document.querySelector('[data-simulator]');
    if (sim) {
      var areaInput = sim.querySelector('[data-sim-area]');
      var unitButtons = sim.querySelectorAll('[data-sim-unit]');
      var currencyButtons = sim.querySelectorAll('[data-sim-currency]');
      var baseOut = sim.querySelector('[data-sim-base]');
      var plusOut = sim.querySelector('[data-sim-plus]');

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
          plusOut.textContent = '—';
          return;
        }
        var sqm = unit === 'sqm' ? raw : raw / SQFT_PER_SQM;
        var base = 500000 + 50000 * sqm;
        var plus = 200000 * sqm;
        baseOut.textContent = formatAmount(base);
        plusOut.textContent = formatAmount(plus);
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
