class Cg < Formula
  desc "Terminal-native typed clipboard for AI-assisted developers"
  homepage "https://clipgate.github.io"
  version "0.2.0"
  license :cannot_represent

  # Placeholder until the first tagged release publishes site-hosted archives.
  # After that, the CLI release workflow rewrites this formula automatically.
  if OS.mac? && Hardware::CPU.arm?
    url "https://clipgate.github.io/releases/v0.2.0/cg-aarch64-apple-darwin.tar.gz"
    sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  elsif OS.mac?
    url "https://clipgate.github.io/releases/v0.2.0/cg-x86_64-apple-darwin.tar.gz"
    sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  elsif Hardware::CPU.arm?
    url "https://clipgate.github.io/releases/v0.2.0/cg-aarch64-unknown-linux-gnu.tar.gz"
    sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  else
    url "https://clipgate.github.io/releases/v0.2.0/cg-x86_64-unknown-linux-gnu.tar.gz"
    sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  end

  def install
    bin.install "cg"
  end

  test do
    assert_match "Clip Gate", shell_output("#{bin}/cg version")
  end
end
