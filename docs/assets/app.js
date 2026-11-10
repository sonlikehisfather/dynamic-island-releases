/* Dynamic Island — site. Aucun framework, aucune requête externe, rien n'est envoyé nulle part. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  { const only = new URLSearchParams(location.search).get('only'); if (only) document.querySelectorAll('main > *').forEach(el => { if (el.id !== only) el.style.display = 'none'; }); }   // (test des captures)
  { const go = new URLSearchParams(location.search).get('go'); if (go) addEventListener('load', () => setTimeout(() => document.getElementById(go)?.scrollIntoView(), 80)); }   // (test des captures)
  // mode de test (captures d'écran) : ?nt=1 coupe les transitions pour voir l'état final tout de suite
  if (new URLSearchParams(location.search).has('nt')) document.documentElement.classList.add('notrans');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ───── Apparition au défilement ───── */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));

  /* ───── Lueur qui suit la souris sur les cartes ───── */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ═════ L'île de navigation ═════ */
  const isle = $('#isle'), isleBtn = $('#isleBtn'), isleLbl = $('#isleLbl');
  if (isle && isleBtn) {
    const setOpen = o => { isle.classList.toggle('open', o); isleBtn.setAttribute('aria-expanded', String(o)); };
    isleBtn.addEventListener('click', () => setOpen(!isle.classList.contains('open')));
    if (hover) { isle.addEventListener('pointerenter', () => setOpen(true)); isle.addEventListener('pointerleave', () => setOpen(false)); }
    isle.addEventListener('focusin', () => setOpen(true));
    addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('pointerdown', e => { if (!isle.contains(e.target)) setOpen(false); });
    $$('a', isle).forEach(a => a.addEventListener('click', () => setOpen(false)));

    // le texte de l'île suit la section affichée (comme une « activité en direct »)
    let current = '';
    const label = txt => {
      if (!txt || txt === current) return; current = txt;
      isleLbl.classList.add('swap');
      setTimeout(() => { isleLbl.textContent = txt; isleLbl.classList.remove('swap'); }, 170);
    };
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) label(e.target.dataset.label); }), { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-label]').forEach(s => so.observe(s));
  }

  /* ═════ L'île du héros : états qui se transforment ═════ */
  const big = $('#big');
  if (big) {
    const halo = $('#halo');
    const ST = [
      { w: 440, h: 84, r: 42, c1: '#bf5af2', c2: '#ff375f' },
      { w: 600, h: 196, r: 46, c1: '#0a84ff', c2: '#64d2ff' },
      { w: 660, h: 108, r: 50, c1: '#30d158', c2: '#ffd60a' },
      { w: 430, h: 84, r: 42, c1: '#64d2ff', c2: '#0a84ff' },
      { w: 430, h: 84, r: 42, c1: '#30d158', c2: '#64d2ff' },
    ];
    const views = $$('.v', big), chips = $$('#states button');
    let cur = -1, timer = null;
    const show = i => {
      cur = i; const s = ST[i];
      big.style.width = Math.min(s.w, innerWidth - 32) + 'px'; big.style.height = s.h + 'px'; big.style.borderRadius = s.r + 'px';
      big.style.setProperty('--c1', s.c1); big.style.setProperty('--c2', s.c2);
      halo.style.setProperty('--c1', s.c1); halo.style.setProperty('--c2', s.c2);
      views.forEach(v => v.classList.toggle('on', +v.dataset.s === i));
      chips.forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      halo.classList.remove('pulse'); void halo.offsetWidth; halo.classList.add('pulse');
    };
    const start = () => { if (reduce) return; stop(); timer = setInterval(() => show((cur + 1) % ST.length), 3800); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    chips.forEach(b => b.addEventListener('click', () => { stop(); show(+b.dataset.i); }));
    const q = new URLSearchParams(location.search).get('s');
    show(q !== null && ST[+q] ? +q : 0); if (q === null) start();
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => show(cur), 120); });

    // chiffres qui bougent doucement
    const walk = (v, a, b, step) => clamp(v + rnd(-step, step), a, b);
    let cpu = 36, gpu = 71, ram = 48, ping = 12;
    const upd = () => {
      cpu = walk(cpu, 18, 64, 6); gpu = walk(gpu, 52, 92, 5); ram = walk(ram, 44, 56, 1.2); ping = Math.round(walk(ping, 9, 19, 2));
      const set = (id, t, bar, p) => { $('#' + id).textContent = t; if (bar) $('#' + bar).style.width = p + '%'; };
      set('hCpu', Math.round(cpu) + ' %', 'hCpuB', cpu); set('hGpu', Math.round(gpu) + ' %', 'hGpuB', gpu); set('hRam', Math.round(ram) + ' %', 'hRamB', ram); set('hPing', ping + ' ms');
      // carte « stats »
      const bars = $$('#bars .br');
      [[cpu, '%'], [gpu, '%'], [ram, '%'], [ping, ' ms']].forEach(([v, u], i) => {
        const row = bars[i]; if (!row) return; const val = Math.round(v);
        $('i', row).style.width = (u === '%' ? val : val * 3.6) + '%'; $('b', row).textContent = val + (u === '%' ? ' %' : ' ms');
      });
    };
    if (!reduce) setInterval(upd, 1300);
  }

  /* ═════ Carte « halo » : changer de morceau ═════ */
  const mini = $('#mini');
  if (mini) {
    const T = [
      ['Minuit Ardent', 'Nova', '#bf5af2', '#ff375f', '#ff9f0a'],
      ['Cascade', 'Lumen', '#0a84ff', '#64d2ff', '#30d158'],
      ['Pulse 98', 'Orbita', '#30d158', '#ffd60a', '#ff9f0a'],
      ['Sable', 'Kōri', '#ff9f0a', '#ff375f', '#bf5af2'],
    ];
    let k = 0;
    const apply = () => {
      const [t, a, c1, c2, c3] = T[k];
      $('#miniT').textContent = t; $('#miniA').textContent = a;
      const art = $('#miniArt'); art.style.setProperty('--a1', c1); art.style.setProperty('--a2', c2); art.style.setProperty('--a3', c3);
      mini.style.setProperty('--c1', c1); mini.style.setProperty('--c2', c2);
      mini.classList.remove('flash'); void mini.offsetWidth; mini.classList.add('flash');
    };
    $('#next').addEventListener('click', () => { k = (k + 1) % T.length; apply(); });
  }

  /* ═════ Réticule interactif ═════ */
  const xh = $('#xh'), scene = $('#scene');
  if (xh && scene) {
    const look = { style: 'Croix + point', color: '#30d158', size: 46, th: 3, gap: 7, outline: true };
    const COLORS = ['#30d158', '#ff453a', '#ffd60a', '#64d2ff', '#0a84ff', '#bf5af2', '#ff375f', '#ff9f0a', '#ffffff'];
    const draw = () => {
      const { style, color, size, th, gap, outline } = look; const box = size + th * 2 + 8, c = box / 2, half = size / 2, g = Math.min(gap, half);
      xh.setAttribute('viewBox', `0 0 ${box} ${box}`); xh.setAttribute('width', box); xh.setAttribute('height', box);
      let h = '';
      const seg = (x1, y1, x2, y2) => {
        if (outline) h += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0,0,0,.88)" stroke-width="${th + 2}"/>`;
        h += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${th}"/>`;
      };
      const dot = r => { if (outline) h += `<circle cx="${c}" cy="${c}" r="${r + 1}" fill="rgba(0,0,0,.88)"/>`; h += `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}"/>`; };
      const ring = () => { if (outline) h += `<circle cx="${c}" cy="${c}" r="${half}" fill="none" stroke="rgba(0,0,0,.88)" stroke-width="${th + 2}"/>`; h += `<circle cx="${c}" cy="${c}" r="${half}" fill="none" stroke="${color}" stroke-width="${th}"/>`; };
      const cross = top => { seg(c - half, c, c - g, c); seg(c + g, c, c + half, c); if (top) seg(c, c - half, c, c - g); seg(c, c + g, c, c + half); };
      switch (style) {
        case 'Point': dot(Math.max(th, size / 6)); break;
        case 'Cercle': ring(); break;
        case 'Cercle + point': ring(); dot(Math.max(th, 2)); break;
        case 'Croix': cross(true); break;
        case 'T': cross(false); break;
        default: cross(true); dot(Math.max(th * .8, 1.5));
      }
      xh.innerHTML = h;
    };
    draw();
    const sw = $('#xSw');
    COLORS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw' + (i === 0 ? ' on' : ''); b.style.background = c; b.setAttribute('aria-label', 'Couleur ' + c);
      b.onclick = () => { look.color = c; $$('.sw', sw).forEach(x => x.classList.toggle('on', x === b)); draw(); }; sw.appendChild(b); });
    $$('.pill[data-st]').forEach(p => p.addEventListener('click', () => { look.style = p.dataset.st; $$('.pill[data-st]').forEach(x => x.classList.toggle('on', x === p)); $$('.pill[data-pf]').forEach(x => x.classList.remove('on')); draw(); }));
    $('#xSize').addEventListener('input', e => { look.size = +e.target.value; draw(); });
    const PF = [
      { style: 'Croix', color: '#30d158', size: 34, th: 2, gap: 8 }, { style: 'Cercle + point', color: '#ff375f', size: 56, th: 3, gap: 7 }, { style: 'T', color: '#64d2ff', size: 44, th: 3, gap: 6 },
    ];
    $$('.pill[data-pf]').forEach(p => p.addEventListener('click', () => {
      Object.assign(look, PF[+p.dataset.pf]); $$('.pill[data-pf]').forEach(x => x.classList.toggle('on', x === p)); $$('.pill[data-st]').forEach(x => x.classList.toggle('on', x.dataset.st === look.style));
      $$('.sw').forEach((b, i) => b.classList.toggle('on', COLORS[i] === look.color)); $('#xSize').value = look.size; draw();
    }));
    const move = e => { const r = scene.getBoundingClientRect(); xh.style.left = clamp(e.clientX - r.left, 0, r.width) + 'px'; xh.style.top = clamp(e.clientY - r.top, 0, r.height) + 'px'; };
    scene.addEventListener('pointermove', move); scene.addEventListener('pointerdown', move);
    scene.addEventListener('pointerleave', () => { xh.style.left = '50%'; xh.style.top = '50%'; });
    const hint = $('.hint', scene); scene.addEventListener('pointermove', () => { if (hint) hint.style.opacity = 0; }, { once: true });
  }

  /* ═════ FPS animé ═════ */
  const spark = $('#spark');
  if (spark) {
    const ctx = spark.getContext('2d'), N = 48, data = Array.from({ length: N }, () => 238 + rnd(-10, 10));
    let fps = 238;
    const render = () => {
      const w = spark.width, h = spark.height; ctx.clearRect(0, 0, w, h);
      const min = 200, max = 270, X = i => i * w / (N - 1), Y = v => h - 6 - (clamp(v, min, max) - min) / (max - min) * (h - 14);
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(48,209,88,.40)'); g.addColorStop(1, 'rgba(48,209,88,0)');
      ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); ctx.strokeStyle = '#30d158'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    };
    const tick = () => {
      fps = clamp(fps + rnd(-9, 9) + (238 - fps) * .12, 205, 262); data.push(fps); data.shift();
      $('#fps').textContent = Math.round(fps); $('#ft').textContent = (1000 / fps).toFixed(1).replace('.', ',') + ' ms';
      $('#low').textContent = Math.round(fps * .79); $('#gpuT').textContent = Math.round(62 + (fps - 238) * .12 + rnd(0, 3)) + ' °C'; $('#pg').textContent = Math.round(rnd(10, 15)) + ' ms'; render();
    };
    render(); if (!reduce) setInterval(tick, 480);
  }

  /* ═════ Replay ═════ */
  const save = $('#save');
  if (save) {
    const track = $('#track'), toast = $('#toast'); let busy = false;
    save.addEventListener('click', async () => {
      if (busy) return; busy = true; track.classList.add('saved'); toast.classList.add('on');
      await sleep(2800); toast.classList.remove('on'); await sleep(2200); track.classList.remove('saved'); busy = false;
    });
  }

  /* ═════ Assistant IA : conversation qui s'écrit ═════ */
  const chat = $('#chat');
  if (chat) {
    const SCRIPT = [
      ['Pourquoi mon PC chauffe en jeu ?', 'Ta carte graphique monte à 64 °C en pointe : c\'est normal sous charge. Rien d\'inquiétant, tes ventilateurs font leur travail 👍'],
      ['Mes FPS ont baissé hier ?', 'Oui : 2 épisodes de saccades sur ton jeu préféré. Je te conseille de baisser un peu les ombres.'],
      ['Mets une playlist calme', 'Je ne pilote pas ta musique, mais ton lecteur est prêt : le bouton lecture de l\'île suffit 😉'],
    ];
    const bubble = (cls, text) => { const d = document.createElement('div'); d.className = 'bub ' + cls; d.textContent = text; chat.appendChild(d); requestAnimationFrame(() => d.classList.add('on')); return d; };
    const typeInto = async (el, text) => { el.classList.add('caret'); for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(rnd(14, 34)); } el.classList.remove('caret'); };
    if (reduce) { bubble('me', SCRIPT[0][0]); bubble('ai', SCRIPT[0][1]); }
    else {
      let alive = false;
      const run = async () => {
        if (alive) return; alive = true; let i = 0;
        for (;;) {
          chat.innerHTML = ''; const [q, a] = SCRIPT[i % SCRIPT.length]; i++;
          const me = bubble('me', ''); await sleep(250); await typeInto(me, q); await sleep(500);
          const ai = bubble('ai', ''); await sleep(250); await typeInto(ai, a); await sleep(3800);
        }
      };
      new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .3 }).observe(chat);
    }
  }

  /* ═════ Capture qui s'incline ═════ */
  const tilt = $('#tilt');
  if (tilt && hover && !reduce) {
    const img = $('img', tilt);
    tilt.addEventListener('pointermove', e => { const r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; img.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.015)`; });
    tilt.addEventListener('pointerleave', () => { img.style.transform = ''; });
  }

  /* ═════ Couleur du site ═════ */
  const pSw = $('#pSw');
  if (pSw) {
    const P = [['#30d158', 'Vert'], ['#0a84ff', 'Bleu'], ['#64d2ff', 'Cyan'], ['#bf5af2', 'Violet'], ['#ff375f', 'Rose'], ['#ff9f0a', 'Orange']];
    P.forEach(([c, n], i) => { const b = document.createElement('button'); b.className = 'sw' + (i === 0 ? ' on' : ''); b.style.background = c; b.setAttribute('aria-label', n);
      b.onclick = () => { document.documentElement.style.setProperty('--acc', c); $$('.sw', pSw).forEach(x => x.classList.toggle('on', x === b)); }; pSw.appendChild(b); });
  }

  /* ═════ Galerie ═════ */
  const gal = $('#gal');
  if (gal) {
    const step = () => (gal.querySelector('figure')?.getBoundingClientRect().width || 600) + 22;
    $('#gPrev').addEventListener('click', () => gal.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#gNext').addEventListener('click', () => gal.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* ═════ Chiffres qui comptent ═════ */
  $$('.num b').forEach(b => {
    const to = +b.dataset.n; if (reduce || to === 0) { b.textContent = to; return; }
    new IntersectionObserver((es, o) => { if (!es[0].isIntersecting) return; o.disconnect();
      const t0 = performance.now(), d = 1300; const f = t => { const p = Math.min(1, (t - t0) / d); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, { threshold: .6 }).observe(b);
  });

  /* ═════ Version ordinateur ═════ */
  if (matchMedia('(min-width: 1100px)').matches) {
    // 1) lueur qui suit le curseur
    const spot = $('#spot');
    if (spot && hover && !reduce) {
      let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
      addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      const loop = () => { x += (tx - x) * .08; y += (ty - y) * .08; spot.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); };
      loop();
    }
    // 2) l'écran de PC s'incline avec la souris
    const wrap = $('#monWrap'), mon = wrap && $('.monitor', wrap);
    if (mon && hover && !reduce) {
      const base = { ry: -8, rx: 3 };
      wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        mon.style.transform = `rotateY(${base.ry + x * 9}deg) rotateX(${base.rx - y * 8}deg)`; });
      wrap.addEventListener('pointerleave', () => { mon.style.transform = ''; });
    }
    // 3) « Ce qu'elle fait » : le visuel suit l'étape affichée
    const steps = $$('.story-step'), vis = $$('.sv');
    if (steps.length) {
      const set = k => { steps.forEach(s => s.classList.toggle('on', s.dataset.k === k)); vis.forEach(v => v.classList.toggle('on', v.dataset.k === k)); };
      const so2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(e.target.dataset.k); }), { rootMargin: '-48% 0px -48% 0px' });
      steps.forEach(s => so2.observe(s));
      const kk = new URLSearchParams(location.search).get('k'); if (kk !== null) set(kk);   // (test des captures)
    }
  }
})();
