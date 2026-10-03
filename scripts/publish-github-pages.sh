#!/usr/bin/env bash
# Publish Latch as a public GitHub Pages site for the account signed in to gh.
# A user site (https://<user>.github.io/) needs the repo name <user>.github.io.
# Any other name is a project site: https://<user>.github.io/<repo>/
set -euo pipefail
export GH_PROMPT_DISABLED=1

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Sign in with the GitHub account for jaycb1978@gmail.com, then run this again:" >&2
  echo "  gh auth login" >&2
  exit 1
fi

login="$(gh api user --jq .login)"
repo="${1:-latch}"

if [[ "$repo" != "${login}.github.io" && ! "$repo" =~ ^[a-z0-9._-]+$ ]]; then
  echo "Use a lowercase repo name so the Pages URL matches the asset path. Got: $repo" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if gh repo view "${login}/${repo}" >/dev/null 2>&1; then
  echo "Using existing repository ${login}/${repo}"
else
  echo "Creating public repository ${login}/${repo}"
  gh repo create "$repo" --public --description "Latch, a plan for a side web studio"
fi

if git remote get-url github >/dev/null 2>&1; then
  git remote set-url github "https://github.com/${login}/${repo}.git"
else
  git remote add github "https://github.com/${login}/${repo}.git"
fi

# Pages has to be set to GitHub Actions before the first workflow run.
if ! gh api "repos/${login}/${repo}/pages" >/dev/null 2>&1; then
  gh api --method POST "repos/${login}/${repo}/pages" -f build_type=workflow >/dev/null
fi

git push -u github main

if [ "$repo" = "${login}.github.io" ]; then
  echo "https://${login}.github.io/"
else
  echo "https://${login}.github.io/${repo}/"
fi
echo "The first publish finishes after the Pages workflow on that repository turns green."
