# Paste this into Claude Code in VS Code

Put these files in one folder first: agent.py, deploy_ghostit.py, ghost-it-readme.md, ghost-it-launch-checklist.md. Open that folder in VS Code, start Claude Code, and paste:

---

I'm deploying my Fetch.ai agent "Ghost It" to Agentverse as a hosted agent. Everything is in this folder:
- agent.py is the agent (uAgents + Agent Chat Protocol, uses ASI1_API_KEY that Agentverse injects into hosted agents).
- deploy_ghostit.py uses the Agentverse Hosting API (POST /v1/hosting/agents, PUT /{address}/code, POST /{address}/start, GET /{address}/logs/latest) to create, upload and start it.
- ghost-it-launch-checklist.md is the full checklist; ghost-it-readme.md has the profile text and test prompts.

My Agentverse API key is in the environment variable AGENTVERSE_API_KEY (I'll set it; never print it or write it to a file).

Please:
1. pip install requests, then run `python deploy_ghostit.py`.
2. If any API call fails, read the error, check the Agentverse Hosting API docs (https://docs.agentverse.ai, MCP server at https://docs.agentverse.ai/_mcp/server), fix deploy_ghostit.py, and retry. Don't change agent.py's behaviour.
3. Read the logs. If agent.py errors on Agentverse (e.g. model name or a blocked import), make the smallest fix in agent.py and run `python deploy_ghostit.py update`.
4. When it's running with no errors, tell me the agent address and the exact next manual steps (profile README paste, Chat test prompts from ghost-it-readme.md).
Explain each step in one short line. I'm not a coder.

---

## Before you paste (2 minutes, in the browser)
1. agentverse.ai > Sign into Agentverse (top left of the marketplace page, the purple button).
2. Click your profile > API Keys > + New API Key. Name it "ghostit", give it write access, copy it.
3. In the VS Code terminal:
   - Mac: `export AGENTVERSE_API_KEY="paste-key-here"`
   - Windows PowerShell: `$env:AGENTVERSE_API_KEY="paste-key-here"`
4. Then start Claude Code in that same terminal and paste the prompt.
