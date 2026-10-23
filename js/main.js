/* LOVELOX homepage — merged interactions (Part 1 + Part 2), vanilla JS, no dependencies.
   Everything is scoped to #lx-root so there are no globals beyond this IIFE. */
(function () {
  'use strict';
  var root = document.getElementById('lx-root');
  if (!root) return;
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');

  root.classList.add('lx-js');

  /* ---------- reveal on scroll ---------- */
  function observeReveals() {
    var els = $$('.lx-reveal, .lx-curve');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('lx-menu-btn');
  var mnav = document.getElementById('lx-mnav');
  if (menuBtn && mnav) {
    var path = menuBtn.querySelector('path');
    var setMenu = function (open) {
      mnav.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (path) path.setAttribute('d', open ? 'M3 0l16 14M3 14L19 0' : 'M0 1h22M0 7h22M0 13h14');
    };
    menuBtn.addEventListener('click', function () { setMenu(mnav.hidden); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (!mnav.hidden && root.clientWidth > 820) setMenu(false); });
  }

  /* ---------- the signature: closed / open / worn ---------- */
  var seg = document.getElementById('lx-seg');
  if (seg) {
    var order = ['closed', 'open', 'worn'];
    var scaleOff = { closed: 1.04, open: 1.04, worn: 1.06 };
    var view = 'closed', touched = false;
    var views = $$('[data-view]');
    var showView = function (v) {
      view = v;
      views.forEach(function (img) {
        var on = img.getAttribute('data-view') === v;
        img.style.opacity = on ? 1 : 0;
        img.style.scale = on ? 1 : scaleOff[img.getAttribute('data-view')];
      });
      $$('[data-show]', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-show') === v ? 'true' : 'false'); });
    };
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-show]');
      if (!b) return;
      touched = true;
      showView(b.getAttribute('data-show'));
    });
    setInterval(function () {
      if (touched || document.hidden) return;
      showView(order[(order.indexOf(view) + 1) % 3]);
    }, 3800);
  }

  /* ---------- the locket window ---------- */
  var win = document.getElementById('lx-lkw');
  if (win) {
    var lks = $$('[data-lk]', win);
    var raf = 0;
    var proximity = function (cx, cy) {
      var wr = win.getBoundingClientRect();
      win.style.setProperty('--mx', (cx - wr.left) + 'px');
      win.style.setProperty('--my', (cy - wr.top) + 'px');
      lks.forEach(function (el) {
        var b = el.querySelector('.lk-body');
        if (!b || !b.offsetParent) return;
        var r = b.getBoundingClientRect();
        var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        var open = el.classList.contains('is-open');
        if (!open && d < 170) el.classList.add('is-open');
        else if (open && d > 230) el.classList.remove('is-open');
        var hang = el.querySelector('.lk-hang');
        if (hang) {
          var t = d < 320 ? Math.max(-7, Math.min(7, -dx / 22)) * (1 - d / 320) : 0;
          hang.style.setProperty('--tilt', t.toFixed(2) + 'deg');
        }
      });
    };
    win.addEventListener('mousemove', function (e) {
      var cx = e.clientX, cy = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { proximity(cx, cy); });
    });
    win.addEventListener('mouseleave', function () {
      cancelAnimationFrame(raf);
      lks.forEach(function (el) {
        el.classList.remove('is-open');
        var h = el.querySelector('.lk-hang'); if (h) h.style.setProperty('--tilt', '0deg');
      });
    });
    lks.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (mq('(hover: none)') && !el.classList.contains('is-open')) { e.preventDefault(); el.classList.add('is-open'); }
      });
    });
    if (mq('(hover: none)') && 'IntersectionObserver' in window) {
      var wio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        wio.disconnect();
        lks.forEach(function (el, i) {
          if (!el.offsetParent) return;
          setTimeout(function () { el.classList.add('is-open'); }, 500 + i * 380);
        });
      }, { threshold: 0.35 });
      wio.observe(win);
    }
  }

  /* ---------- the engraving atelier ---------- */
  var write = document.getElementById('lx-write');
  if (write) {
    var FONTS = {
      times: { family: "'Times New Roman', Times, serif", size: 30, track: 1 },
      sans: { family: "'Jost', Futura, sans-serif", size: 25, track: 3 },
      script: { family: "'Pinyon Script', 'Snell Roundhand', cursive", size: 38, track: 0 }
    };
    var METALS = {
      silver: { label: 'Silver', a: '#F7F7F5', b: '#C8C9CD', c: '#94969D', ink: '#4A4D55' },
      gold: { label: 'Gold', a: '#F6E6B8', b: '#D1AB60', c: '#9E7634', ink: '#5A4016' },
      rose: { label: 'Rose gold', a: '#F8DED2', b: '#D8A08A', c: '#A86E59', ink: '#66392A' }
    };
    var stage = write.closest('svg');
    var texts = $$('text', write);
    var wb = false, wt = 0;
    var rewrite = function () {
      wb = !wb;
      write.setAttribute('class', 'lx-write ' + (wb ? 'lx-wb' : 'lx-wa'));
    };
    var setFont = function (id) {
      var f = FONTS[id];
      texts.forEach(function (t) {
        t.setAttribute('font-family', f.family);
        t.setAttribute('font-size', f.size);
        t.setAttribute('letter-spacing', f.track);
      });
      $$('[data-font]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-font') === id ? 'true' : 'false'); });
    };
    var setMetal = function (id) {
      var m = METALS[id];
      $$('[data-m]', stage).forEach(function (s) { s.setAttribute('stop-color', m[s.getAttribute('data-m')]); });
      $$('[data-ms]', stage).forEach(function (s) { s.setAttribute('stroke', m[s.getAttribute('data-ms')]); });
      $$('[data-mf]', stage).forEach(function (s) { s.setAttribute('fill', m[s.getAttribute('data-mf')]); });
      texts.forEach(function (t) { t.setAttribute('fill', m.ink); t.setAttribute('stroke', m.ink); });
      $$('[data-worn]').forEach(function (img) { img.style.opacity = img.getAttribute('data-worn') === id ? 1 : 0; });
      var nm = document.getElementById('lx-metal-name'); if (nm) nm.textContent = m.label;
      $$('[data-metal]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-metal') === id ? 'true' : 'false'); });
    };
    $$('[data-line]').forEach(function (input) {
      var n = input.getAttribute('data-line');
      var onInput = function () {
        var v = (input.value || '').slice(0, 10);
        if (input.value !== v) input.value = v;
        var t = write.querySelector('[data-t="' + n + '"]');
        if (t && t.textContent !== v) {
          t.textContent = v;
          clearTimeout(wt);
          wt = setTimeout(rewrite, 900);
        }
        var c = document.getElementById('lx-c' + n); if (c) c.textContent = v.length;
      };
      input.addEventListener('input', onInput);
      input.addEventListener('change', onInput);
    });
    root.addEventListener('click', function (e) {
      var f = e.target.closest('[data-font]');
      if (f) { setFont(f.getAttribute('data-font')); rewrite(); return; }
      var m = e.target.closest('[data-metal]');
      if (m) { setMetal(m.getAttribute('data-metal')); rewrite(); }
    });
  }

  /* ---------- newsletter ---------- */
  var news = document.getElementById('lx-news');
  if (news) {
    news.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = news.querySelector('input[type="email"]');
      var msg = document.getElementById('lx-news-msg');
      var ok = input && input.value && input.checkValidity();
      if (msg) msg.textContent = ok ? 'Thank you — you are on the list.' : 'Please enter a valid email address.';
      if (ok) input.value = '';
      else if (input) input.focus();
    });
  }

  setTimeout(observeReveals, 80);
})();
