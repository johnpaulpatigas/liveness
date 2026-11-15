# Liveness SDK skills plugin

Skills plugin for Antigravity, Claude Code, Cursor, and Windsurf. It provides rules, API references, and code examples for integrating `@liveness/sdk`.

---

## Contents

```text
liveness-sdk-plugin/
├── plugin.json                 # Antigravity plugin manifest
├── gemini-extension.json       # Gemini extension manifest
├── rules/
│   └── AGENTS.md               # Strict architectural guidelines and privacy constraints
├── skills/
│   └── liveness-sdk-integration/
│       ├── SKILL.md            # Primary agent runbook and workflow guide
│       ├── references/
│       │   ├── sdk-api-reference.md             # Complete JS/TS API documentation
│       │   ├── backend-api-reference.md         # REST API specifications and matching guide
│       │   ├── model-assets-guide.md            # WASM/model hosting and basePath setup
│       │   └── troubleshooting-and-edgecases.md # Lighting, Safari quirks, CSP fixes
│       ├── examples/
│       │   ├── react-use-liveness-hook.tsx      # Production React custom hook
│       │   ├── react-liveness-modal.tsx         # Clean Tailwind CSS verification dialog
│       │   ├── vanilla-html-js.html             # Zero-dependency vanilla JS demo
│       │   ├── backend-verification-node.js     # Express biometric verification backend
│       │   └── nextjs-api-route.ts              # Next.js App Router verification route
│       └── scripts/
│           └── copy-liveness-assets.js          # CLI tool to copy model assets into public/
```

---

## Installation and usage

### Workspace installation

Place the plugin in your project's `.agents/plugins/` directory:

```bash
mkdir -p .agents/plugins
cp -r /path/to/liveness-sdk-plugin .agents/plugins/
```

Antigravity automatically discovers and activates skills and rules in `.agents/`.

### Global installation

Install the plugin into your global configuration:

```bash
mkdir -p ~/.gemini/config/plugins/
cp -r /path/to/liveness-sdk-plugin ~/.gemini/config/plugins/
```

### Other AI assistants

- Cursor and Windsurf: Add `rules/AGENTS.md` to `.cursorrules` or `.windsurfrules`.
- Claude Code: Add `rules/AGENTS.md` to `CLAUDE.md`.

---

## Copying model assets

Copy the MediaPipe Face Mesh and ResNet-34 model assets to your public directory:

```bash
node .agents/plugins/liveness-sdk-plugin/skills/liveness-sdk-integration/scripts/copy-liveness-assets.js ./public
```

---

## How agents use this skill

When a user prompts the AI assistant with requests such as:

- "Add liveness detection to our React login form"
- "Integrate @liveness/sdk into our Next.js onboarding"
- "How do I verify the biometric descriptor on the backend?"
- "Help me fix a camera permission or poor lighting issue with the liveness SDK"

The agent activates the `liveness-sdk-integration` skill, loads the relevant references and examples, and produces integration code matching the SDK API.
