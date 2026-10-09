(function () {
  function render(container) {
    container.innerHTML = `
      <h2>L'IA, un outil parmi d'autres</h2>
      <p>
        J'utilise l'intelligence artificielle comme un outil de travail, au même titre
        qu'un IDE ou une documentation : elle m'aide à aller plus vite, mais elle ne
        décide pas à ma place. Je relis, je teste et je comprends tout ce que je garde,
        et je reste responsable du résultat final.
      </p>

      <h2>Comment je m'en sers</h2>
      <ul>
        <li><strong>Développement</strong> : assistant de code pour écrire, corriger et
          relire du code, comme pour ce portfolio. Chaque modification est relue et
          versionnée sous Git avant d'être publiée.</li>
        <li><strong>Apprentissage et veille</strong> : me faire expliquer un concept,
          une commande ou un outil, puis vérifier dans la documentation officielle.</li>
        <li><strong>Rédaction</strong> : reformuler, structurer ou relire mes documents
          et mes posts.</li>
        <li><strong>Automatisation</strong> : en stage, j'ai conçu un
          <button class="tag" data-open-project="project-06">📁 outil d'analyse de logs assisté par IA</button>
          reposant sur un modèle de langage exécuté en local (Ollama).</li>
      </ul>

      <h2>Une distance de sécurité</h2>
      <p>
        En cybersécurité, ce qu'on envoie à un service en ligne peut être conservé ou
        réutilisé. Je garde donc une séparation nette entre l'IA et les informations
        sensibles :
      </p>
      <ul>
        <li>aucun mot de passe, clé d'API, jeton ou secret n'est transmis à une IA ;</li>
        <li>aucune donnée d'entreprise, de client ou personnelle (logs, adresses IP,
          configurations, documents internes) n'est partagée avec une IA en ligne ;</li>
        <li>quand un exemple réel est nécessaire, je l'anonymise ou j'en crée un fictif ;</li>
        <li>lorsque des données sensibles doivent être traitées, comme les logs de
          sécurité, je passe par un modèle exécuté en local : les données ne quittent
          pas l'infrastructure ;</li>
        <li>l'IA n'a pas d'accès direct à mes comptes ni aux systèmes de production :
          c'est moi qui garde la main sur ce qui est exécuté.</li>
      </ul>
    `;
    container.querySelectorAll("[data-open-project]").forEach((btn) => {
      btn.addEventListener("click", () => window.ProjectsApp?.openProject(btn.dataset.openProject));
    });
  }

  WindowManager.registerApp("ai", {
    title: "IA",
    icon: "🤖",
    width: 500,
    height: 460,
    render,
  });
})();
