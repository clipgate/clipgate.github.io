#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# download-fonts.sh
#
# Fetches Inter (400/500/600/700) and JetBrains Mono (400/500/600) .woff2
# files from Google Fonts and places them in assets/fonts/ using the
# filename convention expected by assets/fonts.css:
#
#   assets/fonts/inter-{400,500,600,700}.woff2
#   assets/fonts/jetbrains-mono-{400,500,600}.woff2
#
# Run from the site repo root:
#
#   bash scripts/download-fonts.sh
#
# Idempotent: skips files that already exist and pass the sanity check.
# ---------------------------------------------------------------------------

set -eu

# POSIX-ish: prefer bash features but keep it portable.
RED=$'\033[0;31m'
GRN=$'\033[0;32m'
YLW=$'\033[0;33m'
DIM=$'\033[2m'
RST=$'\033[0m'

log()  { printf '%s\n' "$*"; }
ok()   { printf '%s[ ok ]%s %s\n'   "$GRN" "$RST" "$*"; }
warn() { printf '%s[warn]%s %s\n'   "$YLW" "$RST" "$*"; }
err()  { printf '%s[err ]%s %s\n'   "$RED" "$RST" "$*" >&2; }

# ---------------------------------------------------------------------------
# 1. prerequisites
# ---------------------------------------------------------------------------
if ! command -v curl >/dev/null 2>&1; then
  err "curl is required but not found on PATH."
  exit 1
fi

# Find repo root: assume this script is in scripts/ at the repo root.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FONTS_DIR="$REPO_ROOT/assets/fonts"

mkdir -p "$FONTS_DIR"
log "${DIM}repo root:${RST} $REPO_ROOT"
log "${DIM}fonts dir:${RST} $FONTS_DIR"
log ""

# Realistic Chrome UA so Google serves .woff2 (not legacy .woff/.ttf).
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

CSS_URL='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'

# ---------------------------------------------------------------------------
# 2. fetch Google's CSS2 response
# ---------------------------------------------------------------------------
log "Fetching Google Fonts CSS manifest..."
CSS_BODY="$(curl -fsSL -A "$UA" "$CSS_URL" || true)"
if [ -z "$CSS_BODY" ]; then
  err "Failed to fetch CSS from $CSS_URL"
  err "Check your network / DNS and retry."
  exit 2
fi
ok "CSS manifest received ($(printf '%s' "$CSS_BODY" | wc -c | tr -d ' ') bytes)"
log ""

# ---------------------------------------------------------------------------
# 3. parse @font-face blocks -> (family, weight, url) tuples
#
# Google's CSS2 looks roughly like:
#
#   /* latin */
#   @font-face {
#     font-family: 'Inter';
#     font-style: normal;
#     font-weight: 400;
#     font-display: swap;
#     src: url(https://fonts.gstatic.com/s/inter/v.../....woff2) format('woff2');
#     unicode-range: U+0000-00FF, ...;
#   }
#
# We only want the latin subset (the one whose unicode-range starts U+0000).
# ---------------------------------------------------------------------------

TMP_MANIFEST="$(mktemp -t clipgate-fonts.XXXXXX)"
trap 'rm -f "$TMP_MANIFEST"' EXIT

