---
name: liveness-sdk-integration
description: >-
  Use this skill when implementing browser-based active liveness detection, face identity verification, or integrating @liveness/sdk into web applications (React, Next.js, Vue, Svelte, or Vanilla JavaScript). Covers setup, model asset hosting, camera/canvas rendering, challenge UI, event handling, and backend verification endpoints.
---

# Liveness SDK Integration Skill

This skill guides you through implementing browser-based Active Liveness Detection and Biometric Face Verification using @liveness/sdk.

---

## Workflow Overview

Follow this procedure when implementing the Liveness SDK:

```text
1. Install Package and Copy Static Assets (face_mesh + face_recognition)
2. Mount Video and Canvas Elements in DOM
3. Instantiate and Configure LivenessSDK (basePath, challengeTimeout, minBrightness)
4. Bind Event Listeners (ready, challenge, progress, success, failure)
5. Initialize Models (load) and Start Camera Detection (start)
6. Transmit Biometric Descriptor to Backend Verification Endpoint
```

---

## Step 1: Package Installation and Asset Deployment

### 1.1 Install the SDK

```bash
npm install @liveness/sdk
```

### 1.2 Copy Model Assets

The SDK requires client-side WebAssembly and ResNet-34 FaceRecognitionNet neural network files located in `@liveness/engine/assets/` (`face_mesh/` and `face_recognition/`).

Run the helper script to copy them to your project's public directory:

```bash
node .agents/plugins/liveness-sdk-plugin/skills/liveness-sdk-integration/scripts/copy-liveness-assets.js ./public
```

> See [Model Assets Guide](./references/model-assets-guide.md) for Next.js, Vite, Webpack, and CDN hosting instructions.

---

## Step 2: DOM Elements and Camera Setup

The SDK requires two elements in the DOM:

1. `<video>`: Camera stream receiver (must include `playsInline`, `autoPlay`, and `muted`).
2. `<canvas>`: Overlay for real-time face mesh landmark rendering.

```html
<div
  class="video-container"
  style="position: relative; width: 640px; aspect-ratio: 4/3;"
>
  <video
    id="liveness-video"
    playsinline
    autoplay
    muted
    style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
  ></video>
  <canvas
    id="liveness-canvas"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
  ></canvas>
</div>
```

---

## Step 3: Instantiate and Configure the SDK

The randomized active challenge pool evaluates user responsiveness via `BLINK`, `TURN_LEFT`, and `TURN_RIGHT`, preceded by initial face framing during `WAITING`.

```javascript
import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  basePath: "", // Root URL prefix pointing to /face_mesh and /face_recognition
  challengeTimeout: 8000, // Max duration (ms) per challenge
  minBrightness: -0.8, // Minimum normalized tensor brightness
  maxBrightness: 0.9, // Maximum normalized tensor brightness
  challenges: ["WAITING", "BLINK", "TURN_LEFT", "TURN_RIGHT"],
});
```

> See [SDK API Reference](./references/sdk-api-reference.md) for full configuration parameters.

---

## Step 4: Event Handling and Lifecycle

Always register event handlers before starting the session:

```javascript
// 1. Models Ready
sdk.on("ready", () => {
  console.log("AI models initialized and ready");
});

// 2. Challenge Updated (User Action Required)
sdk.on("challenge", ({ type, instruction }) => {
  // type: "WAITING" | "BLINK" | "TURN_LEFT" | "TURN_RIGHT"
  // instruction: string prompt for the user
  updateUI(instruction);
});

// 3. Challenge Completion Progress (0 - 100)
sdk.on("progress", ({ progress }) => {
  updateProgressBar(progress);
});

// 4. Verification Succeeded
sdk.on("success", async (result) => {
  // result: { descriptor: number[128], sessionToken, timestamp, challenges, integrity }
  await verifyWithBackend(result);
  sdk.stop(videoElement);
});

// 5. Verification Failed or Hardware Error
sdk.on("failure", (error) => {
  // error: { code: string, message: string }
  showErrorMessage(error.message);
});

// Preload models and start stream
await sdk.load();
await sdk.start(videoElement, canvasElement);
```

---

## Step 5: Backend Verification and Matching

Never send raw video feeds or images to the server. Transmit only the 128-dimensional numerical vector:

### Option A: Liveness Cloud API

Use the `@liveness/api-client` package (or direct HTTP calls):

```javascript
import { LivenessApiClient } from "@liveness/api-client";

const client = new LivenessApiClient({ apiKey: process.env.LIVENESS_API_KEY });

// 1. Request verification session
const session = await client.liveness.createSession();

// 2. Pass session.sessionToken & session.challenges to frontend sdk.updateConfig()

// 3. Verify probe submitted from frontend
const verification = await client.liveness.verify({
  descriptor: probeResult.descriptor,
  sessionToken: probeResult.sessionToken,
  sessionSecret: session.sessionSecret,
  challenges: probeResult.challenges,
});
```

### Option B: Self-Hosted Matching (Cosine Similarity & Euclidean Distance)

```javascript
import {
  calculateCosineSimilarity,
  calculateEuclideanDistance,
} from "@liveness/engine/utils";

const similarity = calculateCosineSimilarity(enrolledVector, probeVector);
const distance = calculateEuclideanDistance(enrolledVector, probeVector);
const isMatch = similarity >= 0.95 && distance <= 0.3;
```

> See [Backend API Reference](./references/backend-api-reference.md) for endpoint contracts.

---

## Step 6: Code Examples and Templates

- React Custom Hook: [react-use-liveness-hook.tsx](./examples/react-use-liveness-hook.tsx)
- React Modal Component: [react-liveness-modal.tsx](./examples/react-liveness-modal.tsx)
- Vanilla HTML and JS Demo: [vanilla-html-js.html](./examples/vanilla-html-js.html)
- Express Verification Backend: [backend-verification-node.js](./examples/backend-verification-node.js)
- Next.js App Router API Route: [nextjs-api-route.ts](./examples/nextjs-api-route.ts)

---

## Verification and Troubleshooting Checklist

- Video element includes `playsInline`, `autoPlay`, and `muted` attributes.
- Model assets are served with correct MIME types (`application/wasm`, `application/octet-stream`).
- `sdk.load()` is awaited before calling `sdk.start()`.
- Hardware cleanup (`sdk.stop()` and track stops) is performed when unmounting.
- See [Troubleshooting and Edge Cases](./references/troubleshooting-and-edgecases.md) for lighting, CSP, and permissions guidance.
