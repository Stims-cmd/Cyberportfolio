(function () {
  function techTag(id) {
    const meta = PortfolioData.findSkillMeta(id);
    const label = meta ? meta.name : id;
    return `<button class="tag" data-skill="${id}">${label}</button>`;
  }

  function projectHeader(p) {
    return `
      <h3>${p.title}</h3>
      <div class="meta">${p.date} · ${p.status} · ${p.type}</div>
      <div class="desc">${p.shortDescription}</div>
    `;
  }

  function projectDetail(id) {
    const p = PortfolioData.getProjectById(id);
    const links = [
      p.links?.demo && `<a class="btn" href="${p.links.demo}" target="_blank" rel="noopener">Live Demo</a>`,
      p.links?.github && `<a class="btn secondary" href="${p.links.github}" target="_blank" rel="noopener">GitHub</a>`,
      p.links?.docs && `<a class="btn secondary" href="${p.links.docs}" target="_blank" rel="noopener">Documentation</a>`,
    ].filter(Boolean);
    return `
      <dl class="section-detail">
        <dt>Contexte</dt><dd>${p.context} · ${p.date} · ${p.status}</dd>
        ${p.description ? `<dt>Réalisation</dt><dd>${p.description}</dd>` : ""}
        <dt>Technologies</dt><dd>${(p.technologies || []).map(techTag).join(" ")}</dd>
        <dt>Compétences mobilisées</dt><dd>${(p.skills || []).map(techTag).join(" ") || '<span class="placeholder">—</span>'}</dd>
      </dl>
      ${links.length ? `<p>${links.join(" ")}</p>` : ""}
    `;
  }

  function render(container) {
    const projects = PortfolioData.store.projects;
    if (!projects.length) {
      container.innerHTML = `<p class="placeholder">Aucun projet pour le moment. Ajoute des entrées dans data/projects.json.</p>`;
      return;
    }
    container.innerHTML = `
      <h2>Mes Projets</h2>
      <div class="card-list">${projects.map((p) => Accordion.card(p.id, projectHeader(p))).join("")}</div>
    `;
    Accordion.bind(container, projectDetail, (panel) => {
      panel.querySelectorAll("[data-skill]").forEach((tag) => {
        tag.addEventListener("click", () => {
          WindowManager.openWindow("skills");
          setTimeout(() => window.SkillsApp?.focusSkill(tag.dataset.skill), 150);
        });
      });
    });
  }

  WindowManager.registerApp("projects", {
    title: "Projets",
    icon: "📁",
    width: 560,
    height: 460,
    render,
  });

  // Exposé pour que d'autres apps (Parcours, Skills) puissent ouvrir un projet précis
  window.ProjectsApp = {
    openProject(id) {
      WindowManager.openWindow("projects");
      setTimeout(() => {
        Accordion.reveal(document.querySelector('.window[aria-label="Projets"] .app-content'), id);
      }, 150);
    },
  };
})();
