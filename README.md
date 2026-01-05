# Liveness SDK

An event-driven JavaScript SDK for browser-based **Active Liveness Detection** and **Face Identity Verification**. This library leverages MediaPipe Face Mesh and TensorFlow.js (MobileNet V2) to provide a complete eKYC-ready frontend solution.

Developed as a Bachelor of Science in Information Technology Capstone Project (2026).

## Key Features

- **Randomized Active Challenges**: Prevents replay attacks by requiring users to perform random actions (Blink, Turn Left, Turn Right) generated at runtime.
- **Identity Enrollment & Verification**: Full biometric flow including face feature extraction and Cosine Similarity matching (>80% threshold).
- **Performance Optimized**: Built-in FPS throttling (default 30 FPS) to ensure smooth performance and battery efficiency on mobile devices.
- **Robust Blink Detection**: Implements a state-machine based blink detector (Open-to-Closed transition) to eliminate false positives.
- **Framework Agnostic**: Core SDK is written in Vanilla JavaScript, compatible with React, Vue, Angular, Svelte, or plain HTML.
- **Event-Driven API**: Simple subscription model for real-time UI synchronization.

## Quick Start

```javascript
import { LivenessSDK } from "./sdk/LivenessSDK";

// 1. Initialize with custom config
const sdk = new LivenessSDK({
  challengeTimeout: 10000,
  targetFPS: 30,
});

// 2. Subscribe to events
sdk.on("challenge", ({ instruction }) => updateUI(instruction));
sdk.on("success", ({ descriptor }) => verifyIdentity(descriptor));
sdk.on("failure", (err) => console.error(err.message));

// 3. Start Session
await sdk.load();
await sdk.start(videoElement, canvasElement);
```

## System Architecture & Methodology

### 1. Active Liveness Detection

The system employs **geometric landmarks** to differentiate between a live user and a spoofing attempt.

- **Blink Detection**: Calculates the **Eye Aspect Ratio (EAR)**. A valid blink requires the EAR to exceed a specific "Open" threshold before dropping below a "Closed" threshold.
- **Head Pose Estimation**: Uses **Z-axis depth ratios** of facial landmarks (cheeks vs. chin) to accurately detect head rotation (yaw).
- **Randomization**: The sequence of challenges is randomized for every session to mitigate replay attacks.

### 2. Face Recognition & Feature Extraction

Upon successful liveness verification, the system utilizes a pre-trained MobileNet V2 model via TensorFlow.js to extract a **128-dimensional feature vector** (embedding) from the detected face. This vector is normalized to unit length to ensure consistency.

### 3. Identity Matching Algorithm

Identity verification is performed using **Cosine Similarity**, which measures the cosine of the angle between two non-zero vectors.

- **Similarity Score Calculation**: Computed via the Dot Product of the normalized live vector and the stored enrolled vector.
- **Threshold**:
  - **Score > 0.8**: High-confidence identity confirmation.
  - **Score < 0.6**: Identity mismatch.

## API Reference

### `new LivenessSDK(config)`

- **`headTurnThreshold`** _(number, default: 0.4)_: Sensitivity for head turn detection.
- **`blinkEARThreshold`** _(number, default: 0.25)_: EAR value indicating a closed eye.
- **`challengeTimeout`** _(number, default: 5000)_: Max duration (ms) allowed per challenge.
- **`targetFPS`** _(number, default: 30)_: Limits detection loop frame rate.

### Methods

- `load()`: Initializes Machine Learning models.
- `start(video, canvas)`: Requests camera permissions and starts the detection loop.
- `stop(video?)`: Halts detection and releases media stream tracks.
- `on(event, callback)` / `off(event, callback)`: Event subscription management.

## Events Reference

| Event       | Payload                  | Trigger                            |
| :---------- | :----------------------- | :--------------------------------- |
| `ready`     | `void`                   | Models are fully loaded.           |
| `challenge` | `{ type, instruction }`  | A new randomized challenge starts. |
| `progress`  | `{ progress, rawValue }` | Real-time feedback for head turns. |
| `success`   | `{ descriptor }`         | Liveness passed; vector generated. |
| `failure`   | `{ code, message }`      | Challenge failed or face lost.     |
| `error`     | `Error`                  | Critical setup/runtime errors.     |

## Integration Guide (Backend)

While this SDK handles the client-side liveness and feature extraction, a production system must verify identities on a secure backend server.

### 1. Data Payload

When the `success` event fires, the client should send the generated face descriptor to your API.

**Request Structure (JSON):**

```json
{
  "userId": "12345",
  "descriptor": [0.123, -0.456, 0.789, ...], // Array of 128 floats
  "timestamp": "2026-01-01T12:00:00Z"
}
```

### 2. Database Schema Recommendation

Store the face embeddings as vector types for efficient similarity search.

**PostgreSQL (with pgvector extension):**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    face_vector vector(128)
);
```

**MongoDB:**

```json
{
  "_id": "...",
  "name": "John Doe",
  "faceVector": [0.123, -0.456, ...]
}
```

### 3. Server-Side Verification (Pseudo-Code)

Never rely solely on client-side matching for critical security. Perform the vector comparison on your backend.

```javascript
// Example Node.js / Express Endpoint
app.post("/api/verify", async (req, res) => {
  const { userId, descriptor } = req.body;

  // 1. Fetch enrolled vector from database
  const user = await db.users.findById(userId);
  if (!user) return res.status(404).send("User not found");

  // 2. Calculate Cosine Similarity
  const similarity = calculateCosineSimilarity(descriptor, user.faceVector);

  // 3. Decision Logic
  if (similarity > 0.8) {
    // 4. Log the access and return success token
    await auditLog.create({ userId, success: true });
    res.json({ verified: true, score: similarity });
  } else {
    await auditLog.create({ userId, success: false });
    res.status(401).json({ verified: false, message: "Identity Mismatch" });
  }
});
```

## Development & Demos

### 1. React Implementation (Main App)

The primary demonstration is built with **React 19** and **Tailwind CSS**.

```bash
npm install
npm run dev
```

### 2. Vanilla JS Implementation (Framework-Agnostic)

Demonstrates SDK interoperability without any frontend framework.

- Run `npm run dev`
- Visit `http://localhost:5173/demo-vanilla.html`

### 3. Testing & Validation

The core algorithms of the system are rigorously tested using **Vitest** to ensure mathematical accuracy.

- **Run Tests**: `npm test`
- **Coverage**:
  - `calculateEAR`: Verifies Eye Aspect Ratio logic for open vs. closed eyes.
  - `calculateHeadTurnV2`: Validates depth-based yaw estimation logic.
  - `calculateCosineSimilarity`: Ensures vector matching returns correct similarity scores (-1 to 1).

### 4. SDK Distribution

To distribute the Liveness SDK as a standalone library for other developers:

- **Build Command**: `npm run build:sdk`
- **Output**: Generates a `dist-sdk/` directory containing:
  - `liveness-sdk.js` (ES Module for React/Vue/Angular)
  - `liveness-sdk.umd.cjs` (UMD bundle for legacy `<script>` tags)

## Error Codes

- `FACE_NOT_FOUND`: No face detected in frame.
- `CHALLENGE_TIMEOUT`: User failed to complete the action in time.
- `CAMERA_ACCESS_DENIED`: Camera permissions blocked by user or browser.
- `MODEL_LOAD_FAILED`: CDN connection or model initialization error.
