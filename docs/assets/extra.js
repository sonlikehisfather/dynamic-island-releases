// HUD de jeu : les chiffres vivent
(function () {
  const $ = id => document.getElementById(id), f = $('hFps');
  if (!f || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = (a, b) => Math.round(a + Math.random() * (b - a));
  setInterval(() => { f.textContent = r(228, 247); $('hCpu').textContent = r(30, 41) + ' %'; $('hGpu').textContent = r(66, 78) + ' %'; $('hPing').textContent = r(10, 15) + ' ms'; }, 900);
})();

// Démo « Essaie-la » : calculs et conversions
(function () {
  const inp = document.getElementById('tryIn'), out = document.getElementById('tryOut'); if (!inp) return;
  const U = { km: ['d', 1000], m: ['d', 1], cm: ['d', .01], mi: ['d', 1609.344], ft: ['d', .3048], kg: ['w', 1], g: ['w', .001], lb: ['w', .45359237], h: ['t', 60], min: ['t', 1], s: ['t', 1 / 60], j: ['t', 1440] };
  const fmt = n => Number.isInteger(n) ? String(n) : String(+n.toFixed(3)).replace('.', ',');
  function calc(q) {
    q = q.trim().toLowerCase().replace(',', '.');
    let m = q.match(/^(-?[\d.]+)\s*°?\s*(f|c)\s+(?:en|to|vers)\s+(f|c)$/);
    if (m && m[2] !== m[3]) { const v = +m[1]; return m[2] === 'f' ? fmt((v - 32) * 5 / 9) + ' °C' : fmt(v * 9 / 5 + 32) + ' °F'; }
    m = q.match(/^(-?[\d.]+)\s*([a-z]+)\s+(?:en|to|vers)\s+([a-z]+)$/);
    if (m && U[m[2]] && U[m[3]] && U[m[2]][0] === U[m[3]][0]) return fmt(+m[1] * U[m[2]][1] / U[m[3]][1]) + ' ' + m[3];
    if (/^[\d+\-*/().^\s%]+$/.test(q)) { try { const v = Function('"use strict";return (' + q.replace(/\^/g, '**') + ')')(); if (isFinite(v)) return fmt(v); } catch (e) {} }
    return 'Je n’ai pas compris';
  }
  const run = () => { out.textContent = calc(inp.value); out.classList.add('pop'); setTimeout(() => out.classList.remove('pop'), 220); };
  document.getElementById('tryForm').addEventListener('submit', e => { e.preventDefault(); run(); });
  document.getElementById('tryEx').addEventListener('click', e => { if (e.target.tagName === 'BUTTON') { inp.value = e.target.textContent; run(); } });
})();
