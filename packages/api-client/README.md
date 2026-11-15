# @liveness/api-client

JavaScript client SDK for the [Liveness Cloud](https://liveness.cloud) SaaS API.

Designed for server environments (Node.js, Bun, Deno, Next.js Server Actions) and backend services to interact with biometric authentication and session verification endpoints.

---

## Installation

```bash
npm install @liveness/api-client
```

---

## Quickstart

### 1. Initialize client

```javascript
import { LivenessApiClient } from "@liveness/api-client";

const client = new LivenessApiClient({
  apiKey: "live_pk_xxxxxxxxxxxxxx",
  baseUrl: "https://api.liveness.cloud/api", // optional, defaults to production API
});
```

### 2. Create a verification session

Before running challenges in the browser, create a verification session on your server:

```javascript
const session = await client.liveness.createSession({
  challenges: ["WAITING", "BLINK", "TURN_LEFT", "WAITING"],
});

console.log(session);
// {
//   sessionToken: "live_sess_...",
//   sessionSecret: "...",
//   challenges: ["WAITING", "BLINK", "TURN_LEFT", "WAITING"],
//   expiresAt: 1731652199000
// }
```

### 3. Enroll a user face

```javascript
const user = await client.liveness.enroll({
  name: "Jane Doe",
  descriptor: faceDescriptor128, // Array of 128 numbers
  sessionToken: session.sessionToken,
  sessionSecret: session.sessionSecret, // Computes HMAC integrity
  challenges: session.challenges,
});

console.log("Enrolled ID:", user.id);
```

### 4. Verify identity (1:1 or 1:N)

**1:N verification (match against all enrolled identities):**

```javascript
const result = await client.liveness.verify({
  descriptor: faceDescriptor128,
  sessionToken: session.sessionToken,
  sessionSecret: session.sessionSecret,
  challenges: session.challenges,
  metric: "both", // "cosine" | "euclidean" | "both"
});

if (result.verified) {
  console.log(
    `Matched user: ${result.match.name} (Similarity: ${result.match.similarity})`,
  );
}
```

**1:1 verification (match against a specific user UUID):**

```javascript
const result = await client.liveness.verifyOne({
  targetId: "c1859c04-...",
  descriptor: faceDescriptor128,
  sessionToken: session.sessionToken,
  sessionSecret: session.sessionSecret,
  challenges: session.challenges,
});
```

---

## Dashboard and admin endpoints

When authenticating as an admin using a JWT Bearer token:

```javascript
const adminClient = new LivenessApiClient({
  token: "jwt_admin_token",
});

// List users
const users = await adminClient.users.list();

// Manage API keys
const keys = await adminClient.apiKeys.list();
const newKey = await adminClient.apiKeys.create("Production Backend");
await adminClient.apiKeys.revoke(newKey.id);

// Stats & logs
const stats = await adminClient.stats.getOverview(7);
const logs = await adminClient.logs.list(50);
```

---

## License

MIT © [John Paul Patigas](https://github.com/johnpaulpatigas)
