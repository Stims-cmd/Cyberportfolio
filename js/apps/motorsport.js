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

    container.innerHTML = `
      <h2>Rallye &amp; Sport Automobile</h2>
      <p class="placeholder">Clique sur un rôle pour voir son détail et filtrer la timeline.</p>
      <p id="role-filters">
        ${data.roles.map((r) => `<button class="tag" data-role="${r.id}" aria-pressed="false">${r.label}</button>`).join("")}
      </p>
      <div id="role-detail"></div>

      <h2>Timeline</h2>
      <div id="events-list" class="card-list"></div>
      <div id="motorsport-detail"></div>
    `;

    function renderEvents() {
      const list = container.querySelector("#events-list");
      const events = activeRole ? data.events.filter((ev) => ev.role === activeRole) : data.events;
      list.innerHTML = events.length ? events.map((ev) => `
        <div class="card">
          <button class="card-open" data-event="${ev.id}">
            <div class="meta">${ev.date} · ${ev.location} · ${roleLabel(ev.role)}</div>
            <h3>${ev.name}</h3>
            <div class="desc">${ev.description}</div>
          </button>
        </div>
      `).join("") : `<p class="placeholder">Aucun événement pour ce rôle pour le moment.</p>`;

      list.querySelectorAll("[data-event]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ev = data.events.find((e) => e.id === btn.dataset.event);
          const panel = container.querySelector("#motorsport-detail");
          panel.innerHTML = `
            <div class="card" style="margin-top:1rem">
              <h3>${ev.name}</h3>
              <p class="meta">${roleLabel(ev.role)} · ${ev.date} · ${ev.location}</p>
              <p class="desc">${ev.experience}</p>
              <p>${(ev.skills || []).map((s) => `<span class="tag">${skillLabel(s)}</span>`).join("")}</p>
              <p class="placeholder">${ev.photos?.length ? "" : "Galerie photo à venir."}</p>
            </div>
          `;
          panel.scrollIntoView({ behavior: "smooth" });
        });
      });
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
    render,
  });
})();
