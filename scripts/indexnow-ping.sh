#!/usr/bin/env bash
# IndexNow ping — notify Bing, Yandex, Seznam, and other IndexNow participants
# that one or more URLs on clipgate.github.io have been published or updated.
#
# Usage:
#   ./scripts/indexnow-ping.sh                       # pings the full default URL list below
#   ./scripts/indexnow-ping.sh URL [URL ...]         # pings only the URLs you pass in
#
# Setup (one-time, already done if this script is in the repo):
#   1. The key file 43f8357a1224843f830e497b8c28e6a1882372a88b40189ef74f56460a877897.txt
#      is hosted at https://clipgate.github.io/<key>.txt and contains exactly
#      that key string. IndexNow validates ownership by fetching it.
#   2. Run this script after every publish.
#
# Notes:
#   - Pinging api.indexnow.org notifies every IndexNow participant at once
#     (Bing, Yandex, Seznam, Naver, etc.).
#   - 200 / 202 are success. 422 means the URL is not on the verified host.
#   - Submit no more than ~10,000 URLs/day.

set -euo pipefail

HOST="clipgate.github.io"
KEY="43f8357a1224843f830e497b8c28e6a1882372a88b40189ef74f56460a877897"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
ENDPOINT="https://api.indexnow.org/IndexNow"

# Default URL list — edit when adding new pages, or pass URLs as arguments
DEFAULT_URLS=(
  "https://clipgate.github.io/"
  "https://clipgate.github.io/blog/"
  "https://clipgate.github.io/blog/best-clipboard-manager-for-developers-2026/"
  "https://clipgate.github.io/blog/accidentally-pasted-password-or-api-key/"
  "https://clipgate.github.io/ext/"
  "https://clipgate.github.io/docs/"
  "https://clipgate.github.io/releases/"
)

if [ "$#" -gt 0 ]; then
  URLS=("$@")
else
  URLS=("${DEFAULT_URLS[@]}")
fi

# Build the JSON payload (urlList as a JSON array)
url_list_json=$(printf '"%s",' "${URLS[@]}")
url_list_json="[${url_list_json%,}]"

payload=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": ${url_list_json}
}
EOF
)

echo "Submitting ${#URLS[@]} URL(s) to IndexNow..."
echo "${URLS[@]}" | tr ' ' '\n' | sed 's/^/  - /'
echo

http_status=$(curl -sS -o /tmp/indexnow-response.txt -w "%{http_code}" \
  -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "${payload}")

echo "HTTP ${http_status}"
if [ "${http_status}" = "200" ] || [ "${http_status}" = "202" ]; then
  echo "Success — Bing/Yandex/Seznam notified."
else
  echo "Response body:"
  cat /tmp/indexnow-response.txt
  exit 1
fi
