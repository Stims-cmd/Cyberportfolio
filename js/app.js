(function () {
    // Positions en % du bureau (desktop uniquement) : réparties à la main pour
  // donner un rendu "vécu", avec resolveOverlaps() en filet de sécurité si
  // de nouvelles icônes sont ajoutées plus tard sans repenser le layout.
  const DESKTOP_ICONS = [
    { id: "projects", label: "Projects", glyph: "📁", pos: { top: "8%", left: "5%" } },
    { id: "cv", label: "CV", glyph: "📄", pos: { top: "6%", left: "42%" } },
    { id: "lab", label: "LAB", glyph: "🧪", pos: { top: "26%", left: "48%" } },
    { id: "garage", label: "Garage", glyph: "🏁", pos: { top: "40%", left: "8%" } },
    { id: "skills", label: "Skills", glyph: "📊", pos: { top: "58%", left: "30%" } },
    { id: "github", label: "GitHub", glyph: "💻", pos: { top: "18%", left: "78%" } },
    { id: "journey", label: "Journey", glyph: "🧬", pos: { top: "68%", left: "70%" } },
    { id: "about", label: "About Me", glyph: "👤", pos: { top: "82%", left: "6%" } },
    { id: "contact", label: "Contact", glyph: "✉️", pos: { top: "84%", left: "55%" } },
    { id: "trash", label: "Corbeille", glyph: "🗑️", pos: { top: "4%", left: "92%" } },
  ];

  const MIN_DISTANCE_PCT = 13; // écart minimal entre centres d'icônes, en % de la diagonale du bureau

  function resolveOverlaps(positions) {
    // Quelques passes de répulsion simples : si deux icônes sont trop proches,
    // on les écarte légèrement le long de l'axe qui les sépare.
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i], b = positions[j];
          const dx = b.left - a.left, dy = b.top - a.top;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < MIN_DISTANCE_PCT) {
            const push = (MIN_DISTANCE_PCT - dist) / 2;
            const ux = dx / dist, uy = dy / dist;
            a.left = Math.max(2, Math.min(90, a.left - ux * push));
            a.top = Math.max(2, Math.min(90, a.top - uy * push));
            b.left = Math.max(2, Math.min(90, b.left + ux * push));
            b.top = Math.max(2, Math.min(90, b.top + uy * push));
          }
        }
      }
    }
    return positions;
  }

  function buildDesktopIcons() {
    const wrap = document.getElementById("icons");
    const isDesktop = window.innerWidth > 768;

    let positions = DESKTOP_ICONS.map((a) => ({
      id: a.id,
      top: parseFloat(a.pos.top),
      left: parseFloat(a.pos.left),
    }));
    if (isDesktop) positions = resolveOverlaps(positions);
    const posById = Object.fromEntries(positions.map((p) => [p.id, p]));

    wrap.innerHTML = DESKTOP_ICONS.map((app) => `
      <button class="icon-btn" data-app="${app.id}" role="listitem" aria-label="Ouvrir ${app.label}">
        <span class="icon-glyph" aria-hidden="true">${app.glyph}</span>
        <span class="icon-label">${app.label}</span>
      </button>
    `).join("");

    if (isDesktop) {
      wrap.querySelectorAll("[data-app]").forEach((btn) => {
      btn.addEventListener("click", () => WindowManager.openWindow(btn.dataset.app));
      btn.addEventListener("dblclick", (e) => e.preventDefault());
    });
  }

    wrap.querySelectorAll("[data-app]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.app === "trash") return openTrashEasterEgg();
        WindowManager.openWindow(btn.dataset.app);
      });
      btn.addEventListener("dblclick", (e) => e.preventDefault());
    });
  }

  function buildStartMenu() {
    const menu = document.getElementById("start-menu");
    const btn = document.getElementById("start-btn");
    menu.innerHTML = DESKTOP_ICONS.filter((a) => a.id !== "trash").map((app) => `
      <button data-app="${app.id}" role="menuitem"><span aria-hidden="true">${app.glyph}</span> ${app.label}</button>
    `).join("");

    function toggle(open) {
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    }

    btn.addEventListener("click", () => toggle(menu.hidden));
    document.addEventListener("click", (e) => {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) toggle(false);
    });
    menu.querySelectorAll("[data-app]").forEach((item) => {
      item.addEventListener("click", () => {
        WindowManager.openWindow(item.dataset.app);
        toggle(false);
      });
    });
  }

  function startClock() {
    const clock = document.getElementById("clock");
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };
    tick();
    setInterval(tick, 15000);
  }

  function registerTrashApp() {
    WindowManager.registerApp("trash", {
      title: "Corbeille",
      icon: "🗑️",
      width: 360,
      height: 260,
      render(container) {
        container.innerHTML = `
          <h2>Trash</h2>
          <p class="placeholder">Corbeille vide... ou presque.</p>
          <p style="margin-top:1rem; font-size:0.8rem; color:var(--text-dim)">
            Astuce : essaie <kbd>Ctrl/Cmd + Alt + P</kbd> quelque part sur le bureau.
          </p>
        `;
      },
    });
  }

  // Deuxième easter egg : raccourci clavier caché
  function registerKeyboardEasterEgg() {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "p") {
        WindowManager.registerApp("secret", {
          title: "???",
          icon: "🥚",
          width: 360,
          height: 220,
          render(container) {
            container.innerHTML = `<h2>Bien joué 🎉</h2><p>Tu as trouvé un easter egg caché. [Remplace ce message par ce que tu veux.]</p>`;
          },
        });
        WindowManager.openWindow("secret");
      }
    });
  }

  async function init() {
    buildDesktopIcons();
    startClock();
    registerTrashApp();
    registerKeyboardEasterEgg();
    await PortfolioData.init();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
