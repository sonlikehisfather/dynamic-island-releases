/* Tarifs et lien d'achat : à modifier ICI uniquement. */
const STORE = {
  checkoutUrl: "https://discord.com/users/1456994725566353485",   // le paiement se fait sur Discord, en message privé
  currency: "€",
  plans: [
    { id: "essai", name: "Essai", tag: "3 jours", price: 0, blurb: "Découvre l'île, sans engagement.", perks: ["Île, overlay, réticule, outils", "Une fois par PC", "Sans carte bancaire"], cta: "Télécharger l'essai", url: "https://github.com/sonlikehisfather/dynamic-island-releases/releases/latest/download/DynamicIsland-win-Setup.exe" },
    { id: "an", name: "1 an", tag: "12 mois", price: 8, blurb: "Tout débloqué pendant un an.", perks: ["Assistant IA et instant replay", "Studio de capture, scènes, stream", "Mises à jour pendant un an"], cta: "Payer sur Discord" },
    { id: "perso", name: "À vie", tag: "Une fois", price: 15, blurb: "Une clé, une fois, pour toujours.", perks: ["Assistant IA et instant replay", "Studio de capture, scènes, stream", "Boost auto et mises à jour"], featured: true, cta: "Payer sur Discord" },
    { id: "pro", name: "Famille", tag: "Une fois", price: 29, blurb: "Pour toute la maison.", perks: ["Jusqu'à 3 PC", "Mises à jour incluses", "Support prioritaire"], pcs: 3, cta: "Payer sur Discord" }
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
    $('#buyNote').textContent = sel.price === 0 ? 'Sans engagement. Activation en un clic dans l’appli.' : 'Paiement en message privé sur Discord, puis clé à coller dans l’appli.';
  }
  grid.addEventListener('click', e => { const b = e.target.closest('.plan'); if (!b) return; sel = STORE.plans.find(p => p.id === b.dataset.id); paint(); });
  grid.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
    e.preventDefault();
    sel = STORE.plans[(STORE.plans.indexOf(sel) + d + STORE.plans.length) % STORE.plans.length]; paint(); grid.querySelector('.plan.on').focus();
  });
  paint();
})();
