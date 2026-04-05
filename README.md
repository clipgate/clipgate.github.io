<div align="center">

<br>

<img src="assets/header.svg" alt=">_ ClipGate" width="600">

<br><br>

**Landing page for Clip Gate — terminal-native typed clipboard for AI-assisted developers.**

[![Live Site](https://img.shields.io/badge/live-clipgate.github.io-00d4ff?style=flat-square&logo=github)](https://clipgate.github.io)
[![Source Code](https://img.shields.io/badge/source-alok--tiwari/clip--gate-2ecc71?style=flat-square&logo=rust)](https://github.com/clipgate/clip-gate)
[![MIT License](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)](https://github.com/clipgate/clip-gate/blob/main/LICENSE)

</div>

---

## About

This repo hosts the landing page for [Clip Gate](https://github.com/clipgate/clip-gate) — deployed via GitHub Pages at [clipgate.github.io](https://clipgate.github.io).

Clip Gate auto-classifies everything developers copy into 13 meaningful types — errors, commands, paths, JSON, secrets, diffs, URLs, SQL, IPs, env vars, Docker, SHAs, and plain text. Retrieve by type, not by recency. Pack context and pipe directly to Claude, ChatGPT, or Cursor.

## Tech Stack

- Single-file static HTML with inline CSS and JS
- Zero dependencies, zero build step
- Google Fonts (Inter + JetBrains Mono)
- Deployed on GitHub Pages

## Local Development

```bash
git clone https://github.com/clipgate/clipgate.github.io.git
cd clipgate.github.io
open index.html    # or use any local server
```

## SEO

The site includes meta tags for search engines and social previews, JSON-LD structured data, a `robots.txt` allowing all crawlers, and a `sitemap.xml` submitted to search engines.

## Related Repos

| Repo | Description |
|------|-------------|
| [clipgate/clip-gate](https://github.com/clipgate/clip-gate) | Source code — Rust workspace, 11 crates, 220+ tests |
| [clipgate/clipgate.github.io](https://github.com/clipgate/clipgate.github.io) | This repo — landing page |

---

<div align="center">

**MIT License** · Built by [Alok Tiwari](https://github.com/alok-tiwari)

</div>
