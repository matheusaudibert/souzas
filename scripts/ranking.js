(function () {
  "use strict";

  var list = document.getElementById("ranking-list");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  function render(souzas) {
    var groups = {};
    souzas.forEach(function (souza) {
      var key = souza.authorId ? "id:" + souza.authorId : "name:" + souza.author;
      if (!groups[key]) {
        groups[key] = { author: souza.author, authorId: souza.authorId, images: [] };
      }
      // mantém o username mais recente do JSON caso o @ tenha mudado entre entradas
      groups[key].author = souza.author;
      groups[key].images.push(souza);
    });

    var ranked = Object.keys(groups)
      .map(function (key) { return groups[key]; })
      .sort(function (a, b) { return b.images.length - a.images.length; });

    ranked.forEach(function (entry, index) {
      var rank = index + 1;
      var count = entry.images.length;
      var avatarUrl = entry.authorId
        ? "https://avatars.githubusercontent.com/u/" + entry.authorId + "?s=128"
        : "https://github.com/" + entry.author + ".png?size=128";

      var item = document.createElement("div");
      item.className = "ranking-item";
      if (rank === 1) item.classList.add("ranking-item--gold");
      else if (rank === 2) item.classList.add("ranking-item--silver");
      else if (rank === 3) item.classList.add("ranking-item--bronze");

      var label = count === 1 ? "imagem" : "imagens";

      var header = document.createElement("div");
      header.className = "ranking-item-header";
      header.innerHTML =
        '<span class="ranking-position">' + rank + '</span>' +
        '<img class="ranking-avatar" src="' + avatarUrl + '" alt="' + entry.author + '" width="48" height="48" loading="lazy">' +
        '<a class="ranking-name" href="https://github.com/' + entry.author + '" target="_blank" rel="noopener">' + entry.author + '</a>' +
        '<span class="ranking-count">' + count + ' ' + label + '</span>' +
        '<svg class="ranking-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
        '<path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z"/>' +
        '</svg>';

      var images = document.createElement("div");
      images.className = "ranking-images";

      entry.images.forEach(function (souza) {
        var title = titleFromFile(souza.file);
        var thumb = document.createElement("a");
        thumb.href = "souza.html?foto=" + encodeURIComponent(souza.file);
        thumb.className = "ranking-thumb";
        thumb.title = title;
        thumb.innerHTML = '<img src="assets/images/' + souza.file + '" alt="' + title + '" loading="lazy">';
        images.appendChild(thumb);
      });

      header.addEventListener("click", function (e) {
        if (e.target.closest("a.ranking-name")) return;
        item.classList.toggle("ranking-item--open");
      });

      item.appendChild(header);
      item.appendChild(images);
      list.appendChild(item);
    });
  }

  fetch("/api/souzas")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      list.innerHTML = '<p class="empty">Não foi possível carregar o ranking. Tente recarregar a página.</p>';
    });
})();
