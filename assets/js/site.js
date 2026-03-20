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
})();
