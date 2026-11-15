/* Dynamic Island — effets du site « Aurora ». Vanilla JS, aucune dépendance. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  root.classList.add('js');

  /* ───── Navigation : flou au défilement, menu mobile ───── */
  const nav = $('.nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => { ticking = false; nav.classList.toggle('scrolled', scrollY > 8 || nav.dataset.solid === '1'); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();
    const bt = $('.burger', nav);
    if (bt) {
      const set = o => { nav.classList.toggle('open', o); bt.setAttribute('aria-expanded', o); };
      bt.addEventListener('click', () => set(!nav.classList.contains('open')));
      $$('ul a', nav).forEach(a => a.addEventListener('click', () => set(false)));
      addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    }
  }

  /* ───── Apparition en cascade ───── */
  const REV = '.rv, .tile, .fcard, .fact, .mini, .plan';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  const watch = () => $$(REV).forEach(el => {
    if (el.dataset.w) return; el.dataset.w = 1;
    const sib = [...el.parentElement.children].filter(c => c.matches(REV));
    if (!el.matches('.d1,.d2,.d3') && sib.length > 1) el.style.setProperty('--dl', Math.min(sib.indexOf(el), 6) * .07 + 's');
    calm ? el.classList.add('in') : io.observe(el);
  });
  watch();

  /* ───── Texte qui s'allume mot après mot ───── */
  const story = $('.story');
  if (story && !calm) {
    story.innerHTML = story.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
    const words = $$('span', story); let last = -1, t = false;
    const lit = () => {
      t = false;
      const r = story.getBoundingClientRect(), vh = innerHeight;
      const n = Math.round(Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35))) * words.length);
      if (n !== last) { words.forEach((w, i) => w.classList.toggle('on', i < n)); last = n; }
    };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(lit); } }, { passive: true }); lit();
  }

  /* ───── L'île du héros : repos → compacte → lecture en cours → notification ───── */
  const isl = $('#island'), tabs = $$('#tabs button');
  if (isl) {
    const STEPS = [0, 1, 2, 1, 3], HOLD = { 0: 1800, 1: 1700, 2: 4200, 3: 3000 };
    const set = s => {
      isl.dataset.s = s;
      $$('.st', isl).forEach((d, k) => d.classList.toggle('on', k === s));
      tabs.forEach((b, k) => b.setAttribute('aria-selected', k === s));
    };
    let i = 0, timer = 0;
    const next = () => { set(STEPS[i]); timer = setTimeout(() => { i = (i + 1) % STEPS.length; next(); }, HOLD[STEPS[i]]); };
    tabs.forEach((b, k) => b.addEventListener('click', () => { clearTimeout(timer); set(k); if (!calm) timer = setTimeout(() => { i = (STEPS.indexOf(k) + 1) % STEPS.length; next(); }, 6000); }));
    if (calm) set(2); else { set(0); timer = setTimeout(next, 700); }
    // en pause quand l'onglet est caché
    document.addEventListener('visibilitychange', () => { if (calm) return; clearTimeout(timer); if (!document.hidden) next(); });
  }

  /* ───── Compteurs ───── */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  if (!calm) $$('[data-count]').forEach(el => { el.textContent = '0'; co.observe(el); });

  /* ───── Formule mise en avant (store.js) ───── */
  if (typeof STORE !== 'undefined') STORE.plans.forEach(p => { if (p.featured) { const b = $(`.plan[data-id="${p.id}"]`); if (b) b.classList.add('featured'); } });
  watch();

  /* ───── Lueur qui suit le curseur + inclinaison 3D des captures ───── */
  if (fine && !calm) {
    $$('.tile, .fcard, .plan, .mini, .glass, .cmp, .specs, .try, .fact, .faq details').forEach(el => {
      el.classList.add('spot');
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px'); }, { passive: true });
    });
    $$('.shot, .pt .ph, .tile').forEach(el => {
      el.classList.add('tilt');
      const amt = el.matches('.tile') ? 3 : 6;
      let raf = 0, ev;
      el.addEventListener('pointermove', e => {
        ev = e; if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0; const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
          el.classList.add('mv'); el.style.setProperty('--rx', (-y * amt).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * amt * 1.3).toFixed(2) + 'deg');
        });
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.classList.remove('mv'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ───── Transition de sortie de page ───── */
  if (!calm) document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname) || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault(); root.classList.add('leaving'); setTimeout(() => { location.href = a.href; }, 200);
  });
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving'); });

  /* ───── HUD de jeu : les chiffres vivent ───── */
  const f = $('#hFps');
  if (f && !calm) {
    const r = (a, b) => Math.round(a + Math.random() * (b - a));
    setInterval(() => { if (document.hidden) return; f.textContent = r(228, 247); $('#hCpu').textContent = r(30, 41) + ' %'; $('#hGpu').textContent = r(66, 78) + ' %'; $('#hPing').textContent = r(10, 15) + ' ms'; }, 900);
  }

  /* ───── Démo « Essaie-la » : calculs et conversions ───── */
  const inp = $('#tryIn'), out = $('#tryOut');
  if (inp) {
    const U = { km: ['d', 1000], m: ['d', 1], cm: ['d', .01], mi: ['d', 1609.344], ft: ['d', .3048], kg: ['w', 1], g: ['w', .001], lb: ['w', .45359237], h: ['t', 60], min: ['t', 1], s: ['t', 1 / 60], j: ['t', 1440] };
    const fmt = n => Number.isInteger(n) ? String(n) : String(+n.toFixed(3)).replace('.', ',');
    const calc = q => {
      q = q.trim().toLowerCase().replace(',', '.');
      let m = q.match(/^(-?[\d.]+)\s*°?\s*(f|c)\s+(?:en|to|vers)\s+(f|c)$/);
      if (m && m[2] !== m[3]) { const v = +m[1]; return m[2] === 'f' ? fmt((v - 32) * 5 / 9) + ' °C' : fmt(v * 9 / 5 + 32) + ' °F'; }
      m = q.match(/^(-?[\d.]+)\s*([a-z]+)\s+(?:en|to|vers)\s+([a-z]+)$/);
      if (m && U[m[2]] && U[m[3]] && U[m[2]][0] === U[m[3]][0]) return fmt(+m[1] * U[m[2]][1] / U[m[3]][1]) + ' ' + m[3];
      if (/^[\d+\-*/().^\s%]+$/.test(q)) { try { const v = Function('"use strict";return (' + q.replace(/\^/g, '**') + ')')(); if (isFinite(v)) return fmt(v); } catch (e) {} }
      return 'Je n’ai pas compris';
    };
    const run = () => { out.textContent = calc(inp.value); out.classList.add('pop'); setTimeout(() => out.classList.remove('pop'), 220); };
    $('#tryForm').addEventListener('submit', e => { e.preventDefault(); run(); });
    $('#tryEx').addEventListener('click', e => { if (e.target.tagName === 'BUTTON') { inp.value = e.target.textContent; run(); } });
  }
})();
