#!/bin/bash
set -euo pipefail

# Only run in remote/web environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install dependencies using pnpm
cd "$CLAUDE_PROJECT_DIR"

# Install dependencies (prefer 'install' over 'ci' for caching benefits)
pnpm install

echo "Dependencies installed successfully"
