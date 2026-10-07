(function () {
  function render(container) {
    container.innerHTML = `
      <h2>A Propos</h2>
      <p class="placeholder">[Courte présentation — qui tu es, ce que tu fais]</p>

      <h2>Parcours</h2>
      <p class="placeholder">[Résumé de ton parcours]</p>

      <h2>Centres d'intérêt</h2>
      <p class="placeholder">[Développement, rallye, ...]</p>

      <h2>Manière de travailler</h2>
      <p class="placeholder">[Comment tu abordes un projet]</p>
    `;
  }

  WindowManager.registerApp("about", {
    title: "A Propos",
    icon: "👤",
    width: 460,
    height: 420,
    render,
  });
})();
