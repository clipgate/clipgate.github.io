# Self-hosted fonts — migration guide

This directory holds the `.woff2` font files served by `/assets/fonts.css`.
Nothing is committed here yet. To populate it and cut the site's dependency
on `fonts.googleapis.com` / `fonts.gstatic.com`, follow the four steps below.

---

## 1. Download the fonts

From the **site repo root** (the directory that contains `index.html`):

```bash
bash scripts/download-fonts.sh
```

The script:

- Fetches Google Fonts' CSS manifest with a real Chrome user-agent (so Google
  serves modern `.woff2` files, not legacy `.woff` / `.ttf`).
- Parses out the 7 latin `.woff2` URLs.
- Downloads each one into `assets/fonts/`.
- Is idempotent — re-running it will skip files already on disk (>5KB).
- Fails loudly (non-zero exit) if anything goes wrong.

Requires: `curl`. Network access to `fonts.googleapis.com` and
`fonts.gstatic.com`.

---

## 2. Confirm the expected files landed

After the script finishes, `assets/fonts/` should contain exactly these 7
files:

```
inter-400.woff2
inter-500.woff2
inter-600.woff2
inter-700.woff2
jetbrains-mono-400.woff2
jetbrains-mono-500.woff2
jetbrains-mono-600.woff2
```

Quick check:

```bash
ls -lh assets/fonts/*.woff2
```

Each file should be roughly 10–35 KB. A file smaller than 5 KB is a bad
download — delete it and re-run the script.

---

## 3. Swap the HTML `<link>` tags

In **every HTML file** that currently loads Google Fonts, replace this
three-line block:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

with this single line:

```html
<link rel="stylesheet" href="/assets/fonts.css">
```

Files to update (non-exhaustive — grep `fonts.googleapis.com` first):

- `index.html`
- `404.html`
- `ext/index.html`
- `ext/contact/index.html`
- `ext/privacy/index.html`
- `docs/index.html`, `support/index.html`, `privacy/index.html`,
  `license/index.html`, `releases/index.html`
- `blog/index.html` and every `blog/*/index.html`

One-shot grep to find stragglers:

```bash
grep -rln "fonts.googleapis.com" .
```

---

## 4. Test locally

```bash
python3 -m http.server 8000
# then visit:
#   http://localhost:8000/
#   http://localhost:8000/ext/
#   http://localhost:8000/blog/
#   http://localhost:8000/support/
```

Open DevTools → Network, filter by `font`. You should see:

- `fonts.css` served from your origin (200).
- Seven `*.woff2` requests to your origin — **no** requests to
  `fonts.gstatic.com` or `fonts.googleapis.com`.
- Font rendering should look identical to before.

Spot-check pages that use monospace (release notes, blog code blocks) to
confirm JetBrains Mono still loads.

---

## 5. Expected savings

| Before (Google Fonts)                        | After (self-hosted)           |
| -------------------------------------------- | ----------------------------- |
| ~180 KB over 2 extra round trips (googleapis + gstatic, separate TLS handshakes) | ~70 KB, 0 extra round trips (same origin, same cache) |
| Third-party cookie / referer leak on every page load | Zero third-party requests |
| Subject to Google Fonts outages              | Served with the rest of the site |

On a cold cache you should see first-paint improve noticeably on slow
connections; on warm cache the win is eliminating two DNS + TLS round trips.

---

## Tradeoffs made in this audit (item #19)

- **Dropped Inter 300 and Inter 800.** The original Google Fonts link loaded
  8 Inter weights. Audit noted 8 is excessive for this site; only 400/500/600/700
  are actually used in the CSS. If you later introduce `font-weight: 300` or
  `font-weight: 800` anywhere, add a new `@font-face` block in
  `assets/fonts.css` **and** extend the weight list in the
  `scripts/download-fonts.sh` `CSS_URL` variable, then re-run the script.
- **JetBrains Mono kept at 400/500/600** — the three weights the site uses
  for inline code, code blocks, and emphasized code.
- **Latin subset only.** `unicode-range` is restricted to the Google-standard
  latin subset (`U+0000-00FF` plus a handful of typographic codepoints).
  Non-latin characters (Cyrillic, Greek, Vietnamese, extended latin) will
  fall back to system fonts. This is the single biggest byte-size win. If
  you add non-English content later, download additional subset files and
  add corresponding `@font-face` blocks with narrower `unicode-range`s.
- **`font-display: swap`** — preserves Google Fonts' default behaviour; text
  renders in a fallback immediately, then swaps in the web font when ready.
- **Path convention:** `/assets/fonts/{family}-{weight}.woff2`, absolute
  URLs from the site root. If you host the site under a subpath, change the
  paths in `assets/fonts.css` accordingly.

---

## Rollback

If something breaks, revert the HTML `<link>` swap in step 3. The Google
Fonts request is a pure URL change — nothing else in the site depends on
these files existing.
