export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function calculateEAR(
  landmarks: Landmark[],
  side: "left" | "right",
  widthOrAspectRatio?: number,
  height?: number,
): number;
export function calculateHeadTurnV2(landmarks: Landmark[]): number;
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[],
): number;
export function calculateEuclideanDistance(
  vecA: number[],
  vecB: number[],
): number;
export function calculateFaceSize(landmarks: Landmark[]): number;
