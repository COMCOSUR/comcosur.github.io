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
