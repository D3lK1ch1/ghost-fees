#!/usr/bin/env bash
# One-time setup for a self-hosted Ghost It on Linux (GB10 or any Ubuntu box).
# Run from this folder:  bash setup.sh
# It asks for the secret seed (typed, never shown), makes a private settings file,
# installs a Python environment and a systemd service that starts on boot and restarts on crash.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
AGENT="$(cd "$HERE/.." && pwd)/agent.py"
VENV="$HOME/.local/share/ghost-it/venv"
DATA="$HOME/.local/share/ghost-it/data"
ENVDIR="$HOME/.config/ghost-it"
ENVF="$ENVDIR/ghost-it.env"

[ -f "$AGENT" ] || { echo "agent.py not found next to deploy/"; exit 1; }
mkdir -p "$DATA" "$ENVDIR"; chmod 700 "$ENVDIR"

if [ ! -f "$ENVF" ]; then
  cp "$HERE/ghost-it.env.example" "$ENVF"; chmod 600 "$ENVF"
  read -r -s -p "Paste the Ghost It seed (hidden): " SEED; echo
  [ -n "$SEED" ] || { echo "No seed given"; exit 1; }
  read -r -s -p "Admin code (hidden, Enter to skip): " ADMIN; echo
  GI_SEED="$SEED" GI_ADMIN="$ADMIN" python3 - "$ENVF" <<'PY'
import os, sys
p = sys.argv[1]; seed = os.environ["GI_SEED"]; admin = os.environ.get("GI_ADMIN", "")
s = open(p).read().replace("GHOSTIT_LOCAL_SEED=\n", f"GHOSTIT_LOCAL_SEED={seed}\n").replace("GHOSTIT_ADMIN_CODE=\n", f"GHOSTIT_ADMIN_CODE={admin}\n")
open(p, "w").write(s)
PY
  unset SEED ADMIN
  echo "Saved private settings to $ENVF (only you can read it)."
else
  echo "Keeping existing settings in $ENVF"
fi

python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q -r "$HERE/requirements.txt"

sed -e "s#__USER__#$USER#" -e "s#__DATA__#$DATA#" -e "s#__ENV__#$ENVF#" -e "s#__VENV__#$VENV#" -e "s#__AGENT__#$AGENT#" \
  "$HERE/ghost-it.service" | sudo tee /etc/systemd/system/ghost-it.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable --now ghost-it
sleep 6
sudo journalctl -u ghost-it -n 15 --no-pager | grep -E "address|mailbox|error|Error" || true
echo
echo "Done. Ghost It now starts on boot and restarts if it crashes."
echo "Logs:    sudo journalctl -u ghost-it -f"
echo "Update:  git pull && sudo systemctl restart ghost-it"
