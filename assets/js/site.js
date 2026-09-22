(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  if (!body) return;

  const markReady = () => {
    body.classList.add("page-ready");
    body.classList.remove("page-leaving");
  };

  if (document.readyState === "complete") {
    requestAnimationFrame(() => requestAnimationFrame(markReady));
  } else {
    window.addEventListener("load", () => {
      requestAnimationFrame(() => requestAnimationFrame(markReady));
    }, { once: true });
  }

  window.addEventListener("pageshow", markReady);

  const homeAmarasPicks = document.querySelector("[data-home-amaras-picks]");

  if (homeAmarasPicks) {
    const amaraDocuments = [
      { title: "Interpretaci&oacute;n ambiental: ejemplo CHIA", summary: "Pr&aacute;ctica educativa para conocer los v&iacute;nculos biof&iacute;sicos y culturales de un territorio.", path: "interpretacion-ambiental-ejemplo-chia.pdf" },
      { title: "Las plantas, or&iacute;genes del humano y dem&aacute;s seres vivos", summary: "Una reflexi&oacute;n sobre las plantas, la fotos&iacute;ntesis y el origen de la vida.", path: "las-plantas-origenes-del-humano-y-demas-seres-vivos.pdf" },
      { title: "Los ajos gigantes y el planeamiento", summary: "Territorio, cultivos locales y soberan&iacute;a alimentaria.", path: "los-ajos-gigantes-y-el-planeamiento.pdf" },
      { title: "Los ajos gigantes", summary: "Una mirada sobre los cultivos locales y el cuidado del territorio.", path: "los-ajos-gigantes.pdf" },
      { title: "Peligros que vienen del r&iacute;o", summary: "Memoria y an&aacute;lisis de los riesgos socioambientales en las costas del R&iacute;o de la Plata.", path: "peligros-que-vienen-del-rio.pdf" },
      { title: "Realidad, subjetividad y cambio", summary: "Una propuesta para pensar la realidad desde la acci&oacute;n y la conciencia colectiva.", path: "realidad-subjetividad-y-cambio.pdf" },
      { title: "Si el mundo cae, est&aacute; la comunidad", summary: "Comunidad, Buen Vivir y autogesti&oacute;n para imaginar otros mundos posibles.", path: "si-el-mundo-cae-esta-la-comunidad.pdf" },
      { title: "La batalla cultural", summary: "Una exploraci&oacute;n del poder simb&oacute;lico, los relatos y la dominaci&oacute;n cultural.", path: "la-batalla-cultural.pdf" },
      { title: "Bosques inteligentes", summary: "Los bosques como comunidades vivas conectadas y colaborativas.", path: "bosques-inteligentes.pdf" },
      { title: "Entendimiento y reciprocidad: el Ayni", summary: "El huerto como espacio de aprendizaje, cuidado y reciprocidad con la naturaleza.", path: "entendimiento-y-reciprocidad-el-ayni.pdf" }
    ];

    const picks = [...amaraDocuments].sort(() => Math.random() - 0.5).slice(0, 3);
    homeAmarasPicks.innerHTML = picks.map((document, index) => `
      <a class="home-link-tile" href="assets/pdf/amaras/${document.path}" target="_blank" rel="noopener">
        <span class="home-link-index">AMARAS ${String(index + 1).padStart(2, "0")}</span>
        <strong>${document.title}</strong>
        <span>${document.summary}</span>
      </a>
    `).join("");
  }
  if (prefersReducedMotion) {
    body.classList.add("page-ready");
    return;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (link.hasAttribute("download")) return;
    if (link.target && link.target !== "_self") return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;

    event.preventDefault();
    body.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 240);
  });

  const topicSearches = Array.from(document.querySelectorAll("[data-topic-search]"));

  topicSearches.forEach((searchRoot) => {
    const input = searchRoot.querySelector("[data-topic-search-input]");
    const filterButtons = Array.from(searchRoot.querySelectorAll("[data-topic-filter]"));
    const items = Array.from(searchRoot.querySelectorAll("[data-topic-item]"));
    const count = searchRoot.querySelector("[data-topic-count]");
    const empty = searchRoot.querySelector("[data-topic-empty]");

    if (!input || !items.length) return;

    let activeFilter = "all";

    const normalize = (value) =>
      (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const applyFilters = () => {
      const query = normalize(input.value.trim());
      let visibleCount = 0;

      items.forEach((item) => {
        const type = item.dataset.type || "";
        const haystack = normalize(item.dataset.search || item.textContent || "");
        const matchesType = activeFilter === "all" || type === activeFilter;
        const matchesQuery = !query || haystack.includes(query);
        const isVisible = matchesType && matchesQuery;

        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (count) {
        count.textContent = `${visibleCount} resultado${visibleCount === 1 ? "" : "s"}`;
      }

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    };

    input.addEventListener("input", applyFilters);

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.topicFilter || "all";

        filterButtons.forEach((candidate) => {
          const isActive = candidate === button;
          candidate.classList.toggle("is-active", isActive);
          candidate.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        applyFilters();
      });
    });

    applyFilters();
  });
})();
