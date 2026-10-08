(function () {
  function render(container) {
    const data = PortfolioData.store.motorsport;
    if (!data || !data.events.length) {
      container.innerHTML = `<p class="placeholder">Ajoute tes événements dans data/motorsport.json.</p>`;
      return;
    }
    const roleLabel = (id) => data.roles.find((r) => r.id === id)?.label || id;
    const skillLabel = (id) => data.skillsCatalog.find((s) => s.id === id)?.label || id;

    let activeRole = null;

    // Tri automatique : le rallye le plus récent en premier. Un rallye dont la
    // date de début n'est pas encore arrivée part dans "À venir", puis rejoint
    // la timeline tout seul le jour venu.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const startOf = (ev) => ev.start || "";
    const pastEvents = data.events.filter((ev) => startOf(ev) <= today)
      .sort((a, b) => startOf(b).localeCompare(startOf(a)));
    const upcomingEvents = data.events.filter((ev) => startOf(ev) > today)
      .sort((a, b) => startOf(a).localeCompare(startOf(b)));

    container.innerHTML = `
      <h2>Rallye &amp; Sport Automobile</h2>
      ${data.intro ? `<p>${data.intro}</p>` : ""}
      <p class="placeholder">Clique sur un rôle pour voir son détail et filtrer la timeline.</p>
      <p id="role-filters">
        ${data.roles.map((r) => `<button class="tag" data-role="${r.id}" aria-pressed="false">${r.label}</button>`).join("")}
      </p>
      <div id="role-detail"></div>

      <h2>Timeline</h2>
      <div id="events-list" class="card-list"></div>
      <div id="upcoming-section"></div>
    `;

    // Détail d'un rallye, déplié directement sous sa carte (accordéon).
    const eventDetail = (id) => {
      const ev = data.events.find((e) => e.id === id);
      return `
        <p class="desc">${ev.experience}</p>
        <p>${(ev.skills || []).map((s) => `<span class="tag">${skillLabel(s)}</span>`).join("")}</p>
        ${ev.photos?.length ? `
          <div class="rally-photos">
            ${ev.photos.map((ph) => `
              <a href="./${ph.src}" target="_blank" rel="noopener">
                <img src="./${ph.src}" alt="${ph.alt || ev.name}" loading="lazy">
              </a>
            `).join("")}
          </div>
        ` : '<p class="placeholder">Galerie photo à venir.</p>'}
      `;
    };

    const eventCard = (ev) => Accordion.card(ev.id, `
      <div class="meta">${ev.date} · ${ev.location} · ${roleLabel(ev.role)}</div>
      <h3>${ev.name}</h3>
      <div class="desc">${ev.description}</div>
    `);

    function renderEvents() {
      const byRole = (ev) => !activeRole || ev.role === activeRole;
      const list = container.querySelector("#events-list");
      const events = pastEvents.filter(byRole);
      list.innerHTML = events.length ? events.map(eventCard).join("")
        : `<p class="placeholder">Aucun événement pour ce rôle pour le moment.</p>`;

      const upcoming = upcomingEvents.filter(byRole);
      container.querySelector("#upcoming-section").innerHTML = upcoming.length ? `
        <h2>À venir</h2>
        <div class="card-list">${upcoming.map(eventCard).join("")}</div>
      ` : "";

      Accordion.bind(container.querySelector("#events-list"), eventDetail);
      Accordion.bind(container.querySelector("#upcoming-section"), eventDetail);
    }

    function renderRoleDetail() {
      const panel = container.querySelector("#role-detail");
      if (!activeRole) { panel.innerHTML = ""; return; }
      const role = data.roles.find((r) => r.id === activeRole);
      panel.innerHTML = `
        <div class="card" style="margin-top:0.5rem; margin-bottom:1rem">
          <h3>${role.label}</h3>
          <p class="desc">${role.description}</p>
        </div>
      `;
    }

    container.querySelectorAll("[data-role]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeRole = activeRole === btn.dataset.role ? null : btn.dataset.role;
        container.querySelectorAll("[data-role]").forEach((b) => {
          b.setAttribute("aria-pressed", String(b.dataset.role === activeRole));
        });
        renderRoleDetail();
        renderEvents();
      });
    });

    renderEvents();
  }

  WindowManager.registerApp("garage", {
  title: "Passions",
  icon: "🏁",
  width: 560,
  height: 480,
  theme: "garage",
  desktop: "passion",
  render,
});
})();
