(function () {
  "use strict";

  var header = document.querySelector(".header");
  var toggle = document.querySelector(".menu-toggle");

  if (!header || !toggle) return;

  function setOpen(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("menu-open"));
  });

  // Fecha o menu ao clicar em um link ou fora do header.
  header.querySelectorAll(".header-menu a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (header.classList.contains("menu-open") && !header.contains(event.target)) {
      setOpen(false);
    }
  });
})();
