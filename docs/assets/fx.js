/* Effets : île compagne à ressort, gouttes (fission), inclinaison 3D, boutons magnétiques, titres lettre par lettre. */
(function () {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (calm) return;

  /* ───── 1. Titres : chaque lettre jaillit avec un ressort ───── */
  $$('h1, .head h2, .phero h1').forEach(h => {
    if (h.dataset.split) return; h.dataset.split = 1;
    let n = 0;
    const walk = node => {
      [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(w => {
            if (/^\s+$/.test(w) || !w) { f.append(w); return; }
            const word = document.createElement('span'); word.className = 'fw';
            [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'fl'; s.textContent = ch; s.style.setProperty('--i', n++); word.append(s); });
            f.append(word);
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(h);
  });
  const lio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('go'); lio.unobserve(e.target); } }), { threshold: .3 });
  $$('[data-split]').forEach(h => lio.observe(h));

  /* ───── 2. Cartes : inclinaison 3D + reflet qui suit le curseur ───── */
  if (fine) {
    $$('.tile, .fcard, .plan, .mini, .pt .ph, .shot').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((.5 - y) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((x - .5) * 11).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    /* ───── 3. Boutons magnétiques ───── */
    $$('.btn, .nav .buy, .tabs button').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ───── 4. L'île compagne : un ressort réel, un contenu par section ───── */
  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  const PAGE_DEFAULT = { index: 'rest', jeux: 'hud', capture: 'rec', optimiseur: 'clean', assistant: 'ai', ile: 'music', musique: 'music', fonctionnalites: 'rest', tarifs: 'price' };
  const SECTION = { top: 'rest', fonctions: 'music', apercu: 'ai', jeux: 'hud', essaie: 'calc', tarifs: 'price', faq: 'help' };
  const SIZE = { rest: [150, 40, 20], music: [300, 54, 27], hud: [310, 54, 27], rec: [190, 44, 22], clean: [320, 54, 27], ai: [330, 54, 27], calc: [230, 48, 24], price: [290, 54, 27], help: [210, 44, 22] };
  const dock = document.createElement('div'); dock.className = 'dock'; dock.setAttribute('aria-hidden', 'true');
  dock.innerHTML = `
    <div class="d-rest"><i class="d-dot"></i></div>
    <div class="d-music"><i class="d-cov"></i><span>Midnight City</span><u class="d-eq"><i></i><i></i><i></i></u></div>
    <div class="d-hud"><span>FPS <b id="dFps">238</b></span><span>CPU <b>34%</b></span><span>PING <b>12</b></span></div>
    <div class="d-rec"><i class="d-red"></i><span>REC <b id="dRec">00:00</b></span></div>
    <div class="d-clean"><span>Nettoyage</span><em><s id="dBar"></s></em><b id="dPct">0%</b></div>
    <div class="d-ai"><span>✦ Assistant</span><u class="d-dots"><i></i><i></i><i></i></u></div>
    <div class="d-calc"><span>12×(3+4) =</span><b>84</b></div>
    <div class="d-price"><span>Essai gratuit</span><b>3 jours</b></div>
    <div class="d-help"><span>Une question ?</span></div>`;
  document.body.append(dock);

  let mode = '', w = 150, h = 40, r = 20, vw = 0, vh = 0, vr = 0, tw = 150, th = 40, tr = 20, raf = 0, last = 0;
  function frame(t) {
    const dt = Math.min(.032, (t - last) / 1000 || .016); last = t;
    // ressort sous-amorti : accélération = raideur * écart - amortissement * vitesse
    const k = 260, c = 17;
    vw += ((tw - w) * k - vw * c) * dt; w += vw * dt;
    vh += ((th - h) * k - vh * c) * dt; h += vh * dt;
    vr += ((tr - r) * k - vr * c) * dt; r += vr * dt;
    dock.style.width = Math.max(30, w) + 'px'; dock.style.height = Math.max(20, h) + 'px'; dock.style.borderRadius = Math.max(8, r) + 'px';
    const still = Math.abs(tw - w) + Math.abs(th - h) + Math.abs(vw) + Math.abs(vh) < .3;
    if (still) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  function setMode(m) {
    if (m === mode || !SIZE[m]) return; mode = m;
    [tw, th, tr] = SIZE[m];
    dock.querySelectorAll('div').forEach(d => d.classList.toggle('on', d.className.split(' ')[0] === 'd-' + m));
    dock.dataset.m = m; dock.classList.remove('pulse'); void dock.offsetWidth; dock.classList.add('pulse');
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  setMode(PAGE_DEFAULT[page] || 'rest');
  // quelle section est au milieu de l'écran ?
  const secs = $$('section[id]').filter(s => SECTION[s.id]);
  if (secs.length) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setMode(SECTION[e.target.id]); }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => so.observe(s));
  }
  // petites vies : FPS, chronomètre, nettoyage
  let sec = 0, pct = 0;
  setInterval(() => {
    const f = document.getElementById('dFps'); if (f) f.textContent = 228 + Math.round(Math.random() * 18);
    if (mode === 'rec') { sec++; document.getElementById('dRec').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }
    if (mode === 'clean') { pct = (pct + 7) % 107; const p = Math.min(100, pct); document.getElementById('dBar').style.width = p + '%'; document.getElementById('dPct').textContent = p + '%'; }
  }, 1000);

  /* ───── 5. Héros : l'île se détache en gouttes, puis se recolle ───── */
  const stage = document.getElementById('decouvrir'), isl = document.getElementById('island');
  if (stage && isl) {
    const NS = 'http://www.w3.org/2000/svg';
    const goo = document.createElement('div'); goo.className = 'goo';
    goo.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs><filter id="gooF"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"/></filter></defs></svg><div class="goo-in"><i class="core"></i><i class="drop d1"></i><i class="drop d2"></i><i class="drop d3"></i></div>`;
    stage.prepend(goo);
    const core = goo.querySelector('.core'), drops = [...goo.querySelectorAll('.drop')];
    let fission = 0, t0 = performance.now();
    const loop = t => {
      const cw = isl.offsetWidth, ch = isl.offsetHeight, cr = parseFloat(getComputedStyle(isl).borderTopLeftRadius) || ch / 2;
      core.style.cssText = `width:${cw}px;height:${ch}px;border-radius:${cr}px;top:24px`;
      const ph = (t - t0) / 1000;
      drops.forEach((d, i) => {
        // chaque goutte orbite autour de l'île, s'éloigne pendant la « fission », puis revient
        const a = ph * (.9 + i * .35) + i * 2.1, out = 40 + 36 * Math.max(0, Math.sin(ph * .8 + i)) + fission * 70;
        const x = Math.cos(a) * (cw / 2 + out), y = ch / 2 + 24 + Math.sin(a) * (ch / 2 + out * .55);
        const sz = [22, 16, 12][i] * (1 + .15 * Math.sin(ph * 3 + i));
        d.style.cssText = `width:${sz}px;height:${sz}px;transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      fission *= .94;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    new MutationObserver(() => { fission = 1; }).observe(isl, { attributes: true, attributeFilter: ['data-s'] });
  }
})();
