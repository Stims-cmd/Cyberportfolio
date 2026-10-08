(function () {
  const GITHUB_USERNAME = "stims-cmd";

  const repos = [
    // Liste statique optionnelle — laisse vide pour n'afficher que le lien du profil.
    // { name: "mon-repo", description: "[Description]", url: "https://github.com/ton-pseudo/mon-repo" },
  ];

  function render(container) {
    container.innerHTML = `
      <h2>GitHub</h2>
      <p><a class="btn" href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener">Voir le profil @${GITHUB_USERNAME}</a></p>
      ${repos.length ? `
        <h2>Repositories</h2>
        <div class="card-list">
          ${repos.map((r) => `
            <a class="card" style="display:block; text-decoration:none" href="${r.url}" target="_blank" rel="noopener">
              <h3>${r.name}</h3>
              <div class="desc">${r.description}</div>
            </a>
          `).join("")}
        </div>
      ` : ""}
    `;
  }

  WindowManager.registerApp("github", {
    title: "GitHub",
    icon: "💻",
    width: 440,
    height: 360,
    render,
  });
})();
