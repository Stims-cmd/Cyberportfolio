(function () {
  function techTag(id) {
    const meta = PortfolioData.findSkillMeta(id);
    const label = meta ? meta.name : id;
    return `<button class="tag" data-skill="${id}">${label}</button>`;
  }

  function renderList(container) {
    const projects = PortfolioData.store.projects;
    if (!projects.length) {
      container.innerHTML = `<p class="placeholder">Aucun projet pour le moment. Ajoute des entrées dans data/projects.json.</p>`;
      return;
    }
    container.innerHTML = `
      <h2>Projets</h2>
      <div class="card-list">
        ${projects.map((p) => `
          <div class="card">
            <button class="card-open" data-project="${p.id}">
              <h3>${p.title}</h3>
              <div class="meta">${p.date} · ${p.status} · ${p.type}</div>
              <div class="desc">${p.shortDescription}</div>
            </button>
          </div>
        `).join("")}
      </div>
    `;
    container.querySelectorAll("[data-project]").forEach((btn) => {
      btn.addEventListener("click", () => renderDetail(container, btn.dataset.project));
    });
  }

  function renderDetail(container, id) {
    const p = PortfolioData.getProjectById(id);
    if (!p) return renderList(container);

    container.innerHTML = `
      <button class="btn secondary" data-back>← Retour aux projets</button>
      <h2 style="margin-top:1rem">${p.title}</h2>
      <p class="desc">${p.shortDescription}</p>

      <dl class="section-detail">
        <dt>Contexte</dt><dd>${p.context} · ${p.date} · ${p.status}</dd>
        <dt>Technologies</dt><dd>${(p.technologies || []).map(techTag).join(" ")}</dd>
        <dt>Compétences mobilisées</dt><dd>${(p.skills || []).map(techTag).join(" ") || '<span class="placeholder">—</span>'}</dd>
      </dl>

      <h2>Liens</h2>
      <p>
        ${p.links?.demo ? `<a class="btn" href="${p.links.demo}" target="_blank" rel="noopener">Live Demo</a> ` : ""}
        ${p.links?.github ? `<a class="btn secondary" href="${p.links.github}" target="_blank" rel="noopener">GitHub</a> ` : ""}
        ${p.links?.docs ? `<a class="btn secondary" href="${p.links.docs}" target="_blank" rel="noopener">Documentation</a>` : ""}
        ${!p.links?.demo && !p.links?.github && !p.links?.docs ? '<span class="placeholder">Aucun lien disponible</span>' : ""}
      </p>
    `;

    container.querySelector("[data-back]").addEventListener("click", () => renderList(container));
    container.querySelectorAll("[data-skill]").forEach((tag) => {
      tag.addEventListener("click", () => {
        WindowManager.openWindow("skills");
        setTimeout(() => window.SkillsApp?.focusSkill(tag.dataset.skill), 150);
      });
    });
  }

  WindowManager.registerApp("projects", {
    title: "Projets",
    icon: "📁",
    width: 560,
    height: 460,
    render: renderList,
  });

  // Exposé pour que d'autres apps (Journey, Skills) puissent ouvrir un projet précis
  window.ProjectsApp = {
    openProject(id) {
      WindowManager.openWindow("projects");
      setTimeout(() => {
        const body = document.querySelector('.window[aria-label="Projects"] .app-content');
        if (body) renderDetail(body, id);
      }, 150);
    },
  };
})();
