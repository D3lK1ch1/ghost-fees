"""
Deploy Ghost It to Agentverse as a hosted agent, using the Agentverse Hosting API.

Usage (in the folder that has agent.py and this file):
    pip install requests
    python deploy_ghostit.py setkey     # paste key once (hidden); saved to macOS Keychain
    python deploy_ghostit.py            # create + upload + start
    python deploy_ghostit.py update     # re-upload code and restart (after edits)
    python deploy_ghostit.py logs       # show latest logs

Get the key: agentverse.ai > Profile > API Keys > + New API Key (give it write access).
The agent address is saved to .ghostit_address so later runs update the same agent.
"""
import json
import os
import sys
import time

import requests

BASE = "https://agentverse.ai/v1/hosting/agents"
NAME = "Ghost.it"
ADDR_FILE = ".ghostit_address"

SERVICE = "AGENTVERSE_API_KEY"  # name of the macOS Keychain entry


def _keychain_key():
    """Read the key from the macOS Keychain."""
    if sys.platform != "darwin":
        return ""
    import subprocess
    r = subprocess.run(["security", "find-generic-password", "-s", SERVICE, "-w"],
                       capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ""


def _looks_complete(k):
    # Agentverse keys are JWTs: three parts separated by two dots.
    return k.count(".") == 2 and len(k) > 128


def _ask_and_save_key():
    """Prompt for the key (hidden), check it, and save it to the Keychain."""
    import getpass
    import subprocess
    print("Paste your Agentverse API key and press Enter (it stays hidden).")
    k = getpass.getpass("Key: ").strip().strip('"').strip("'")
    if not _looks_complete(k):
        sys.exit("That key looks incomplete or cut off. Copy the whole key and try again.")
    if sys.platform == "darwin":
        r = subprocess.run(["security", "add-generic-password", "-a", os.environ.get("USER", ""),
                            "-s", SERVICE, "-U", "-w", k], capture_output=True, text=True)
        print("Saved to Keychain." if r.returncode == 0 else "Could not save to Keychain: " + r.stderr.strip())
    return k


CMD = sys.argv[1] if len(sys.argv) > 1 else "deploy"
KEY = os.environ.get("AGENTVERSE_API_KEY", "").strip() or _keychain_key()
if CMD == "setkey" or not _looks_complete(KEY):
    KEY = _ask_and_save_key()
    if CMD == "setkey":
        sys.exit(0)
H = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}


def check(r, what):
    if r.status_code == 401:
        sys.exit(f"{what} failed: Agentverse rejected the key. Run: python3 deploy_ghostit.py setkey")
    if r.status_code >= 300:
        sys.exit(f"{what} failed: {r.status_code} {r.text[:500]}")
    return r


def create():
    r = check(requests.post(BASE, headers=H, json={"name": NAME}), "Create agent")
    addr = r.json()["address"]
    open(ADDR_FILE, "w").write(addr)
    print("Created agent:", addr)
    return addr


def upload(addr):
    requests.post(f"{BASE}/{addr}/stop", headers=H)  # code can't be changed while running
    time.sleep(2)
    code = open("agent.py", encoding="utf-8").read()
    # Newer Agentverse expects a JSON list of files; older accepts raw code. Try new, then old.
    files = json.dumps([{"language": "python", "name": "agent.py", "value": code}])
    r = requests.put(f"{BASE}/{addr}/code", headers=H, json={"code": files})
    check(r, "Upload code")
    print("Uploaded agent.py")


def restart(addr):
    requests.post(f"{BASE}/{addr}/stop", headers=H)
    time.sleep(2)
    check(requests.post(f"{BASE}/{addr}/start", headers=H), "Start agent")
    print("Agent started. Waiting 15s for logs...")
    time.sleep(15)
    logs(addr)


def logs(addr):
    r = requests.get(f"{BASE}/{addr}/logs/latest", headers=H)
    if r.status_code >= 300:
        print("Could not read logs:", r.status_code, r.text[:300])
        return
    for line in r.json()[-30:] if isinstance(r.json(), list) else [r.json()]:
        print(line.get("log_entry", line) if isinstance(line, dict) else line)


if __name__ == "__main__":
    cmd = CMD
    addr = open(ADDR_FILE).read().strip() if os.path.exists(ADDR_FILE) else None
    if cmd == "logs":
        logs(addr) if addr else sys.exit("No agent yet. Run without arguments first.")
    elif cmd == "update":
        if not addr:
            sys.exit("No agent yet. Run without arguments first.")
        upload(addr)
        restart(addr)
    else:
        addr = addr or create()
        upload(addr)
        restart(addr)
        print(f"\nDone. Open https://agentverse.ai/agents and find '{NAME}' ({addr}).")
        print("Next: paste the README/description from ghost-it-readme.md into its profile, then test in Chat.")
