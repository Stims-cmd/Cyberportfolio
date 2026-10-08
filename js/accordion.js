/**
 * accordion.js
 * Cartes dépliables partagées par les apps (Parcours, Projets, Passions, LAB) :
 * un clic sur une carte déplie son détail juste en dessous, un second clic le
 * replie. Le détail n'est généré qu'à la première ouverture (les photos ne se
 * chargent donc que si on les regarde).
 */
const Accordion = (() => {
  // HTML d'une carte : `header` est le résumé toujours visible.
  function card(id, header) {
    return `
      <div class="card">
        <button class="card-open" data-accordion="${id}" aria-expanded="false" aria-controls="detail-${id}">
          ${header}
        </button>
        <div class="card-detail" id="detail-${id}" hidden></div>
      </div>
    `;
  }

  function setOpen(btn, open, renderDetail, afterRender) {
    const panel = btn.nextElementSibling;
    if (open && !panel.innerHTML) {
      panel.innerHTML = renderDetail(btn.dataset.accordion);
      afterRender?.(panel, btn.dataset.accordion);
    }
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }

  // Active les cartes rendues dans `container`. `renderDetail(id)` renvoie le
  // HTML du détail ; `afterRender(panel, id)` permet d'y brancher des clics.
  function bind(container, renderDetail, afterRender) {
    container.querySelectorAll("[data-accordion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setOpen(btn, btn.getAttribute("aria-expanded") !== "true", renderDetail, afterRender);
      });
    });
  }

  // Déplie une carte précise et la fait défiler à l'écran (liens entre apps).
  function reveal(container, id) {
    const btn = container?.querySelector(`[data-accordion="${id}"]`);
    if (!btn) return;
    if (btn.getAttribute("aria-expanded") !== "true") btn.click();
    btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return { card, bind, reveal };
})();
