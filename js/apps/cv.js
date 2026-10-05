(function () {
  const CV_PATH = "./assets/cv/cv.pdf";

    function render(container) {
    container.classList.add("cv-layout");
    container.innerHTML = `
      <h2>CV</h2>
      <p>Place ton fichier PDF ici : <code>${CV_PATH}</code></p>
      <p>
        <a class="btn" href="${CV_PATH}" target="_blank" rel="noopener">Ouvrir le CV</a>
        <a class="btn secondary" href="${CV_PATH}" download>Télécharger</a>
      </p>
      <div class="cv-preview">
        <object data="${CV_PATH}" type="application/pdf" width="100%" height="100%">
          <p class="placeholder" style="padding:1rem">Aucun CV trouvé pour le moment — ajoute <code>${CV_PATH}</code> dans ton repository.</p>
        </object>
      </div>
    `;
  }

  WindowManager.registerApp("cv", {
    title: "CV",
    icon: "📄",
    width: 480,
    height: 440,
    render,
  });
})();
