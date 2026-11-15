/* Tarifs et lien d'achat : à modifier ICI uniquement. */
const STORE = {
  checkoutUrl: "https://github.com/sonlikehisfather",   // ← remplace par ton lien de paiement (Stripe, Lemon Squeezy…)
  currency: "€",
  plans: [
    { id: "essai", name: "Essai", tag: "3 jours", price: 0, blurb: "Toutes les fonctions, sans carte bancaire.", perks: ["Toutes les fonctions", "Une fois par PC", "Aucun paiement"], cta: "Télécharger l'essai", url: "https://github.com/sonlikehisfather/dynamic-island-releases/releases/latest/download/DynamicIsland-win-Setup.exe" },
    { id: "perso", name: "Personnelle", tag: "À vie", price: 12, blurb: "Une clé, une fois, pour toujours.", perks: ["Mises à jour incluses", "Optimiseur complet", "Assistant IA et replay"], featured: true },
    { id: "pro", name: "Famille", tag: "À vie", price: 24, blurb: "Pour toute la maison.", perks: ["Jusqu'à 3 PC", "Mises à jour incluses", "Support prioritaire"], pcs: 3 }
  ]
};
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $('#plans'); if (!grid) return;
  let sel = STORE.plans.find(p => p.featured) || STORE.plans[0];
  const fmt = p => p.price === 0 ? "Gratuit" : p.price + " " + STORE.currency;
  grid.innerHTML = STORE.plans.map(p => `
    <button class="plan" role="radio" aria-checked="false" data-id="${p.id}">
      <span class="plan-tag">${p.tag}</span>
      <span class="plan-name">${p.name}</span>
      <span class="plan-price">${fmt(p)}</span>
      <span class="plan-blurb">${p.blurb}</span>
      <ul>${p.perks.map(x => `<li>${x}</li>`).join('')}</ul>
      <span class="plan-check" aria-hidden="true"></span>
    </button>`).join('');
  function paint() {
    grid.querySelectorAll('.plan').forEach(b => { const on = b.dataset.id === sel.id; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    $('#buyName').textContent = sel.name + (sel.pcs ? ` · ${sel.pcs} PC` : '');
    $('#buyPrice').textContent = fmt(sel);
    const a = $('#buyBtn'); a.textContent = sel.cta || 'Acheter';
    a.href = sel.url || STORE.checkoutUrl + '?plan=' + sel.id;
    $('#buyNote').textContent = sel.price === 0 ? 'Sans engagement. Activation en un clic dans l’appli.' : 'Clé de licence à coller dans l’appli après le paiement.';
  }
  grid.addEventListener('click', e => { const b = e.target.closest('.plan'); if (!b) return; sel = STORE.plans.find(p => p.id === b.dataset.id); paint(); });
  grid.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
    e.preventDefault();
    sel = STORE.plans[(STORE.plans.indexOf(sel) + d + STORE.plans.length) % STORE.plans.length]; paint(); grid.querySelector('.plan.on').focus();
  });
  paint();
})();
