(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barre de navigation : trait fin dès qu'on défile
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Apparition au défilement
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.rv, .tile').forEach(el => io.observe(el));

  // Texte qui s'allume mot après mot
  const story = $('.story');
  if (story) {
    story.innerHTML = story.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
    const words = $$('span', story);
    const lit = () => {
      const r = story.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', lit, { passive: true }); lit();
  }

  // L'île de démonstration : elle change de forme toute seule, ou au clic
  const isl = $('#island'), tabs = $$('#tabs button');
  if (isl) {
    const set = i => {
      isl.dataset.s = i;
      $$('#island > div').forEach((d, k) => d.classList.toggle('on', k === i));
      tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
    };
    let cur = 0, timer = null;
    const run = () => { if (calm) return; clearInterval(timer); timer = setInterval(() => { cur = (cur + 1) % tabs.length; set(cur); }, 3200); };
    tabs.forEach((t, k) => t.addEventListener('click', () => { cur = k; set(k); run(); }));
    set(0); setTimeout(() => { cur = 1; set(1); }, 700); run();
  }
})();
