function generateIntegrityHash(descriptor, sessionToken, timestamp) {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
};

export function validateIntegrity(req, res, next) {
  const { descriptor, sessionToken, timestamp, integrity } = req.body;
  if (!descriptor || !sessionToken || !timestamp || !integrity) {
    return res.status(400).json({ error: "Missing security metadata" });
  }

  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (timestamp < tenMinutesAgo) {
    return res.status(400).json({ error: "Session expired or clock desync" });
  }

  const expectedHash = generateIntegrityHash(
    descriptor,
    sessionToken,
    timestamp,
  );
  if (integrity !== expectedHash) {
    return res.status(400).json({ error: "Payload integrity check failed" });
  }
  
  next();
}


