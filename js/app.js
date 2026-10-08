(function () {
    // Positions en % du bureau (desktop uniquement) : réparties à la main pour
  // donner un rendu "vécu", avec resolveOverlaps() en filet de sécurité si
  // de nouvelles icônes sont ajoutées plus tard sans repenser le layout.
    // Positions en % du bureau (par bureau) : réparties à la main pour donner
  // un rendu "vécu", avec resolveOverlaps() en filet de sécurité si de
  // nouvelles icônes sont ajoutées plus tard sans repenser le layout.
  const PORTFOLIO_ICONS = [
    { id: "projects", label: "Projets", glyph: "📁", pos: { top: "8%", left: "5%" } },
    { id: "cv", label: "CV", glyph: "📄", pos: { top: "6%", left: "42%" } },
    { id: "lab", label: "LAB", glyph: "🧪", pos: { top: "26%", left: "48%" } },
    { id: "skills", label: "Skills", glyph: "📊", pos: { top: "58%", left: "30%" } },
    { id: "github", label: "GitHub", glyph: "💻", pos: { top: "18%", left: "78%" } },
    { id: "journey", label: "Mon ADN", glyph: "🧬", pos: { top: "68%", left: "70%" } },
    { id: "about", label: "A Propos", glyph: "👤", pos: { top: "82%", left: "6%" } },
    { id: "contact", label: "Contact", glyph: "✉️", pos: { top: "84%", left: "55%" } },
    { id: "trash", label: "Corbeille", glyph: "🗑️", pos: { top: "4%", left: "92%" } },
  ];

  // Bureau Passion : pour l'instant le Garage (timeline rallye/motorsport),
  // facile à étoffer plus tard (ex: ajouter une icône "Véhicules").
  const PASSION_ICONS = [
    { id: "garage", label: "Passions", glyph: "🏁", pos: { top: "22%", left: "15%" } },
  ];

  // Images décoratives du bureau : pas des icônes, pas des fenêtres. "pos"
  // utilise le même système en % que les icônes pour rester responsive.
  // Remplace simplement le fichier (même nom) pour changer le visuel, ou
  // ajoute/retire des entrées ici — aucune autre modification nécessaire.
  const PORTFOLIO_IMAGES = [
    // { src: "assets/images/desktop/portfolio-sticker.png", alt: "[Description de l'image]", pos: { top: "48%", left: "88%" } },
  ];

  const PORTFOLIO_WALLPAPER = {
  src: "assets/images/desktop/fond-passion.jpg", 
  opacity: 0.35,
  };

  const PASSION_IMAGES = [
    // { src: "assets/images/desktop/passion-sticker.png", alt: "[Description de l'image]", pos: { top: "60%", left: "85%" } },
  ];

  const PASSION_WALLPAPER = {
    src: "assets/images/desktop/fond-passion.jpg", // ex: "assets/images/desktop/passion-wallpaper.jpg"
    opacity: 0.35,
  };

  const DESKTOPS = {
  portfolio: { icons: PORTFOLIO_ICONS, images: PORTFOLIO_IMAGES, wallpaper: PORTFOLIO_WALLPAPER, themeClass: null },
  passion: { icons: PASSION_ICONS, images: PASSION_IMAGES, wallpaper: PASSION_WALLPAPER, themeClass: "theme-passion" },
};

  let currentDesktopId = "portfolio";

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

  function renderDesktopWallpaper(desktopId) {
    const el = document.getElementById("desktop-wallpaper");
    const wp = DESKTOPS[desktopId].wallpaper;
    console.log("WALLPAPER DEBUG:", desktopId, wp); // ← ligne temporaire de diagnostic
    if (!wp || !wp.src) {
      el.style.opacity = "0";
      el.removeAttribute("src");
      return;
    }
    el.onerror = () => { console.log("WALLPAPER ERROR: fichier introuvable", el.src); el.style.opacity = "0"; };
    el.onload = () => { console.log("WALLPAPER OK: chargée", el.src); };
    el.src = `./${wp.src}`;
    el.style.opacity = String(wp.opacity ?? 0.35);
}

  function renderDesktopIcons(desktopId) {
    const wrap = document.getElementById("icons");
    const isDesktop = window.innerWidth > 768;
    const icons = DESKTOPS[desktopId].icons;

    let positions = icons.map((a) => ({
      id: a.id,
      top: parseFloat(a.pos.top),
      left: parseFloat(a.pos.left),
    }));
    if (isDesktop) positions = resolveOverlaps(positions);
    const posById = Object.fromEntries(positions.map((p) => [p.id, p]));

    wrap.innerHTML = icons.map((app) => `
      <button class="icon-btn" data-app="${app.id}" role="listitem" aria-label="Ouvrir ${app.label}">
        <span class="icon-glyph" aria-hidden="true">${app.glyph}</span>
        <span class="icon-label">${app.label}</span>
      </button>
    `).join("");

    if (isDesktop) {
      wrap.querySelectorAll("[data-app]").forEach((btn) => {
        const p = posById[btn.dataset.app];
        btn.style.top = `${p.top}%`;
        btn.style.left = `${p.left}%`;
      });
    }

    wrap.querySelectorAll("[data-app]").forEach((btn) => {
      btn.addEventListener("click", () => WindowManager.openWindow(btn.dataset.app));
      btn.addEventListener("dblclick", (e) => e.preventDefault());
    });
  }

    function renderDesktopImages(desktopId) {
    const wrap = document.getElementById("desktop-images");
    const images = DESKTOPS[desktopId].images || [];
    wrap.innerHTML = images.map((img) => `
      <img
        class="desktop-image"
        src="./${img.src}"
        alt="${img.alt || ""}"
        style="top:${img.pos.top}; left:${img.pos.left}"
        onerror="this.remove()"
      >
    `).join("");
  }

  function updateDesktopSwitchButton() {
    const icon = document.getElementById("desktop-switch-icon");
    const label = document.getElementById("desktop-switch-label");
    if (currentDesktopId === "portfolio") {
      icon.textContent = "🏁";
      label.textContent = "Bureau Passion";
    } else {
      icon.textContent = "💻";
      label.textContent = "Bureau Portfolio";
    }
  }

  function switchDesktop(id) {
    if (id === currentDesktopId || !DESKTOPS[id]) return;
    currentDesktopId = id;

    const desktopEl = document.getElementById("desktop");
    desktopEl.classList.add("switching");
    setTimeout(() => desktopEl.classList.remove("switching"), 350);

    Object.values(DESKTOPS).forEach((d) => { if (d.themeClass) desktopEl.classList.remove(d.themeClass); });
    if (DESKTOPS[id].themeClass) desktopEl.classList.add(DESKTOPS[id].themeClass);

    renderDesktopIcons(id);
    renderDesktopImages(id);
    WindowManager.setDesktop(id);
    updateDesktopSwitchButton();
    
  }

  function initDesktopSwitch() {
    document.getElementById("desktop-switch").addEventListener("click", () => {
      switchDesktop(currentDesktopId === "portfolio" ? "passion" : "portfolio");
    });
    updateDesktopSwitchButton();
  }

  function initLanding() {
    const landing = document.getElementById("landing");
    const enterBtn = document.getElementById("landing-enter");
    enterBtn.addEventListener("click", () => {
      landing.dataset.hidden = "true";
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
            container.innerHTML = `<h2>Bien joué 🎉</h2><p>Tu as trouvé un easter egg caché.</p>`;
          },
        });
        WindowManager.openWindow("secret");
      }
    });
  }

  async function init() {
  initLanding();
  renderDesktopIcons(currentDesktopId);
  renderDesktopImages(currentDesktopId);
  initDesktopSwitch();
  startClock();
  registerTrashApp();
  registerKeyboardEasterEgg();
  await PortfolioData.init();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
