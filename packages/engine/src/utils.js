import * as tf from "@tensorflow/tfjs";

const EYE_INDICES = {
  left: [362, 385, 387, 263, 373, 380],
  right: [33, 160, 158, 133, 153, 144],
};

const HEAD_POSE_INDICES = {
  leftCheek: 234,
  rightCheek: 454,
  chin: 152,
};

export function calculateEuclideanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function euclideanDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2),
  );
}

export function calculateEAR(
  landmarks,
  side,
  widthOrAspectRatio = 1.0,
  height,
) {
  const aspectRatio =
    height && height > 0
      ? widthOrAspectRatio / height
      : typeof widthOrAspectRatio === "number" && widthOrAspectRatio > 0
        ? widthOrAspectRatio
        : 1.0;

  const scale = (pt) =>
    aspectRatio === 1.0
      ? pt
      : {
          x: pt.x * aspectRatio,
          y: pt.y,
          z: (pt.z || 0) * aspectRatio,
        };

  const indices = EYE_INDICES[side];
  const p1 = scale(landmarks[indices[0]]);
  const p2 = scale(landmarks[indices[1]]);
  const p3 = scale(landmarks[indices[2]]);
  const p4 = scale(landmarks[indices[3]]);
  const p5 = scale(landmarks[indices[4]]);
  const p6 = scale(landmarks[indices[5]]);

  const verticalDist1 = euclideanDistance(p2, p6);
  const verticalDist2 = euclideanDistance(p3, p5);
  const horizontalDist = euclideanDistance(p1, p4);

  if (horizontalDist === 0) return 0;

  const ear = (verticalDist1 + verticalDist2) / (2.0 * horizontalDist);
  return ear;
}

export function calculateHeadTurnV2(landmarks) {
  const leftCheek = landmarks[HEAD_POSE_INDICES.leftCheek];
  const rightCheek = landmarks[HEAD_POSE_INDICES.rightCheek];
  const chin = landmarks[HEAD_POSE_INDICES.chin];

  const leftDepth = leftCheek.z - chin.z;
  const rightDepth = rightCheek.z - chin.z;

  const faceWidth = euclideanDistance(leftCheek, rightCheek);
  if (faceWidth < 0.1) return 0;

  const turnRatio = (rightDepth - leftDepth) / faceWidth;

  return turnRatio;
}

export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function calculateFaceSize(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0;

  const ys = landmarks.map((l) => l.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const height = yMax - yMin;

  return height;
}

export function calculateBrightness(imageTensor) {
  return tf.tidy(() => {
    const mean = imageTensor.mean();
    return mean.dataSync()[0];
  });
}

export function checkOcclusion(landmarks) {
  if (!landmarks || landmarks.length < 468) return true;

  const leftIndices = EYE_INDICES.left;
  const rightIndices = EYE_INDICES.right;

  const leftWidth = euclideanDistance(
    landmarks[leftIndices[0]],
    landmarks[leftIndices[3]],
  );
  const rightWidth = euclideanDistance(
    landmarks[rightIndices[0]],
    landmarks[rightIndices[3]],
  );

  if (leftWidth < 0.01 || rightWidth < 0.01) return true;

  return false;
}

export function generateIntegrityHash(descriptor, sessionToken, timestamp) {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}
