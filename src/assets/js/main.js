/* Mastercraft Engineers — interaction layer. No dependencies.
   Everything here is progressive enhancement: the pages are complete without it. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('.reveal, .reveal-mask, [data-envelopes], [data-ruler], [data-wchart], [data-anatomy]');
  // Anything already in the first viewport is shown immediately, so nothing flashes.
  revealEls.forEach(function (el) {
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
    if (open) { var first = $('a', nav); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    mq.addEventListener('change', function () { setMenu(false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && mq.matches) setMenu(false); });
    // keep keyboard focus inside the open mobile menu
    header.addEventListener('keydown', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button', header).filter(function (n) { return n.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  // desktop dropdown (disclosure button; hover/focus also handled in CSS)
  $$('.has-sub').forEach(function (li) {
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

  /* ---------- count-up for published numbers (text is already final in HTML) ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(to) || reduce.matches) return;
    var t0 = null, dur = 1200;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(to);
    }
    requestAnimationFrame(step);
  }
  if (hasIO && !reduce.matches) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { $$('[data-count-to]', e.target).forEach(countUp); cio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    $$('[data-ruler]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- hero parallax: one rAF loop, only while the hero is on screen ---------- */
  var par = $$('[data-parallax]');
  if (par.length && hasIO && !reduce.matches) {
    var hero = $('.hero'), vis = true, ticking = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) onScroll(); }).observe(hero);
    var apply = function () {
      ticking = false;
      if (mq.matches) { par.forEach(function (el) { el.style.transform = ''; }); return; }
      var y = Math.min(window.scrollY, 900);
      par.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-parallax')) * -1).toFixed(1) + 'px,0)'; });
    };
    var onScroll = function () { if (vis && !ticking) { ticking = true; requestAnimationFrame(apply); } };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- process: highlight the active stage, draw the route ---------- */
  var steps = $$('[data-step]');
  if (steps.length) {
    var nodes = $$('[data-node]'), links = $$('[data-stage-link]'), prog = $('#route-prog');
    var active = -1;
    var setActive = function (i) {
      if (i === active) return; active = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      nodes.forEach(function (n, k) { n.classList.toggle('is-on', k === i); n.classList.toggle('is-done', k < i); });
      links.forEach(function (l, k) { l.classList.toggle('is-on', k === i); if (k === i) l.setAttribute('aria-current', 'step'); else l.removeAttribute('aria-current'); });
      if (prog) prog.style.setProperty('--p', String(i / (steps.length - 1)));
    };
    var section = $('#process'), inView = false, tick2 = false;
    var measure = function () {
      tick2 = false;
      var mid = window.innerHeight * 0.5, best = 0, bestD = 1e9;
      steps.forEach(function (s, k) { var r = s.getBoundingClientRect(); var c = (r.top + r.bottom) / 2; var d = Math.abs(c - mid); if (r.top < mid && r.bottom > mid) d = -1; if (d < bestD) { bestD = d; best = k; } });
      setActive(best);
    };
    var req = function () { if (inView && !tick2) { tick2 = true; requestAnimationFrame(measure); } };
    if (hasIO) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) req(); }, { rootMargin: '10% 0px' }).observe(section);
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
    }
    setActive(0);
  }

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
    function show(field, text) {
      var el = form.elements[field], p = doc.getElementById(errId[field]);
      if (!el || !p) return;
      p.textContent = text; p.hidden = !text;
      if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
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
      submit.disabled = true; var label = submit.firstChild.textContent; submit.firstChild.textContent = 'Sending… ';
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
        .then(function () { submit.disabled = false; submit.firstChild.textContent = label; });
    });
  }
})();
