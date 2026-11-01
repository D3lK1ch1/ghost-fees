#!/usr/bin/env bash
# Keeps every open feat/* pull request up to date with main, in order (feat/01 first).
# Merges (never rebases or force-pushes), runs lint and build, then pushes.
# On a conflict or a failed check it comments on that PR and stops, because later
# branches build on it. Run by .github/workflows/keep-fresh.yml, or by hand.
set -euo pipefail

git fetch origin --prune
branches=$(gh pr list --state open --base main --json headRefName --jq '.[].headRefName' | grep '^feat/' | sort || true)
if [ -z "$branches" ]; then echo "No open feat/* PRs."; exit 0; fi

comment() { gh pr comment "$1" --body "$2" || true; }

# Log files everyone appends to get merged automatically: GHOST_LOG.md keeps both
# sides (also set in .gitattributes), shipped.json keeps every entry once, by date.
autoresolve() {
  local left
  left=$(git diff --name-only --diff-filter=U)
  for file in $left; do
    case "$file" in
      GHOST_LOG.md)
        git show ":2:$file" > /tmp/ours; git show ":1:$file" > /tmp/base 2>/dev/null || : > /tmp/base; git show ":3:$file" > /tmp/theirs
        git merge-file --union -p /tmp/ours /tmp/base /tmp/theirs > "$file"; git add "$file" ;;
      src/data/shipped.json)
        git show ":2:$file" > /tmp/ours.json; git show ":3:$file" > /tmp/theirs.json
        node -e 'const fs=require("fs");const a=JSON.parse(fs.readFileSync("/tmp/ours.json"));const b=JSON.parse(fs.readFileSync("/tmp/theirs.json"));const seen=new Set();const all=[...a,...b].filter(x=>{const k=x.date+"|"+x.title;if(seen.has(k))return false;seen.add(k);return true}).sort((x,y)=>x.date<y.date?-1:x.date>y.date?1:0);fs.writeFileSync(process.argv[1],JSON.stringify(all,null,2)+"\n")' "$file"
        git add "$file" ;;
      *) return 1 ;;
    esac
  done
  git -c core.editor=true commit --no-edit -q
}
installed=0
base="origin/main"

for branch in $branches; do
  echo "=== $branch (bring in $base)"
  git checkout -q -B "$branch" "origin/$branch"

  if git merge-base --is-ancestor "$base" HEAD; then
    echo "Already up to date."
  elif ! git merge --no-edit "$base" && ! autoresolve; then
    files=$(git diff --name-only --diff-filter=U | tr '\n' ' ')
    git merge --abort
    comment "$branch" "👻 Auto-update stopped: \`$branch\` conflicts with \`${base#origin/}\` in: $files. Fix it by hand (keep both changes), push, and the next run carries on. Later feat branches wait for this one."
    exit 1
  fi

  if grep -rIl '^<<<<<<< ' src base44 >/dev/null 2>&1; then
    comment "$branch" "👻 Auto-update stopped: conflict markers left in \`$branch\`."
    exit 1
  fi
  if [ "$installed" = 0 ]; then npm ci --no-audit --no-fund; installed=1; fi
  if ! npm run lint || ! npm run build; then
    comment "$branch" "👻 Auto-update stopped: \`$branch\` fails lint or build after bringing in \`${base#origin/}\`. See the Actions log."
    exit 1
  fi

  if [ "$(git rev-parse HEAD)" != "$(git rev-parse "origin/$branch")" ]; then
    git push origin "HEAD:$branch"
    echo "Pushed $branch."
  fi
  base="$branch"
done
echo "All open feat/* PRs are up to date with main."
