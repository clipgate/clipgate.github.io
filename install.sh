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

tar xzf "${ARCHIVE}" -C "${TMPDIR}"

# Install
if [ -w "${INSTALL_DIR}" ]; then
    mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
else
    echo "Need sudo to install to ${INSTALL_DIR}"
    sudo mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
fi

chmod +x "${INSTALL_DIR}/${BINARY}"

echo ""
echo "Clip Gate installed successfully!"
echo "Run 'cg --help' to get started."
echo ""
echo "Tip: add shell integration to your profile:"
echo "  echo 'eval \"\$(cg shell-init)\"' >> ~/.zshrc"
