// ClipGate Tools — Shared Tool Chrome
// Injects:
//   • <aside id="cgToolClassifier">      → live ClipGate classifier demo
//   • <section id="cgToolRelated">       → 3 related tools (from TOOLS catalog)
//   • <section id="cgToolInstallBand">   → install CTA band at page bottom
//
// Every tool page declares these mount points and imports this module.
// See /Clip Gate Private/docs/TOOLS_STRATEGY.md §5.1 + §5.4.

import { TOOLS } from './entitlements.js';
import { classifyContent, TYPE_META } from './classifier.js';

// ─── Classifier sidebar (live ClipGate demo) ─────────────────
// Mount point: <div id="cgToolClassifier" data-watch="#selectorOfInputElement"></div>
// We listen to input on the watched element, classify its content,
// and render a compact "what ClipGate would detect" card.
function mountClassifier() {
  const mount = document.getElementById('cgToolClassifier');
  if (!mount) return;

  mount.innerHTML = `
    <div class="tool-classifier-card">
      <div class="tool-classifier-head">
        <span class="mini-label">ClipGate Demo</span>
      </div>
      <div class="tool-classifier-body">
        <div class="tool-classifier-type" id="cgClsType">—</div>
        <div class="tool-classifier-detail" id="cgClsDetail">Paste or type in the input on the left to see how ClipGate would classify this content in your clipboard history.</div>
      </div>
      <a class="tool-classifier-cta" href="/#install">
        Get it on your clipboard →
      </a>
    </div>
  `;

  const typeEl   = mount.querySelector('#cgClsType');
  const detailEl = mount.querySelector('#cgClsDetail');

  const watchSelector = mount.dataset.watch;
  if (!watchSelector) return;

  const watched = document.querySelector(watchSelector);
  if (!watched) return;

  function update() {
    const text = (watched.value ?? watched.textContent ?? '').trim();
    if (!text) {
      typeEl.textContent = '—';
      detailEl.textContent = 'Paste or type in the input to see how ClipGate would classify this content in your clipboard history.';
      return;
    }
    const result = classifyContent(text);
    const meta = TYPE_META[result.type] || TYPE_META.text;
    typeEl.textContent   = meta.label;
    detailEl.textContent = result.detail || meta.detail;
  }

  watched.addEventListener('input',  update);
  watched.addEventListener('change', update);
  // seed on mount
  update();
}

// ─── Related tools (3 cards) ─────────────────────────────────
// Mount point: <section id="cgToolRelated" data-exclude="jwt-decoder"></section>
function mountRelated() {
  const mount = document.getElementById('cgToolRelated');
  if (!mount) return;

  const exclude = (mount.dataset.exclude || '').split(',').map(s => s.trim()).filter(Boolean);
  // Prefer live tools, then planned
  const candidates = TOOLS.filter(t => !exclude.includes(t.slug));
  const ordered = [
    ...candidates.filter(t => t.status === 'live'),
    ...candidates.filter(t => t.status !== 'live'),
  ];
  const picks = ordered.slice(0, 3);

  mount.innerHTML = `
    <h2>Related tools</h2>
    <p class="lede">Free, ad-free, and 100% client-side — no signup, no tracking, no limits.</p>
    <div class="tool-related-grid">
      ${picks.map(t => `
        <a class="tool-related-card" href="/tools/${t.slug}/">
          <div class="tool-related-icon">${t.icon}</div>
          <h3>${t.name}</h3>
          <p>${t.tagline}</p>
          <span>Open ${t.name} →</span>
        </a>
      `).join('')}
    </div>
  `;
}

// ─── Install CTA band ────────────────────────────────────────
// Mount point: <section id="cgToolInstallBand"></section>
function mountInstallBand() {
  const mount = document.getElementById('cgToolInstallBand');
  if (!mount) return;

  mount.innerHTML = `
    <div class="tool-install-band">
      <div>
        <h3>These tools are from ClipGate.</h3>
        <p>ClipGate is a terminal-native clipboard vault for developers. It classifies everything you copy — secrets, errors, JSON, diffs — and keeps it local. No cloud sync, no account, no ads.</p>
      </div>
      <div class="cta-row">
        <a class="btn primary" href="/#install">Install Free</a>
        <a class="btn secondary" href="/ext/">Browser Extension</a>
      </div>
    </div>
  `;
}

// ─── Auto-mount on DOMContentLoaded ──────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mountClassifier();
    mountRelated();
    mountInstallBand();
  });
} else {
  mountClassifier();
  mountRelated();
  mountInstallBand();
}

export { mountClassifier, mountRelated, mountInstallBand };
