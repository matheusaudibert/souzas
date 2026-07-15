(function () {
  "use strict";

  var detail = document.getElementById("detail");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  var file = new URLSearchParams(window.location.search).get("foto");
  var index = -1;
  for (var i = 0; i < SOUZAS.length; i++) {
    if (SOUZAS[i].file === file) {
      index = i;
      break;
    }
  }

  if (index === -1) {
    detail.innerHTML =
      '<p class="empty">Souza não encontrado. <a href="index.html">Voltar para a Souzadex</a>.</p>';
    return;
  }

  var souza = SOUZAS[index];
  var number = index + 1;
  var title = titleFromFile(souza.file);

  detail.innerHTML =
    '<article class="card card-detail" data-name="' + title + '">' +
    '  <a class="card-image" href="assets/images/' + souza.file + '" target="_blank">' +
    '    <img src="assets/images/' + souza.file + '" alt="' + title + '">' +
    "  </a>" +
    '  <div class="card-info">' +
    '    <h1 class="card-title">' +
    '      <span class="card-number">#' + number + ":</span> " + title +
    "    </h1>" +
    '    <div class="card-authors">' +
    '      <a href="https://github.com/' + souza.author + '" target="_blank" rel="noopener" title="' + souza.author + '">' +
    '        <img src="https://github.com/' + souza.author + '.png?size=96" alt="' + souza.author + '" width="36" height="36">' +
    "      </a>" +
    "    </div>" +
    "  </div>" +
    "</article>";
})();