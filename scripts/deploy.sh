#!/usr/bin/env bash
# Build for the /vorschule/ sub-path and atomically swap it into the nginx
# web root on the Hetzner box that serves meramie.cc.
#
#   scripts/deploy.sh
#
# Env overrides:
#   DEPLOY_HOST      ssh host alias (default: hetzner-donnaevolution)
#   DEPLOY_DEST      directory on the host (default: html/meramie/vorschule of the meracoach checkout)
#   DEPLOY_SSH_OPTS  extra ssh options, e.g. "-o IdentityAgent=none -o UseKeychain=yes"
#   BASE             URL base (default: /vorschule/)
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${DEPLOY_HOST:-hetzner-donnaevolution}"
DEST="${DEPLOY_DEST:-/opt/meracoach/meracoach/html/meramie/vorschule}"
BASE="${BASE:-/vorschule/}"
# shellcheck disable=SC2206
SSH_OPTS=(${DEPLOY_SSH_OPTS:-})

echo "▶ build (base=$BASE)"
VITE_BASE="$BASE" npm run build >/dev/null

echo "▶ upload to $HOST:$DEST"
COPYFILE_DISABLE=1 tar --no-xattrs -C dist -czf - . 2>/dev/null | ssh "${SSH_OPTS[@]}" "$HOST" "
  set -e
  rm -rf '$DEST.new' '$DEST.old'
  mkdir -p '$DEST.new'
  tar -C '$DEST.new' -xzf -
  if [ -d '$DEST' ]; then mv '$DEST' '$DEST.old'; fi
  mv '$DEST.new' '$DEST'
  rm -rf '$DEST.old'
  echo '  swapped'
"

URL="https://meramie.cc${BASE}"
echo "▶ verify $URL"
code=$(curl -s -o /dev/null -w '%{http_code}' "$URL")
echo "  HTTP $code"
[ "$code" = "200" ]
