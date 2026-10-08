(function () {
  function render(container) {
    container.innerHTML = `
      <h2>A Propos</h2>
      <p>
        Simon DUCHANAUD, étudiant en Bachelor Informatique &amp; Cybersécurité à
        Guardia Cybersecurity School, basé à Lyon. Je construis mes compétences
        autant en cours que sur le terrain, je suis activement l'actualité cyber
        et je rédige des posts quand un sujet mérite réflexion.
      </p>

      <h2>Parcours</h2>
      <p>
        Bac STI2D option SIN au Lycée Galilée de Vienne (mention assez bien), puis
        Bachelor à Guardia Cybersecurity School (2025 – 2028). En parallèle, plusieurs
        stages en cybersécurité : RSSI de l'ENS de Lyon (2022 puis 2026), pentest chez
        AlgoSecure (2024), et une mission de prestataire à l'ENS (2026). Depuis mai 2026,
        je gère aussi ma micro-entreprise, 69 Info Services, d'aide informatique à domicile.
      </p>

      <h2>Centres d'intérêt</h2>
      <p>
        Cybersécurité et veille cyber. En dehors du clavier, je suis mécanicien
        d'assistance et commissaire de course en rallye amateur — une passion qui prend
        une nouvelle dimension quand je vois l'automobile se transformer en système connecté.
      </p>

      <h2>Langues</h2>
      <p>Français (langue maternelle) · Anglais (usage professionnel limité) · Espagnol (usage professionnel limité)</p>

      <h2>Manière de travailler</h2>
      <p>
        Je commence toujours par clarifier l'objectif avec le client pour éviter de partir
        dans la mauvaise direction, puis je cadre mon travail avec un plan que j'ajuste au
        fil de l'avancement. Je privilégie la communication régulière, avec des points à
        l'oral complétés par des traces écrites, et je documente et versionne mes travaux
        pour garantir un suivi rigoureux. J'aime échanger sincèrement avec mon entourage
        technique avant de décider. Pour moi, un projet est réussi quand le cahier des
        charges est respecté et que le client est satisfait.
      </p>
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
