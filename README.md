# Liveness SDK

JavaScript SDK for browser-based active liveness detection and face verification. It uses MediaPipe Face Mesh and TensorFlow.js (ResNet-34 FaceRecognitionNet) to run verification checks on the client.

> - **Live platform and console**: [https://liveness.cloud](https://liveness.cloud)
> - **Production API**: `https://api.liveness.cloud`
> - **Local documentation and API references**: `http://localhost:5173/#/docs`

## Features

- Runtime challenges (blink, turn left, turn right) to block replay attacks.
- Face feature extraction matching with cosine similarity and Euclidean distance.
- Management dashboard with API key generation and verification logs.

## Project structure

Repository layout:

- `apps/saas-web`: SaaS platform, interactive demo (`/demo`), and documentation.
- `apps/saas-api`: Verification and orchestration backend.
- `packages/engine`: Core vision engine and mathematical utilities.
- `packages/sdk`: Browser client SDK (`@liveness/sdk`).
- `packages/api-client`: Backend client SDK (`@liveness/api-client`).

## Installation

### Frontend SDK (Browser)

```bash
npm install @liveness/sdk
```

### Backend SDK (Node.js / Server)

```bash
npm install @liveness/api-client
```

## Quick start

### 1. Browser client (@liveness/sdk)

```javascript
import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  challengeTimeout: 10000,
  minBrightness: -0.8,
});

sdk.on("challenge", ({ instruction }) => updateUI(instruction));
sdk.on("success", (result) => {
  console.log("Verified!", result.descriptor);
});

await sdk.load();
await sdk.start(videoElement, canvasElement);
```

### 2. Backend server (@liveness/api-client)

```javascript
import { LivenessApiClient } from "@liveness/api-client";

const client = new LivenessApiClient({
  apiKey: process.env.LIVENESS_API_KEY,
});

// Create a verification session
const session = await client.liveness.createSession();

// Verify probe received from frontend
const verification = await client.liveness.verify({
  descriptor: probeDescriptor,
  sessionToken: session.sessionToken,
  sessionSecret: session.sessionSecret,
  challenges: session.challenges,
});

console.log("Matched:", verification.verified, verification.match);
```

## Local development

### Prerequisites

- Node.js v18 or higher.
- PostgreSQL with the `pgvector` extension installed.

### Setup

1. Install dependencies from the root directory:
   ```bash
   npm install
   ```
2. Initialize the database:
   ```bash
   cd apps/saas-api
   npm run init-db
   ```

### Running services

Start services from the root directory:

- Web platform & demo: `npm run dev` (or `npm run dev:saas`)
- SaaS API: `npm run dev:api`

## Testing and building

- Run tests: `npm test`
- Build SDK: `npm run build:sdk`

## API reference

### `new LivenessSDK(config)`

- `minBrightness` (number, default: -0.8): Minimum required normalized tensor brightness [-1.0, 1.0].
- `challengeTimeout` (number, default: 5000): Max duration per challenge in milliseconds.

### Events

- `ready`: Models are loaded.
- `challenge`: A new challenge starts.
- `success`: All checks passed and biometric vector generated.
- `failure`: Challenge failed or recognition error.

## Error codes

- `POOR_LIGHTING`: Environment is too dark or has excessive glare.
- `OCCLUSION_DETECTED`: Face is partially covered.
- `CHALLENGE_TIMEOUT`: User exceeded maximum allowed time for a challenge.
- `FACE_NOT_FOUND`: No face detected in camera viewport.
- `CAMERA_ACCESS_DENIED`: Camera permission was blocked by the user.

## AI agent skills and rules

The `plugins/liveness-sdk-plugin` directory contains rules and skills for AI coding assistants (Claude Code, Antigravity, Cursor, Windsurf, GitHub Copilot) integrating `@liveness/sdk`.

### Automated setup

Configure agent rules and skills in the current project or a target directory:

```bash
# Set up all agents in the current workspace
npm run setup:agents

# Set up for a specific agent in an external project
node scripts/setup-agent-skills.js /path/to/target-project --agent=claude
node scripts/setup-agent-skills.js /path/to/target-project --agent=cursor
node scripts/setup-agent-skills.js /path/to/target-project --agent=antigravity
```

### Manual installation by agent

#### 1. Claude Code

Copy `plugins/liveness-sdk-plugin/adapters/claude/CLAUDE.md` to your project root as `CLAUDE.md`.

#### 2. Antigravity / Gemini CLI

- Project workspace: Copy `plugins/liveness-sdk-plugin` to `.agents/plugins/liveness-sdk-plugin/`
- Global (all projects): Copy `plugins/liveness-sdk-plugin` to `~/.gemini/config/plugins/liveness-sdk-plugin/`

#### 3. Cursor

Copy `plugins/liveness-sdk-plugin/adapters/cursor/liveness-sdk.mdc` to `.cursor/rules/liveness-sdk.mdc` and `.cursorrules`.

#### 4. Windsurf (Codeium)

Copy `plugins/liveness-sdk-plugin/adapters/windsurf/.windsurfrules` to `.windsurfrules`.

#### 5. GitHub Copilot

Copy `plugins/liveness-sdk-plugin/adapters/copilot/copilot-instructions.md` to `.github/copilot-instructions.md`.

#### 6. Universal Agents (OpenHands, Codex, Aider)

Copy `plugins/liveness-sdk-plugin/adapters/generic/AGENTS.md` to your project root as `AGENTS.md`.

### Static model assets

The SDK requires `face_mesh/` and `face_recognition/` (ResNet-34) binary assets in your public directory:

```bash
node plugins/liveness-sdk-plugin/skills/liveness-sdk-integration/scripts/copy-liveness-assets.js ./public
```
