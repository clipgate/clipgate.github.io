#!/bin/sh
# Clip Gate installer — https://clipgate.github.io
# Usage: curl -fsSL https://clipgate.github.io/install.sh | sh
set -e

REPO="alok-tiwari/clip-gate"
BINARY="cg"
INSTALL_DIR="/usr/local/bin"

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
            *)      echo "Error: unsupported architecture ${ARCH} on Linux"; exit 1 ;;
        esac
        ;;
    *)
        echo "Error: unsupported OS ${OS}"
        exit 1
        ;;
esac

# Get latest release tag
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "${LATEST}" ]; then
    echo "Error: could not determine latest release"
    exit 1
fi

URL="https://github.com/${REPO}/releases/download/${LATEST}/${TARGET}.tar.gz"

echo "Installing Clip Gate ${LATEST} for ${OS} (${ARCH})..."
echo "Downloading ${URL}"

# Download and extract
TMPDIR=$(mktemp -d)
curl -fsSL "${URL}" | tar xz -C "${TMPDIR}"

# Install
if [ -w "${INSTALL_DIR}" ]; then
    mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
else
    echo "Need sudo to install to ${INSTALL_DIR}"
    sudo mv "${TMPDIR}/${BINARY}" "${INSTALL_DIR}/${BINARY}"
fi

chmod +x "${INSTALL_DIR}/${BINARY}"
rm -rf "${TMPDIR}"

echo ""
echo "Clip Gate installed successfully!"
echo "Run 'cg --help' to get started."
echo ""
echo "Tip: add shell integration to your profile:"
echo "  echo 'eval \"\$(cg shell-init)\"' >> ~/.zshrc"
