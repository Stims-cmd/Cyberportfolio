(function () {
  function drawRadar(canvas, skills) {
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 28;
    const n = skills.length;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#5eead4";

    ctx.clearRect(0, 0, size, size);

    // grille
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";

    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = (radius * ring) / 4;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // axes + labels
    skills.forEach((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.stroke();
      const lx = center + (radius + 16) * Math.cos(angle);
      const ly = center + (radius + 16) * Math.sin(angle);
      ctx.fillText(s.name, lx, ly);
    });

    // polygone de valeurs
    ctx.beginPath();
    skills.forEach((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (radius * (s.level || 0)) / 100;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(94,234,212,0.18)";
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // points cliquables
    return skills.map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (radius * (s.level || 0)) / 100;
      return { id: s.id, x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    });
  }

  function render(container) {
    const domains = PortfolioData.store.skills;
    if (!domains.length) {
      container.innerHTML = `<p class="placeholder">Aucune donnée dans data/skills.json.</p>`;
      return;
    }

    container.innerHTML = `
      <h2>Compétences</h2>
      <p class="placeholder" style="margin-bottom:1rem">Clique sur un point ou une compétence pour voir le détail.</p>
      ${domains.map((d, di) => `
        <h2>${d.domain}</h2>
        <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start">
          <canvas id="radar-${di}" width="220" height="220" role="img" aria-label="Diagramme radar : ${d.domain}"></canvas>
          <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-width:160px">
            ${d.skills.map((s) => `<button class="tag" data-skill="${s.id}" aria-pressed="false">${s.name} · ${s.level}%</button>`).join("")}
          </div>
        </div>
        <div id="skill-detail-${di}"></div>
      `).join("")}
    `;

    domains.forEach((d, di) => {
      const canvas = container.querySelector(`#radar-${di}`);
      const points = drawRadar(canvas, d.skills);
      canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        const hit = points.find((p) => Math.hypot(p.x - cx, p.y - cy) < 12);
        if (hit) showSkillDetail(container, hit.id);
      });
    });

    container.querySelectorAll("[data-skill]").forEach((tag) => {
      tag.addEventListener("click", () => showSkillDetail(container, tag.dataset.skill));
    });
  }

  // Affiche le détail d'une compétence juste sous son domaine ; un second clic
  // sur la même compétence le replie. Un seul détail ouvert à la fois.
  function showSkillDetail(container, skillId, { toggle = true } = {}) {
    const meta = PortfolioData.findSkillMeta(skillId);
    if (!meta) return;
    const di = PortfolioData.store.skills.findIndex((d) => d.domain === meta.domain);
    const panel = container.querySelector(`#skill-detail-${di}`);
    const alreadyOpen = panel.dataset.skill === skillId;

    container.querySelectorAll("[id^='skill-detail-']").forEach((p) => { p.innerHTML = ""; delete p.dataset.skill; });
    container.querySelectorAll("[data-skill]").forEach((t) => t.setAttribute("aria-pressed", "false"));
    if (alreadyOpen && toggle) return;

    const projects = PortfolioData.getProjectsForSkill(skillId);
    panel.dataset.skill = skillId;
    container.querySelector(`[data-skill="${CSS.escape(skillId)}"]`)?.setAttribute("aria-pressed", "true");
    panel.innerHTML = `
      <div class="card" style="margin:0.5rem 0 1rem">
        <h3>${meta.name} — ${meta.level}%</h3>
        <p class="desc">${meta.description}</p>
        ${projects.length
          ? `<div>${projects.map((p) => `<button class="tag" data-open-project="${p.id}">📁 ${p.title}</button>`).join("")}</div>`
          : `<p class="placeholder">Aucun projet lié pour le moment.</p>`}
      </div>
    `;
    panel.querySelectorAll("[data-open-project]").forEach((btn) => {
      btn.addEventListener("click", () => window.ProjectsApp?.openProject(btn.dataset.openProject));
    });
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  WindowManager.registerApp("skills", {
    title: "Skills",
    icon: "📊",
    width: 640,
    height: 520,
    render,
  });

  window.SkillsApp = {
    focusSkill(id) {
      const body = document.querySelector('.window[aria-label="Skills"] .app-content');
      if (body) showSkillDetail(body, id, { toggle: false });
    },
  };
})();
