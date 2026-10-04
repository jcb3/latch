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
  echo "Sign in with the GitHub account that owns Latch, then run this again:" >&2
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

git fetch github main
remote_main="$(git rev-parse github/main)"
if git merge-base --is-ancestor "$remote_main" HEAD 2>/dev/null; then
  git push -u github HEAD:main
else
  # This checkout and github.com/<user>/latch do not share history.
  # Put the current tree on top of that repo's main and fast-forward it.
  tree="$(git rev-parse 'HEAD^{tree}')"
  message="$(cat <<'EOF'
Add Gather calls to the GitHub Pages site.

Gather calls runs in the browser. Choose a city and a state, and Latch fills the call list from local websites. Arbiter writes the notes when its address is saved on the Calls page.
EOF
)"
  if commit="$(git commit-tree "$tree" -p "$remote_main" -S -m "$message" 2>/dev/null)"; then
    :
  else
    commit="$(git commit-tree "$tree" -p "$remote_main" -m "$message")"
  fi
  git push github "$commit:main"
fi

if [ "$repo" = "${login}.github.io" ]; then
  echo "https://${login}.github.io/"
else
  echo "https://${login}.github.io/${repo}/"
fi
echo "The first publish finishes after the Pages workflow on that repository turns green."
