(function () {
  const page = document.body.dataset.page || "";
  const headerMount = document.getElementById("cgSiteHeader");
  const footerMount = document.getElementById("cgSiteFooter");

  const navItems = [
    { href: "/docs/", label: "Docs", key: "docs" },
    { href: "/releases/", label: "Release Notes", key: "releases" },
    { href: "/support/", label: "Support", key: "support" },
    { href: "/license/", label: "License", key: "license" }
  ];

  if (headerMount) {
    const navLinks = navItems
      .map((item) => {
        const active = item.key === page ? "active" : "";
        return `<a href="${item.href}" class="${active}">${item.label}</a>`;
      })
      .join("");

    headerMount.innerHTML = `
      <header class="cg-site-header">
        <a class="cg-site-logo" href="/">
          <span style="color:var(--cyan,#00d4ff);font-family:'JetBrains Mono',monospace;font-weight:700;margin-right:0.1rem">&gt;_</span>
          <span>clip<b>gate</b></span>
        </a>
        <nav class="cg-site-nav">
          ${navLinks}
          <a href="/ext" class="cg-site-ext">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            Browser Extension
          </a>
          <button class="cg-site-nav-cta" type="button" data-install-nav>Install Free</button>
        </nav>
      </header>
      <div class="cg-site-header-spacer" aria-hidden="true"></div>
    `;

    const installBtn = headerMount.querySelector("[data-install-nav]");
    if (installBtn) {
      installBtn.addEventListener("click", function () {
        window.location.href = "/#install";
      });
    }
  }

  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="cg-site-footer">
        <div class="cg-footer-inner">
          <div class="cg-footer-section">
            <div class="cg-footer-brand">
              <a class="cg-site-logo" href="/">
                <span style="color:var(--cyan,#00d4ff);font-family:'JetBrains Mono',monospace;font-weight:700;margin-right:0.1rem">&gt;_</span>
                <span>clip<b>gate</b></span>
              </a>
            </div>
            <p>Terminal-native typed clipboard for AI-assisted developers.</p>
            <p style="margin-top:0.75rem;font-size:0.8rem;color:var(--text3,#6e7681)">Built with Rust · official releases hosted on the site</p>
          </div>
          <div class="cg-footer-section">
            <h4>Resources</h4>
            <div class="cg-footer-links">
              <a href="/docs/">Docs</a>
              <a href="/releases/">Release Notes</a>
              <a href="/support/">Support</a>
              <a href="/license/">License</a>
            </div>
          </div>
          <div class="cg-footer-section">
            <h4>Legal</h4>
            <div class="cg-footer-links">
              <a href="/license/">License</a>
              <a href="/ext/privacy/">Privacy</a>
            </div>
          </div>
        </div>
        <div class="cg-footer-bottom">© 2025-2026 ClipGate. All rights reserved.</div>
      </footer>
    `;
  }
})();
