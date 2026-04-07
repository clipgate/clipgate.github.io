(function () {
  const page = document.body.dataset.page || "";
  const headerMount = document.getElementById("cgSiteHeader");
  const footerMount = document.getElementById("cgSiteFooter");

  const navItems = [
    { href: "/docs/", label: "Docs", key: "docs" },
    { href: "/blog/", label: "Blog", key: "blog" },
    { href: "/releases/", label: "Release Notes", key: "releases" }
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
          <button class="cg-site-nav-cta" type="button" data-install-nav><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Install Free</button>
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
          <div class="cg-footer-section cg-footer-section-brand">
            <div class="cg-footer-brand">
              <a class="cg-site-logo" href="/">
                <span style="color:var(--cyan,#00d4ff);font-family:'JetBrains Mono',monospace;font-weight:700;margin-right:0.1rem">&gt;_</span>
                <span>clip<b>gate</b></span>
              </a>
            </div>
            <p class="cg-footer-tagline">Terminal-native clipboard vault for developers.</p>
            <p class="cg-footer-buildinfo">Built with Rust &middot; official releases hosted on the site</p>
          </div>
          <div class="cg-footer-section">
            <h4>Resources</h4>
            <div class="cg-footer-links">
              <a href="/docs/">Docs</a>
              <a href="/blog/">Blog</a>
              <a href="/releases/">Releases</a>
              <a href="/support/">Support</a>
              <a href="/license/">License</a>
            </div>
          </div>
          <div class="cg-footer-section">
            <h4>Product</h4>
            <div class="cg-footer-links">
              <a href="/">CLI</a>
              <a href="/ext/">Browser Extension</a>
              <a href="https://chromewebstore.google.com/detail/iceplcknbihmnogljpmdhjelckohpice" target="_blank" rel="noopener noreferrer">Chrome Web Store</a>
              <a href="/releases/">Releases</a>
            </div>
          </div>
          <div class="cg-footer-section">
            <h4>Legal</h4>
            <div class="cg-footer-links">
              <a href="/license/">License</a>
              <a href="/privacy/">Privacy</a>
              <a href="/ext/privacy/">Extension Privacy</a>
            </div>
          </div>
        </div>
        <div class="cg-footer-bottom">
          <div class="cg-footer-bottom-left">
            <span class="cg-copyright">&copy; 2025-2026 ClipGate</span>
            <span class="cg-footer-divider">&middot;</span>
            <span class="cg-footer-powered">Built with Rust</span>
          </div>
          <a href="https://chromewebstore.google.com/detail/iceplcknbihmnogljpmdhjelckohpice" class="cg-footer-cws" target="_blank" rel="noopener noreferrer">Chrome Web Store</a>
        </div>
      </footer>
    `;
  }
})();
