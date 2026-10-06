(function () {
  function render(container) {
    const steps = PortfolioData.store.journey;
    if (!steps.length) {
      container.innerHTML = `<p class="placeholder">Aucune étape dans data/journey.json.</p>`;
      return;
    }
    container.innerHTML = `
      <h2>Mon ADN</h2>
      <div class="card-list">
        ${steps.map((s) => `
          <div class="card">
            <button class="card-open" data-step="${s.id}">
              <div class="meta">${s.date}</div>
              <h3>${s.title}</h3>
              <div class="desc">${s.context}</div>
            </button>
          </div>
        `).join("")}
      </div>
      <div id="journey-detail"></div>
    `;
    container.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => showStep(container, btn.dataset.step));
    });
  }

  function showStep(container, id) {
    const step = PortfolioData.store.journey.find((s) => s.id === id);
    if (!step) return;
    const panel = container.querySelector("#journey-detail");
    panel.innerHTML = `
      <div class="card" style="margin-top:1rem">
        <h3>${step.date} — ${step.title}</h3>
        <p class="desc">${step.achievements}</p>
        ${step.technologies?.length ? `<p>${step.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}</p>` : ""}
        ${step.projects?.length ? `<div>${step.projects.map((pid) => `<button class="tag" data-open-project="${pid}">Projet lié</button>`).join("")}</div>` : ""}
      </div>
    `;
    panel.querySelectorAll("[data-open-project]").forEach((btn) => {
      btn.addEventListener("click", () => window.ProjectsApp?.openProject(btn.dataset.openProject));
    });
    panel.scrollIntoView({ behavior: "smooth" });
  }

  WindowManager.registerApp("journey", {
    title: "Mon ADN",
    icon: "🧬",
    width: 540,
    height: 480,
    render,
  });
})();
