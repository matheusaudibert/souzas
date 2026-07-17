(function () {
  "use strict";

  var STORAGE_KEY = "souzadex-quiz";
  var OPTION_COUNT = 4;

  var board = document.getElementById("quiz");

  function titleFromFile(file) {
    return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").toLowerCase();
  }

  // Imagens vêm direto do repo no GitHub, não do build da Vercel: assim uma
  // imagem nova aparece sem precisar de um novo deploy.
  function imageUrl(file) {
    return "https://raw.githubusercontent.com/matheusaudibert/souzadex/main/assets/images/" + encodeURIComponent(file);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  // Placar persistido no navegador: sequência atual e recorde.
  function loadStats() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === "object") {
        return {
          streak: saved.streak || 0,
          best: saved.best || 0
        };
      }
    } catch (e) { /* storage indisponível ou JSON corrompido: recomeça */ }
    return { streak: 0, best: 0 };
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) { /* modo privado/quota: o jogo segue sem persistir */ }
  }

  var stats = loadStats();
  var souzas = [];
  var round = null; // { souza, number, title, options, done }
  var lastFile = null;

  function randomInt(n) {
    return Math.floor(Math.random() * n);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randomInt(i + 1);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function newRound() {
    // Sorteia o souza da rodada, evitando repetir o da rodada anterior.
    var index;
    do {
      index = randomInt(souzas.length);
    } while (souzas.length > 1 && souzas[index].file === lastFile);
    var souza = souzas[index];
    lastFile = souza.file;

    // Alternativas erradas: títulos de outros souzas, sem duplicatas.
    var title = titleFromFile(souza.file);
    var pool = shuffle(souzas.slice());
    var options = [title];
    for (var i = 0; i < pool.length && options.length < OPTION_COUNT; i++) {
      var other = titleFromFile(pool[i].file);
      if (options.indexOf(other) === -1) options.push(other);
    }

    round = {
      souza: souza,
      number: index + 1,
      title: title,
      options: shuffle(options),
      done: false
    };
    renderRound();
  }

  function statsHtml() {
    return (
      '<div class="quiz-stats">' +
      '<span class="quiz-stat">Sequência: <strong>' + stats.streak + "</strong></span>" +
      '<span class="quiz-stat">Recorde: <strong>' + stats.best + "</strong></span>" +
      "</div>"
    );
  }

  function renderRound() {
    var html =
      statsHtml() +
      '<div class="quiz-card">' +
      '  <div class="quiz-image">' +
      '    <div class="quiz-image-clip">' +
      '      <img src="' + imageUrl(round.souza.file) + '" alt="Souza misterioso">' +
      "    </div>" +
      "  </div>" +
      '  <div class="quiz-options">' +
      round.options.map(function (option) {
        return (
          '<button class="quiz-option" type="button" data-title="' + escapeHtml(option) + '">' +
          escapeHtml(option) +
          "</button>"
        );
      }).join("") +
      "  </div>" +
      '  <div class="quiz-footer" hidden>' +
      '    <p class="quiz-result"></p>' +
      '    <div class="quiz-actions">' +
      '      <button class="quiz-next" type="button">Próximo souza</button>' +
      "    </div>" +
      "  </div>" +
      "</div>";

    board.innerHTML = html;

    var buttons = Array.prototype.slice.call(board.querySelectorAll(".quiz-option"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        answerRound(this, buttons);
      });
    });

    board.querySelector(".quiz-next").addEventListener("click", newRound);

    // Imagem quebrada: encerra a rodada sem contar ponto e oferece a próxima.
    board.querySelector(".quiz-image img").addEventListener("error", function () {
      if (round.done) return;
      round.done = true;
      buttons.forEach(function (b) { b.disabled = true; });
      finishRound("Não deu para carregar essa imagem. Vamos para a próxima!");
    });
  }

  function answerRound(button, buttons) {
    if (round.done) return;
    round.done = true;

    var hit = button.getAttribute("data-title") === round.title;

    if (hit) {
      stats.streak++;
      if (stats.streak > stats.best) stats.best = stats.streak;
    } else {
      stats.streak = 0;
    }
    saveStats();

    buttons.forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute("data-title") === round.title) b.classList.add("correct");
    });
    if (!hit) button.classList.add("wrong");

    var detailHref = "souza.html?foto=" + encodeURIComponent(round.souza.file);
    finishRound(
      (hit ? "Acertou! É o " : "Errou! Era o ") +
      '<a href="' + detailHref + '">#' + round.number + ": " + escapeHtml(round.title) + "</a>."
    );
  }

  // Revela a silhueta, atualiza o placar e mostra o rodapé da rodada.
  function finishRound(resultHtml) {
    board.querySelector(".quiz-image").classList.add("revealed");
    board.querySelector(".quiz-stats").outerHTML = statsHtml();
    var footer = board.querySelector(".quiz-footer");
    footer.querySelector(".quiz-result").innerHTML = resultHtml;
    footer.hidden = false;
    footer.querySelector(".quiz-next").focus();
  }

  fetch("/api/souzas")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(function (data) {
      // Com menos de 2 souzas não há o que adivinhar.
      if (!Array.isArray(data) || data.length < 2) {
        board.innerHTML = '<p class="empty">Ainda não há souzas suficientes para o quiz.</p>';
        return;
      }
      souzas = data;
      newRound();
    })
    .catch(function () {
      board.innerHTML = '<p class="empty">Não foi possível carregar o quiz. Tente recarregar a página.</p>';
    });
})();
