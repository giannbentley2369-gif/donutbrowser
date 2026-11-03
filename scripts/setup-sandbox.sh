#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version=1.99.1
target=x86_64-unknown-linux-gnu
prefix="$root/.hoplite/toolchains/rust-$version"

if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo 'The sandbox Rust setup requires x86_64 Linux.' >&2
  exit 1
fi

if [[ ! -x "$prefix/bin/rustc" ]]; then
  archive="rust-$version-$target"
  download="$(mktemp -d)"
  trap 'rm -rf "$download"' EXIT
  cd "$download"
  base="https://static.rust-lang.org/dist/$archive.tar.xz"
  curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 -O "$base" -O "$base.sha256"
  sha256sum --check "$archive.tar.xz.sha256"
  tar -xJf "$archive.tar.xz"
  "./$archive/install.sh" --prefix="$prefix" \
    --components="rustc,cargo,rust-std-$target,rustfmt-preview,clippy-preview" --disable-ldconfig
fi

packages=(
  libwebkit2gtk-4.1-dev=2.52.6-0ubuntu0.24.04.1
  libayatana-appindicator3-dev=0.5.93-1build3
  libxdo-dev=1:3.20160805.1-5build1
)
missing=false
for package in "${packages[@]}"; do
  if ! dpkg-query -W -f='${Version}' "${package%%=*}" 2>/dev/null | grep -Fxq "${package#*=}"; then
    missing=true
  fi
done
if [[ "$missing" == true ]]; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "${packages[@]}"
fi

spellcheck="$root/.hoplite/toolchains/typos-1.52.0"
if [[ ! -x "$spellcheck/typos" ]]; then
  download_typos="$(mktemp -d)"
  trap 'rm -rf "${download:-}" "$download_typos"' EXIT
  archive_typos="$download_typos/typos.tar.gz"
  curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
    https://github.com/crate-ci/typos/releases/download/v1.52.0/typos-v1.52.0-x86_64-unknown-linux-musl.tar.gz \
    -o "$archive_typos"
  printf '%s  %s\n' 6155d4114f9a0f5b8f6d4fda96266c9d5f6add71df80da7f684ee5e72eb14588 "$archive_typos" | sha256sum --check
  mkdir -p "$spellcheck"
  tar -xzf "$archive_typos" -C "$spellcheck"
fi
