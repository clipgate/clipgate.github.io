class Cg < Formula
  desc "Terminal-native typed clipboard for AI-assisted developers"
  homepage "https://clipgate.github.io"
  version "0.1.3"
  license :cannot_represent

  if OS.mac? && Hardware::CPU.arm?
    url "https://clipgate.github.io/releases/v0.1.3/cg-aarch64-apple-darwin.tar.gz"
    sha256 "9c54dcc5217740d36430f543413d555a62a450e382905562900d3757dc4a7f76"
  elsif OS.mac?
    url "https://clipgate.github.io/releases/v0.1.3/cg-x86_64-apple-darwin.tar.gz"
    sha256 "3d2126a973431afc9555593ab46a69ed4694d2a38db858c5382145853cfeb133"
  elsif Hardware::CPU.arm?
    url "https://clipgate.github.io/releases/v0.1.3/cg-aarch64-unknown-linux-gnu.tar.gz"
    sha256 "5fec878ca9d0f9de2ca858f77a08d9500c2f5c01e64287c966c0b948c7484dd9"
  else
    url "https://clipgate.github.io/releases/v0.1.3/cg-x86_64-unknown-linux-gnu.tar.gz"
    sha256 "ba3cb97c882ea9751c1b20a3c04bea30ae7eaec64945a2290e50499a18b12d97"
  end

  def install
    bin.install "cg"
  end

  test do
    assert_match "Clip Gate", shell_output("#{bin}/cg version")
  end
end
