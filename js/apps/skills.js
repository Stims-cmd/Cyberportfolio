(function () {
  // Découpe un libellé en lignes ne dépassant pas maxWidth (en px)
  function wrapLabel(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    text.split(" ").forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawRadar(canvas, skills) {
    // Canvas plus large que haut : de la place sur les côtés pour les libellés
    const width = 340, height = 250;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = width / 2;
    const cy = height / 2;
    const radius = height / 2 - 34;
    const n = skills.length;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#5eead4";

    ctx.clearRect(0, 0, width, height);

    // grille
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "11px sans-serif";

    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = (radius * ring) / 4;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // axes + labels
    const lineHeight = 13;
    skills.forEach((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * cos, cy + radius * sin);
      ctx.stroke();

      // Libellé aligné vers l'extérieur selon le côté du radar
      const lx = cx + (radius + 8) * cos;
      const ly = cy + (radius + 8) * sin;
      let align = "center";
      if (cos > 0.2) align = "left";
      else if (cos < -0.2) align = "right";
      const room = align === "left" ? width - lx - 2 : align === "right" ? lx - 2 : width - 4;
      const lines = wrapLabel(ctx, s.name, Math.min(room, 110));
      const blockHeight = lines.length * lineHeight;
      let top;
      if (sin < -0.5) top = ly - blockHeight;          // en haut : au-dessus du point
      else if (sin > 0.5) top = ly;                     // en bas : sous le point
      else top = ly - blockHeight / 2;                  // sur les côtés : centré
      ctx.textAlign = align;
      ctx.textBaseline = "top";
      lines.forEach((l, li) => ctx.fillText(l, lx, top + li * lineHeight));
    });

    // polygone de valeurs
    ctx.beginPath();
    skills.forEach((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (radius * (s.level || 0)) / 100;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
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
      return { id: s.id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
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
          <canvas id="radar-${di}" width="340" height="250" role="img" aria-label="Diagramme radar : ${d.domain}"></canvas>
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
