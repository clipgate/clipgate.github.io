(function () {
  const enableProgress = document.body.dataset.scrollProgress !== "false";
  const enableBackToTop = document.body.dataset.backToTop !== "false";
  const backToTopThreshold = 140;

  let progressBar = null;
  let backToTopButton = null;
  let ticking = false;

  if (enableProgress) {
    const progressRoot = document.createElement("div");
    progressRoot.className = "cg-scroll-progress";
    progressRoot.setAttribute("aria-hidden", "true");
    progressRoot.innerHTML = '<span class="cg-scroll-progress-bar"></span>';
    document.body.prepend(progressRoot);
    progressBar = progressRoot.firstElementChild;
  }

  if (enableBackToTop) {
    backToTopButton = document.createElement("button");
    backToTopButton.className = "cg-back-to-top";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0e17" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    // Belt-and-suspenders: set the critical fixed positioning + z-index inline so
    // it cannot be overridden by any per-page stylesheet, stacking-context bug,
    // or stale CSS cache. This guarantees the button always sits above the install
    // bar (z-index 9999) and any other fixed UI.
    backToTopButton.style.cssText = [
      "position:fixed",
      "right:1.75rem",
      "bottom:5.5rem",
      "width:46px",
      "height:46px",
      "border-radius:50%",
      "background:#00d4ff",
      "border:0",
      "cursor:pointer",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "opacity:0",
      "pointer-events:none",
      "transition:opacity 0.25s ease, transform 0.18s ease",
      "box-shadow:0 6px 22px rgba(0,212,255,0.35), 0 0 0 1px rgba(0,212,255,0.25)",
      "z-index:2147483647",
      "isolation:isolate"
    ].join(";") + ";";
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    // Append to documentElement instead of body, so the button is NEVER trapped
    // inside any stacking context created by body or its descendants.
    (document.documentElement || document.body).appendChild(backToTopButton);
  }

  function updateScrollUi() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    if (backToTopButton) {
      const effectiveThreshold = scrollHeight > 0
        ? Math.min(backToTopThreshold, Math.max(6, scrollHeight * 0.1))
        : backToTopThreshold;
      const visible = scrollTop > effectiveThreshold;
      backToTopButton.style.opacity = visible ? "1" : "0";
      backToTopButton.style.pointerEvents = visible ? "auto" : "none";
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateScrollUi();
      ticking = false;
    });
  }

  updateScrollUi();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateScrollUi);
  window.addEventListener("hashchange", updateScrollUi);
})();
