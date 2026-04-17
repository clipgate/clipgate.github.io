#!/bin/sh
# Clip Gate installer — https://clipgate.github.io
# Usage: curl -fsSL https://clipgate.github.io/install.sh | sh
set -e

BINARY="cg"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BASE_URL="https://clipgate.github.io/releases"
TMPDIR=""

cleanup() {
    if [ -n "${TMPDIR}" ] && [ -d "${TMPDIR}" ]; then
        rm -rf "${TMPDIR}"
    fi
}

trap cleanup EXIT

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Darwin)
        case "${ARCH}" in
            arm64)  TARGET="cg-aarch64-apple-darwin" ;;
            x86_64) TARGET="cg-x86_64-apple-darwin" ;;
            *)      echo "Error: unsupported architecture ${ARCH} on macOS"; exit 1 ;;
        esac
        ;;
    Linux)
        case "${ARCH}" in
            x86_64) TARGET="cg-x86_64-unknown-linux-gnu" ;;
            arm64|aarch64) TARGET="cg-aarch64-unknown-linux-gnu" ;;
            *)      echo "Error: unsupported architecture ${ARCH} on Linux"; exit 1 ;;
        esac
        ;;
    *)
        echo "Error: unsupported OS ${OS}"
        echo "Use 'pip install clipgate' or download a manual binary from https://clipgate.github.io/releases/."
        exit 1
        ;;
esac

# Get latest release tag from the public site
LATEST=$(curl -fsSL "${BASE_URL}/latest.txt" | tr -d '[:space:]')

if [ -z "${LATEST}" ]; then
    echo "Error: could not determine latest release"
    exit 1
fi

URL="${BASE_URL}/${LATEST}/${TARGET}.tar.gz"

echo "Installing Clip Gate ${LATEST} for ${OS} (${ARCH})..."
echo "Downloading ${URL}"

# Download and extract
TMPDIR=$(mktemp -d)
ARCHIVE="${TMPDIR}/${TARGET}.tar.gz"

if ! curl -fsSL "${URL}" -o "${ARCHIVE}"; then
    echo "Error: failed to download ${URL}"
    echo "Check https://clipgate.github.io/releases/ for manual downloads and release status."
    exit 1
fi

# Verify SHA256 checksum before extracting
SHA_URL="${URL}.sha256"
SHA_FILE="${ARCHIVE}.sha256"

if ! curl -fsSL "${SHA_URL}" -o "${SHA_FILE}"; then
    echo "Error: failed to download checksum ${SHA_URL}"
    echo "Refusing to extract an unverified archive. Please re-run the installer."
    exit 1
fi

EXPECTED_SHA=$(awk '{print $1}' "${SHA_FILE}")

if [ -z "${EXPECTED_SHA}" ]; then
    echo "Error: checksum file ${SHA_URL} is empty or malformed"
    exit 1
fi

if command -v shasum >/dev/null 2>&1; then
    ACTUAL_SHA=$(shasum -a 256 "${ARCHIVE}" | awk '{print $1}')
elif command -v sha256sum >/dev/null 2>&1; then
    ACTUAL_SHA=$(sha256sum "${ARCHIVE}" | awk '{print $1}')
elif command -v openssl >/dev/null 2>&1; then
    ACTUAL_SHA=$(openssl dgst -sha256 "${ARCHIVE}" | awk '{print $NF}')
else
    echo "Error: no SHA256 tool found (need shasum, sha256sum, or openssl)"
    exit 1
fi

if [ "${EXPECTED_SHA}" != "${ACTUAL_SHA}" ]; then
    printf '\033[1;31mError: SHA256 mismatch for %s\033[0m\n' "${TARGET}.tar.gz"
    echo "  expected: ${EXPECTED_SHA}"
    echo "  actual:   ${ACTUAL_SHA}"
    echo "Refusing to extract. The download may be corrupted or tampered with."
    exit 1
fi

printf '\033[2m  ✓ SHA256 verified\033[0m\n'

tar xzf "${ARCHIVE}" -C "${TMPDIR}"

# Install
if [ -w "${INSTALL_DIR}" ]; then
    mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
else
    echo "Need sudo to install to ${INSTALL_DIR}"
    sudo mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
fi

chmod +x "${INSTALL_DIR}/${BINARY}"

# Create 'clipgate' symlink so both commands work
if [ -w "${INSTALL_DIR}" ]; then
    ln -sf "${INSTALL_DIR}/${BINARY}" "${INSTALL_DIR}/clipgate"
else
    sudo ln -sf "${INSTALL_DIR}/${BINARY}" "${INSTALL_DIR}/clipgate"
fi

echo ""
echo "Clip Gate installed successfully!"
echo "Run 'cg --help' or 'clipgate --help' to get started."
echo ""
echo "Tip: add shell integration to your profile:"
echo "  echo 'eval \"\$(cg shell-init)\"' >> ~/.zshrc"