# awk: walk @font-face blocks, remember family/weight/src/range, emit only
# the latin subset rows as TSV: family<TAB>weight<TAB>url
printf '%s' "$CSS_BODY" | awk '
  /@font-face/ { in_block=1; family=""; weight=""; url=""; range=""; next }
  in_block && /font-family:/ {
    # e.g.   font-family: '\''Inter'\'';
    line=$0
    sub(/.*font-family: *['\''"]/, "", line)
    sub(/['\''"].*/, "", line)
    family=line
  }
  in_block && /font-weight:/ {
    line=$0
    sub(/.*font-weight: *\t*/, "", line)
    sub(/[^0-9].*/, "", line)
    weight=line
  }
  in_block && /src: *url\(/ {
    line=$0
    sub(/.*src: *url\(/, "", line)
    sub(/\).*/, "", line)
    url=line
  }
  in_block && /unicode-range:/ {
    range=$0
  }
  in_block && /}/ {
    if (range ~ /U\+0000/ && url != "" && family != "" && weight != "") {
      printf "%s\t%s\t%s\n", family, weight, url
    }
    in_block=0
  }
' > "$TMP_MANIFEST"

MANIFEST_LINES=$(wc -l < "$TMP_MANIFEST" | tr -d ' ')
if [ "$MANIFEST_LINES" -lt 7 ]; then
  err "Expected at least 7 latin @font-face entries, found $MANIFEST_LINES."
  err "Google may have changed its CSS format, or UA filtering failed."
  err "Dump of parsed manifest:"
  cat "$TMP_MANIFEST" >&2
  exit 3
fi
ok "Parsed $MANIFEST_LINES latin @font-face entries"
log ""

# ---------------------------------------------------------------------------
# 4. map (family, weight) -> local filename
# ---------------------------------------------------------------------------
slug_for_family() {
  case "$1" in
    Inter)              printf 'inter' ;;
    'JetBrains Mono')   printf 'jetbrains-mono' ;;
    *)                  printf 'unknown' ;;
  esac
}

EXPECTED="inter-400.woff2 inter-500.woff2 inter-600.woff2 inter-700.woff2 jetbrains-mono-400.woff2 jetbrains-mono-500.woff2 jetbrains-mono-600.woff2"

downloaded=0
skipped=0
failed=0

# ---------------------------------------------------------------------------
# 5. download loop
# ---------------------------------------------------------------------------
while IFS="$(printf '\t')" read -r family weight url; do
  [ -z "$family" ] && continue
  slug="$(slug_for_family "$family")"
  if [ "$slug" = "unknown" ]; then
    warn "Skipping unknown family: $family"
    continue
  fi

  fname="${slug}-${weight}.woff2"
  dest="$FONTS_DIR/$fname"

  # Only keep the weights we care about (defensive; CSS2 should already limit).
  case "$fname" in
    $EXPECTED) ;;
    *)
      # glob above won't expand words — fall back to explicit check
      case " $EXPECTED " in
        *" $fname "*) ;;
        *) warn "Skipping unrequested weight: $fname"; continue ;;
      esac
      ;;
  esac

  if [ -f "$dest" ]; then
    size=$(wc -c < "$dest" | tr -d ' ')
    if [ "$size" -gt 5120 ]; then
      ok "skip   $fname  (already present, ${size} bytes)"
      skipped=$((skipped + 1))
      continue
    else
      warn "re-downloading $fname (existing file is only ${size} bytes)"
    fi
  fi

  log "fetch  $fname"
  log "       <- $url"
  if ! curl -fsSL -A "$UA" -o "$dest" "$url"; then
    err "curl failed for $fname"
    rm -f "$dest"
    failed=$((failed + 1))
    continue
  fi

  size=$(wc -c < "$dest" | tr -d ' ')
  if [ "$size" -lt 5120 ]; then
    err "$fname is only ${size} bytes (<5KB) — likely truncated"
    rm -f "$dest"
    failed=$((failed + 1))
    continue
  fi

  ok "got    $fname  (${size} bytes)"
  downloaded=$((downloaded + 1))
done < "$TMP_MANIFEST"

log ""
log "---------------------------------------------------------------"
log "Summary:"
log "  downloaded: $downloaded"
log "  skipped   : $skipped  (already present)"
log "  failed    : $failed"
log "  fonts dir : $FONTS_DIR"
log "---------------------------------------------------------------"

# ---------------------------------------------------------------------------
# 6. final verification: all 7 expected files must exist and be >5KB
# ---------------------------------------------------------------------------
missing=0
for fname in $EXPECTED; do
  dest="$FONTS_DIR/$fname"
  if [ ! -f "$dest" ]; then
    err "missing: $fname"
    missing=$((missing + 1))
    continue
  fi
  size=$(wc -c < "$dest" | tr -d ' ')
  if [ "$size" -lt 5120 ]; then
    err "suspicious (<5KB): $fname ($size bytes)"
    missing=$((missing + 1))
  fi
done

if [ "$missing" -gt 0 ] || [ "$failed" -gt 0 ]; then
  err "Done with errors: $missing missing/suspicious, $failed failed."
  exit 4
fi

ok "All 7 font files present and sane."
log "Next: edit HTML to swap the Google Fonts <link> tags for:"
log "  <link rel=\"stylesheet\" href=\"/assets/fonts.css\">"
log "See assets/fonts/README.md for the full checklist."
exit 0
