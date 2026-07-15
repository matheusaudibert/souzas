(function () {
  "use strict";

  var grid = document.getElementById("grid");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  // SOUZAS está em ordem cronológica; exibe os mais recentes primeiro.
  SOUZAS.forEach(function (souza, index) {
    var number = index + 1;
    var title = titleFromFile(souza.file);

    var card = document.createElement("article");
    card.className = "card";
    card.dataset.name = title;

    card.innerHTML =
      '<a class="card-image" href="souza.html?foto=' + encodeURIComponent(souza.file) + '">' +
      '  <img src="assets/images/' + souza.file + '" alt="' + title + '" loading="lazy">' +
      "</a>" +
      '<div class="card-info">' +
      '  <h2 class="card-title">' +
      '    <span class="card-number">#' + number + ":</span> " + title +
      "  </h2>" +
      '  <div class="card-authors">' +
      '    <a href="https://github.com/' + souza.author + '" target="_blank" rel="noopener" title="' + souza.author + '">' +
      '      <img src="https://github.com/' + souza.author + '.png?size=64" alt="' + souza.author + '" width="28" height="28" loading="lazy">' +
      "    </a>" +
      "  </div>" +
      "</div>";

    grid.prepend(card);
  });
})();
