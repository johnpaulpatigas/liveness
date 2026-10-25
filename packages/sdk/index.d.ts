export interface LivenessConfig {
  blinkEARThreshold?: number;
  headTurnThreshold?: number;
  challengeTimeout?: number;
  targetFPS?: number;
  minFaceSize?: number;
  maxFaceSize?: number;
  basePath?: string;
  minBrightness?: number;
  maxBrightness?: number;
  sessionToken?: string;
  sessionSecret?: string;
  deviceId?: string;
  challenges?: string[];
  instructions?: {
    WAITING?: string;
    BLINK?: string;
    TURN_LEFT?: string;
    TURN_RIGHT?: string;
    PROCESSING?: string;
  };
}

export interface LivenessResult {
  descriptor: number[];
  sessionToken: string;
  timestamp: number;
  challenges: string[];
  integrity: string;
}

export interface LivenessError {
  code: string;
  message: string;
}

export type ChallengeType =
  | "WAITING"
  | "BLINK"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "PROCESSING";

export interface ChallengePayload {
  type: ChallengeType;
  instruction: string;
  distance: "CLOSER" | "FURTHER" | null;
}

export interface ProgressPayload {
  progress: number;
  rawValue: any;
}

export interface LivenessEventMap {
  ready: () => void;
  challenge: (payload: ChallengePayload) => void;
  progress: (payload: ProgressPayload) => void;
  success: (result: LivenessResult) => void;
  failure: (error: LivenessError) => void;
  error: (error: LivenessError) => void;
}

export class LivenessSDK {
  static getAvailableCameras(): Promise<MediaDeviceInfo[]>;
  constructor(config?: LivenessConfig);
  on<K extends keyof LivenessEventMap>(
    event: K,
    callback: LivenessEventMap[K],
  ): this;
  on(event: string, callback: Function): this;
  off<K extends keyof LivenessEventMap>(
    event: K,
    callback: LivenessEventMap[K],
  ): this;
  off(event: string, callback: Function): this;
  load(): Promise<void>;
  updateConfig(config?: Partial<LivenessConfig>): this;
  start(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    options?: Partial<LivenessConfig>,
  ): Promise<void>;
  stop(videoElement?: HTMLVideoElement): void;
  destroy(videoElement?: HTMLVideoElement): void;
}
