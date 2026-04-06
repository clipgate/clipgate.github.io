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
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(backToTopButton);
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
