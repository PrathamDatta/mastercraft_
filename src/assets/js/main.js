/* Mastercraft Engineers — interaction layer. No dependencies.
   Everything here is progressive enhancement: the pages are complete without it.
   Effects are skipped under prefers-reduced-motion, and pointer effects only run for a real mouse. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var desktop = window.matchMedia('(min-width: 960px)');
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var motion = !reduce.matches;

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('.reveal, .reveal-mask, [data-envelopes], [data-ruler], [data-wchart], [data-anatomy]');
  revealEls.forEach(function (el) { // anything already in the first viewport is shown immediately: no flash
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('in');
  });
  root.classList.add('js-ready');
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- navigation ---------- */
  var header = $('[data-header]');
  var toggle = $('.menu-toggle');
  var nav = $('#primary-nav');
  var mq = window.matchMedia('(max-width: 959.98px)');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('nav-open', open);
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Close' : 'Menu';
    if (open) { header.classList.remove('is-hidden'); var first = $('a', nav); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    mq.addEventListener('change', function () { setMenu(false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && mq.matches) setMenu(false); });
    header.addEventListener('keydown', function (e) { // keep keyboard focus inside the open mobile menu
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button', header).filter(function (n) { return n.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  $$('.has-sub').forEach(function (li) { // desktop dropdown: disclosure button (hover/focus also handled in CSS)
    var btn = $('.sub-toggle', li);
    if (!btn) return;
    function close() { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
    });
    li.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); btn.focus(); } });
    doc.addEventListener('click', function (e) { if (!li.contains(e.target)) close(); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) close(); });
  });

  /* ---------- one scroll hub: a single passive listener, one rAF per frame ---------- */
  var tasks = [], ticking = false;
  function frame() { ticking = false; var y = window.scrollY, vh = window.innerHeight; for (var i = 0; i < tasks.length; i++) tasks[i](y, vh); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // scroll progress bar
  var bar = $('[data-progress]');
  if (bar) tasks.push(function (y, vh) { var h = doc.documentElement.scrollHeight - vh; bar.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0); });

  // header: solid once scrolled, tucks away on scroll down, returns on scroll up
  if (header) {
    var lastY = window.scrollY;
    tasks.push(function (y) {
      header.classList.toggle('is-stuck', y > 24);
      var menuOpen = doc.body.classList.contains('nav-open');
      if (!menuOpen && y > 500 && y > lastY + 6) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= 500) header.classList.remove('is-hidden');
      lastY = y;
    });
  }

  if (motion) {
    // giant tagline rows slide sideways as they cross the viewport
    var kin = $$('[data-kinetic]');
    if (kin.length) tasks.push(function (y, vh) {
      kin.forEach(function (row) {
        var r = row.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) return;
        var p = (vh - r.top) / (vh + r.height);
        row.style.transform = 'translate3d(' + ((p - 0.5) * 520 * parseFloat(row.getAttribute('data-kinetic'))).toFixed(1) + 'px,0,0)';
      });
    });
    // gentle image parallax inside masked frames
    var par = $$('[data-parallax-y]');
    if (par.length) tasks.push(function (y, vh) {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        var img = $('img', el); if (!img) return;
        var p = (vh - r.top) / (vh + r.height) - 0.5;
        img.style.transform = 'translate3d(0,' + (p * parseFloat(el.getAttribute('data-parallax-y'))).toFixed(1) + 'px,0)';
      });
    });
    // big outlined year fills with orange as the section scrolls in
    var fill = $$('[data-fill]');
    if (fill.length) tasks.push(function (y, vh) {
      fill.forEach(function (el) { var r = el.getBoundingClientRect(); el.style.setProperty('--fill', (clamp((vh * 0.95 - r.top) / (vh * 0.9), 0, 1) * 100).toFixed(1) + '%'); });
    });
    // process deck: cards sink and dim as the next one stacks over them
    var cards = $$('[data-card]');
    if (cards.length) tasks.push(function (y, vh) {
      var on = desktop.matches && vh > 640;
      cards.forEach(function (c, i) {
        var d = 0;
        if (on && cards[i + 1]) {
          var top = c.getBoundingClientRect().top, nextTop = cards[i + 1].getBoundingClientRect().top;
          d = clamp(1 - (nextTop - top - 16) / (vh * 0.7), 0, 1);
        }
        c.style.setProperty('--d', d.toFixed(3));
      });
    });
  }
  onScroll();

  /* ---------- counters (final value is already in the HTML) ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count-to')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(to) || !motion) return;
    var t0 = null, dur = 1500;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
    }
    requestAnimationFrame(step);
  }
  if (hasIO && motion) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { $$('[data-count-to]', e.target).forEach(countUp); cio.unobserve(e.target); } });
    }, { threshold: 0.35 });
    $$('.stats, [data-ruler]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- pause looping animations while off-screen ---------- */
  if (hasIO) {
    var offio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target.classList.contains('hero')) e.target.classList.toggle('is-off', !e.isIntersecting);
        else e.target.classList.toggle('is-paused', !e.isIntersecting);
      });
    });
    $$('.hero, .marquee').forEach(function (el) { offio.observe(el); });
  }

  /* ---------- hero: colour spotlight follows the pointer (drifts on its own otherwise) ---------- */
  var hero = $('[data-hero]');
  if (hero && motion) {
    var tx = 0.66, ty = 0.46, cx = tx, cy = ty, lastMove = -1e9, heroVis = true, raf = 0, frameN = 0, t0 = performance.now();
    var chips = $$('.chip', hero).map(function (c) { return { el: c, d: parseFloat(c.getAttribute('data-depth') || '0.5') }; });
    var heroTick = function (now) {
      raf = 0; if (!heroVis) return;
      var idle = now - lastMove > 2500;
      if (idle) { var t = (now - t0) / 1000; tx = 0.64 + Math.cos(t * 0.45) * 0.17; ty = 0.46 + Math.sin(t * 0.6) * 0.13; }
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      if (!idle || (++frameN & 1)) { // idle drift updates at half rate to keep it cheap
        hero.style.setProperty('--mx', (cx * 100).toFixed(1) + '%'); hero.style.setProperty('--my', (cy * 100).toFixed(1) + '%');
        chips.forEach(function (c) { c.el.style.transform = 'translate3d(' + ((cx - 0.5) * -c.d * 60).toFixed(1) + 'px,' + ((cy - 0.5) * -c.d * 40).toFixed(1) + 'px,0)'; });
      }
      raf = requestAnimationFrame(heroTick);
    };
    var heroStart = function () { if (!raf && heroVis) raf = requestAnimationFrame(heroTick); };
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; lastMove = performance.now();
    });
    if (hasIO) new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; if (heroVis) heroStart(); }).observe(hero);
    heroStart();
  }

  /* ---------- pointer effects (mouse only) ---------- */
  if (fine.matches && motion) {
    // 3D tilt with moving glare
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg'); el.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    // magnetic buttons
    $$('.magnetic').forEach(function (el) {
      var kids = Array.prototype.slice.call(el.children);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.32).toFixed(1) + 'px)';
        kids.forEach(function (k) { k.style.transform = 'translate(' + (dx * 0.1).toFixed(1) + 'px,' + (dy * 0.16).toFixed(1) + 'px)'; });
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; kids.forEach(function (k) { k.style.transform = ''; }); });
    });
    // cursor ring (the native cursor stays visible; this is an accent)
    var cur = $('[data-cursor]');
    if (cur) {
      root.classList.add('has-cursor');
      var label = $('.cursor__label', cur), px = -100, py = -100, ox = -100, oy = -100, craf = 0;
      var move = function () { ox += (px - ox) * 0.2; oy += (py - oy) * 0.2; cur.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)'; craf = (Math.abs(px - ox) + Math.abs(py - oy) > 0.4) ? requestAnimationFrame(move) : 0; };
      window.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; px = e.clientX; py = e.clientY; cur.classList.add('is-on'); if (!craf) craf = requestAnimationFrame(move); }, { passive: true });
      doc.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
      doc.addEventListener('pointerover', function (e) {
        var lab = e.target.closest && e.target.closest('[data-cursor-label]');
        if (lab) { label.textContent = lab.getAttribute('data-cursor-label'); cur.classList.add('has-label'); cur.classList.remove('is-link'); return; }
        cur.classList.remove('has-label');
        cur.classList.toggle('is-link', !!(e.target.closest && e.target.closest('a, button, summary, input, select, textarea, label')));
      });
    }
  }

  /* ---------- product rail: buttons, progress, mouse drag ---------- */
  $$('[data-rail]').forEach(function (rail) {
    var sec = rail.closest('section'), barEl = $('[data-rail-bar]', sec), prev = $('[data-rail-prev]', sec), next = $('[data-rail-next]', sec);
    function upd() {
      var sw = rail.scrollWidth, cw = rail.clientWidth;
      if (barEl) { barEl.style.setProperty('--w', (cw / sw * 100).toFixed(1) + '%'); barEl.style.setProperty('--x', (rail.scrollLeft / sw * 100).toFixed(2)); }
    }
    function by(dir) { var c = $('.pcard', rail); var step = c ? c.getBoundingClientRect().width + 24 : 400; rail.scrollBy({ left: dir * step, behavior: motion ? 'smooth' : 'auto' }); }
    if (prev) prev.addEventListener('click', function () { by(-1); });
    if (next) next.addEventListener('click', function () { by(1); });
    rail.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    var down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6) { rail.style.scrollSnapType = 'none'; rail.scrollLeft = sl - dx; } });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; rail.style.scrollSnapType = ''; });
    rail.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
  });

  /* ---------- mould anatomy hotspots ---------- */
  $$('[data-anatomy]').forEach(function (fig) {
    var spots = $$('[data-spot]', fig), rects = $$('[data-rect]', fig);
    var items = $$('[data-item]', fig.closest('.anatomy__layout'));
    var cur = null;
    function select(id) {
      cur = (cur === id) ? null : id;
      spots.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-spot') === cur)); });
      rects.forEach(function (r) { r.classList.toggle('is-on', r.getAttribute('data-rect') === cur); });
      items.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-item') === cur); });
    }
    spots.forEach(function (b) { b.hidden = false; b.addEventListener('click', function () { select(b.getAttribute('data-spot')); }); });
    items.forEach(function (li) { li.addEventListener('click', function () { select(li.getAttribute('data-item')); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) select(cur); });
  });

  /* ---------- machine envelope diagram ---------- */
  $$('[data-envelopes]').forEach(function (fig) {
    var envs = $$('[data-env]', fig), btns = $$('[data-env-btn]', fig);
    envs.forEach(function (g, k) { g.style.setProperty('--k', String(k)); });
    function on(id) {
      envs.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-env') === id); });
      btns.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-env-btn') === id); });
    }
    btns.forEach(function (b) {
      var id = b.getAttribute('data-env-btn');
      b.addEventListener('mouseenter', function () { on(id); });
      b.addEventListener('focus', function () { on(id); });
      b.addEventListener('click', function () { on(id); });
      b.addEventListener('mouseleave', function () { on(null); });
      b.addEventListener('blur', function () { on(null); });
    });
  });

  /* ---------- video facade: load YouTube (privacy-enhanced) only on request ---------- */
  $$('[data-video]').forEach(function (box) {
    var btn = $('.video__play', box);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-video') + '?autoplay=1&rel=0';
      f.title = 'Mastercraft Engineers corporate video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.replaceChild(f, btn);
      f.focus();
    });
  });

  /* ---------- enquiry form ---------- */
  var form = $('[data-enquiry-form]');
  if (form) {
    var status = $('[data-status]', form), submit = $('[data-submit]', form);
    var started = $('[data-started]', form); if (started) started.value = String(Date.now());
    var params = new URLSearchParams(location.search);
    var ref = params.get('ref');
    var msg = form.elements.message;
    if (ref && msg && !msg.value) msg.value = 'Enquiry about: ' + ref.slice(0, 120) + '\n\n';
    if (params.get('error')) { status.textContent = 'We could not send your enquiry. Please check the details and try again, or email info@mcraft.net.'; status.className = 'form__status is-err'; }
    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please enter your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      company: function (v) { return v.trim() ? '' : 'Please enter your company name.'; },
      phone: function (v) { return !v.trim() || /^[0-9+()\-\s.]{6,40}$/.test(v.trim()) ? '' : 'Please enter a valid phone number, or leave it blank.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Please describe your requirement (at least a sentence).'; }
    };
    var errId = { name: 'e-name', email: 'e-email', company: 'e-company', phone: 'e-phone', message: 'e-msg' };
    var show = function (field, text) {
      var el = form.elements[field], p = doc.getElementById(errId[field]);
      if (!el || !p) return;
      p.textContent = text; p.hidden = !text;
      if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    };
    Object.keys(rules).forEach(function (f) {
      var el = form.elements[f];
      el.addEventListener('blur', function () { if (el.value.trim()) show(f, rules[f](el.value)); }); // empty required fields are reported on submit
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) show(f, rules[f](el.value)); });
    });
    // pressing Submit must not blur a field first: its error message would shift the button out from under the pointer
    submit.addEventListener('mousedown', function (e) { e.preventDefault(); });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      Object.keys(rules).forEach(function (f) { var t = rules[f](form.elements[f].value); show(f, t); if (t && !firstBad) firstBad = form.elements[f]; });
      if (firstBad) {
        e.preventDefault();
        status.className = 'form__status is-err'; status.textContent = 'Please correct the highlighted fields.';
        firstBad.focus(); return;
      }
      if (!window.fetch) return; // fall back to normal POST
      e.preventDefault();
      submit.disabled = true; var labelEl = $('span', submit) || submit.firstChild; var label = labelEl.textContent; labelEl.textContent = 'Sending… ';
      status.className = 'form__status'; status.textContent = 'Sending your enquiry…';
      fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.className = 'form__status is-ok'; status.textContent = 'Thank you. Your enquiry has been sent and the team will reply by email.';
            status.setAttribute('tabindex', '-1'); status.focus();
            if (started) started.value = String(Date.now());
          } else {
            var errs = (res.j && res.j.errors) || {};
            var any = false;
            Object.keys(errs).forEach(function (k) { if (errId[k]) { show(k, errs[k]); any = true; } });
            status.className = 'form__status is-err';
            status.textContent = errs.form || (any ? 'Please correct the highlighted fields.' : 'We could not send your enquiry. Please email info@mcraft.net or call +91-80-27839712.');
          }
        })
        .catch(function () {
          status.className = 'form__status is-err';
          status.textContent = 'We could not reach the server. Please email info@mcraft.net or call +91-80-27839712.';
        })
        .then(function () { submit.disabled = false; labelEl.textContent = label; });
    });
  }
})();
