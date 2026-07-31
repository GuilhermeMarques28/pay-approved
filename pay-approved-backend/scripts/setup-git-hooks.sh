#!/bin/sh
set -eu

if [ ! -d .git ]; then
  echo "setup-git-hooks: skipped (not a git repository)"
  exit 0
fi

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/pre-push

echo "setup-git-hooks: core.hooksPath -> .githooks"
