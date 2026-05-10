#!/usr/bin/env bash
# One-time Vercel CLI bootstrap for the staging preview.
#
# Use this when GitHub-integrated deploys aren't viable (e.g. the repo lives
# under an org you can't install the Vercel GitHub App on). After the first
# successful run, redeploys are just `vercel --prod` from the repo root.
#
# Idempotent: re-running skips install/login if already configured.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "✗ .env.local not found at repo root. Cannot push env vars to Vercel."
  echo "  Copy .env.example → .env.local and fill in the values, then re-run."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "→ Installing Vercel CLI globally..."
  npm install -g vercel
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "→ Logging into Vercel (browser will open)..."
  vercel login
fi

# Link to an existing Vercel project or create a new one.
# Re-running on an already-linked repo is a no-op.
echo "→ Linking project (pick or create when prompted)..."
vercel link

echo "→ Pushing env vars from .env.local to Vercel (production scope)..."
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blank lines and comments
  [[ -z "${line// }" ]] && continue
  [[ "${line:0:1}" == "#" ]] && continue

  key="${line%%=*}"
  value="${line#*=}"
  # Strip surrounding quotes from value if present
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"

  if printf '%s' "$value" | vercel env add "$key" production >/dev/null 2>&1; then
    echo "  ✓ $key"
  else
    echo "  ⚠ $key already exists — leave as-is, or run: vercel env rm $key production"
  fi
done < .env.local

echo "→ Deploying to production..."
vercel --prod

echo
echo "✓ Done. Subsequent deploys: vercel --prod"
