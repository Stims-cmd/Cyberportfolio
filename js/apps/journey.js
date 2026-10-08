(function () {
  const SECTIONS = [
    { category: "experience", title: "Expériences professionnelles" },
    { category: "formation", title: "Formation" },
  ];

  // Du plus récent au plus ancien : date de début, puis date de fin
  // (une étape "en cours", sans date de fin, passe devant).
  function byMostRecent(a, b) {
    return (b.start || "").localeCompare(a.start || "")
      || (b.end || "9999").localeCompare(a.end || "9999");
  }

  function stepHeader(s) {
    return `
      <div class="meta">${s.date}</div>
      <h3>${s.title}</h3>
      <div class="desc">${s.context}</div>
    `;
  }

  function stepDetail(id) {
    const step = PortfolioData.store.journey.find((s) => s.id === id);
    return `
      <p class="desc">${step.achievements}</p>
      ${step.technologies?.length ? `<p>${step.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}</p>` : ""}
      ${step.projects?.length ? `
        <p class="meta">Projets liés</p>
        <div>${step.projects.map((pid) => {
          const p = PortfolioData.getProjectById(pid);
          return p ? `<button class="tag" data-open-project="${pid}">📁 ${p.title}</button>` : "";
        }).join("")}</div>
      ` : ""}
    `;
  }

  function render(container) {
    const steps = PortfolioData.store.journey;
    if (!steps.length) {
      container.innerHTML = `<p class="placeholder">Aucune étape dans data/journey.json.</p>`;
      return;
    }
    container.innerHTML = `
      <h2>Mon Parcours</h2>
      ${SECTIONS.map(({ category, title }) => {
        const items = steps.filter((s) => s.category === category).sort(byMostRecent);
        return items.length ? `
          <h2>${title}</h2>
          <div class="card-list">${items.map((s) => Accordion.card(s.id, stepHeader(s))).join("")}</div>
        ` : "";
      }).join("")}
    `;
    Accordion.bind(container, stepDetail, (panel) => {
      panel.querySelectorAll("[data-open-project]").forEach((btn) => {
        btn.addEventListener("click", () => window.ProjectsApp?.openProject(btn.dataset.openProject));
      });
    });
  }

  WindowManager.registerApp("journey", {
    title: "Mon Parcours",
    icon: "🧭",
    width: 540,
    height: 480,
    render,
  });
})();
