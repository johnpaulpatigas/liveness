# Liveness SDK Rules and Architectural Guidelines

When implementing or modifying features involving @liveness/sdk and biometric face verification, all AI agents must adhere to the following rules:

---

## 1. Video and Camera Configuration

- Mobile Compatibility: Video elements used for camera feeds MUST always include the following attributes:
  - autoPlay (or autoplay)
  - playsInline (or playsinline)
  - muted
- Resolution and Facing Mode: Request facingMode: "user" with ideal dimensions 1280x720.
- Cleanup: When a component unmounts or a verification session finishes, ALWAYS call sdk.stop(videoElement) and ensure all tracks on videoElement.srcObject are stopped (track.stop()) to release camera hardware.

---

## 2. Asset Hosting and basePath

- WASM and Model Binaries: The SDK requires MediaPipe Face Mesh (face_mesh/) and TensorFlow.js ResNet-34 FaceRecognitionNet (face_recognition/) binary assets.
- Configuration: Always configure basePath in new LivenessSDK({ basePath: "/assets/models" }) or copy assets to your framework public directory (e.g. public/face_mesh and public/face_recognition with basePath: "").
- Required Headers: Static servers and CDNs hosting .wasm and .binarypb files must serve them with appropriate MIME types (application/wasm, application/octet-stream).

---

## 3. Active Challenges and Flow

- Active Challenges: Supported challenges are WAITING, BLINK, TURN_LEFT, and TURN_RIGHT.
- Event Sequence: ready -> challenge -> progress -> success / failure.

---

## 4. Privacy and Biometric Architecture

- Client-Side Processing: Liveness detection and feature extraction execute 100% on the client inside WebAssembly/WebGL.
- Biometric Descriptor: Never send raw webcam video or frames to the backend. Send only the 128-dimensional numerical descriptor vector, sessionToken, timestamp, challenges, and integrity hash.
- Similarity Threshold: Use Cosine Similarity (threshold >= 0.95) and Euclidean Distance (threshold <= 0.30) for 1:1 and 1:N face verification.

---

## 5. Error Handling and User Guidance

- Handle common failure modes gracefully in the UI:
  - POOR_LIGHTING: Guide user to a well-lit environment.
  - OCCLUSION_DETECTED: Prompt user to remove masks, hats, or glasses covering the face.
  - CAMERA_ACCESS_DENIED: Explain how to grant camera permissions in browser settings.
  - WASM_NOT_SUPPORTED / WEBGL_NOT_SUPPORTED: Display system compatibility requirements.
