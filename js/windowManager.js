/**
 * windowManager.js
 * Système de fenêtres générique. Chaque "app" est enregistrée avec un id
 * unique ; ouvrir une app déjà ouverte la fait simplement passer au premier
 * plan (comportement singleton), ce qui suffit pour un portfolio.
 */
const WindowManager = (() => {
  const layer = document.getElementById("windows-layer");
  const taskbarWindows = document.getElementById("taskbar-windows");
  const liveRegion = document.getElementById("live-region");

  const apps = {}; // id -> { title, icon, render, desktop }
  const openWindows = {}; // id -> { el, focused, minimized, maximized }
  let zCounter = 10;
  let openOffset = 0;
  let currentDesktop = "portfolio";

  const isMobile = () => window.innerWidth <= 768;
  const appDesktop = (id) => (apps[id] && apps[id].desktop) || "portfolio";

  function setDesktop(id) {
    currentDesktop = id;
    Object.entries(openWindows).forEach(([winId, win]) => {
      win.el.dataset.desktopActive = String(appDesktop(winId) === currentDesktop);
    });
    updateTaskbar();
  }

  function getDesktop() {
    return currentDesktop;
  }

  function registerApp(id, config) {
    apps[id] = config;
  }

  function announce(msg) {
    liveRegion.textContent = msg;
  }

  function focusWindow(id) {
    Object.entries(openWindows).forEach(([winId, win]) => {
      const active = winId === id;
      win.el.dataset.focused = active ? "true" : "false";
      if (active) {
        zCounter += 1;
        win.el.style.zIndex = zCounter;
      }
    });
    updateTaskbar();
  }

    function updateTaskbar() {
    taskbarWindows.innerHTML = "";
    Object.entries(openWindows)
      .filter(([id]) => appDesktop(id) === currentDesktop)
      .forEach(([id, win]) => {
      const btn = document.createElement("button");
      btn.className = "taskbar-item";
      btn.dataset.active = win.el.dataset.focused === "true" && win.el.dataset.minimized !== "true";
      btn.innerHTML = `<span>${apps[id].icon}</span><span class="taskbar-item-label">${apps[id].title}</span>`;
      btn.addEventListener("click", () => {
        if (win.el.dataset.minimized === "true") {
          win.el.dataset.minimized = "false";
          focusWindow(id);
        } else if (win.el.dataset.focused === "true") {
          win.el.dataset.minimized = "true";
          updateTaskbar();
        } else {
          focusWindow(id);
        }
      });
      taskbarWindows.appendChild(btn);
    });
  }

  function closeWindow(id) {
    const win = openWindows[id];
    if (!win) return;
    win.el.remove();
    delete openWindows[id];
    updateTaskbar();
    announce(`Fenêtre ${apps[id].title} fermée`);
  }

  function makeDraggable(win, titlebar) {
    if (isMobile()) return;
    let dragging = false;
    let startX, startY, startLeft, startTop;

    titlebar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-controls")) return;
      if (win.dataset.maximized === "true") return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      const parentRect = win.parentElement.getBoundingClientRect();
      startLeft = rect.left - parentRect.left;
      startTop = rect.top - parentRect.top;
      titlebar.setPointerCapture(e.pointerId);
    });
    titlebar.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = `${Math.max(0, startLeft + dx)}px`;
      win.style.top = `${Math.max(0, startTop + dy)}px`;
    });
    titlebar.addEventListener("pointerup", () => { dragging = false; });
  }

  function makeResizable(win) {
    if (isMobile()) return;
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    win.appendChild(handle);
    let resizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener("pointerdown", (e) => {
      resizing = true;
      startX = e.clientX; startY = e.clientY;
      startW = win.offsetWidth; startH = win.offsetHeight;
      handle.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!resizing) return;
      win.style.width = `${Math.max(280, startW + (e.clientX - startX))}px`;
      win.style.height = `${Math.max(200, startH + (e.clientY - startY))}px`;
    });
    handle.addEventListener("pointerup", () => { resizing = false; });
  }

  function openWindow(id) {
    const app = apps[id];
    if (!app) return console.warn(`App inconnue : ${id}`);
      if (openWindows[id]) {
      openWindows[id].el.dataset.minimized = "false";
      openWindows[id].el.dataset.desktopActive = "true";
      focusWindow(id);
      return;
    }

    const el = document.createElement("section");
    el.className = "window";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", app.title);
    el.dataset.open = "false";
    el.dataset.minimized = "false";
    el.dataset.maximized = isMobile() ? "true" : "false";
    el.dataset.desktop = appDesktop(id);
    el.dataset.desktopActive = String(appDesktop(id) === currentDesktop);
    if (app.theme) el.classList.add(`theme-${app.theme}`);

    openOffset = (openOffset + 28) % 160;
    if (!isMobile()) {
      el.style.left = `${60 + openOffset}px`;
      el.style.top = `${40 + openOffset}px`;
    }
    if (app.width) el.style.width = `${app.width}px`;
    if (app.height) el.style.height = `${app.height}px`;

    el.innerHTML = `
      <header class="window-titlebar">
        <span class="win-icon" aria-hidden="true">${app.icon}</span>
        <span class="win-title">${app.title}</span>
        <div class="win-controls">
          <button class="win-min" aria-label="Minimiser">–</button>
          <button class="win-max" aria-label="Agrandir / restaurer">▢</button>
          <button class="win-close" aria-label="Fermer">✕</button>
        </div>
      </header>
      <div class="window-body"><div class="app-content"><p class="placeholder">Chargement…</p></div></div>
    `;

    layer.appendChild(el);
    requestAnimationFrame(() => { el.dataset.open = "true"; });

    const titlebar = el.querySelector(".window-titlebar");
    const body = el.querySelector(".app-content");

    el.querySelector(".win-close").addEventListener("click", () => closeWindow(id));
    el.querySelector(".win-min").addEventListener("click", () => {
      el.dataset.minimized = "true";
      updateTaskbar();
    });
    el.querySelector(".win-max").addEventListener("click", () => {
      el.dataset.maximized = el.dataset.maximized === "true" ? "false" : "true";
    });

    el.addEventListener("pointerdown", () => focusWindow(id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeWindow(id);
    });

    makeDraggable(el, titlebar);
    makeResizable(el);

    openWindows[id] = { el };
    focusWindow(id);
    updateTaskbar();
    announce(`Fenêtre ${app.title} ouverte`);

    try {
      app.render(body);
    } catch (err) {
      body.innerHTML = `<p class="placeholder">Erreur d'affichage : ${err.message}</p>`;
      console.error(err);
    }
  }

    return { registerApp, openWindow, closeWindow, focusWindow, setDesktop, getDesktop };
})();
