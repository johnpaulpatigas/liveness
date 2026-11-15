export type Challenge = "WAITING" | "BLINK" | "TURN_LEFT" | "TURN_RIGHT";

export interface CreateSessionOptions {
  challenges?: Challenge[];
}

export interface SessionResponse {
  sessionToken: string;
  sessionSecret: string;
  challenges: Challenge[];
  expiresAt: number;
}

export interface BiometricPayload {
  descriptor: number[];
  sessionToken: string;
  timestamp?: number;
  challenges: string[];
  integrity?: string;
  sessionSecret?: string;
}

export interface EnrollPayload extends BiometricPayload {
  name: string;
}

export interface VerifyPayload extends BiometricPayload {
  metric?: "cosine" | "euclidean";
}

export interface VerifyOnePayload extends BiometricPayload {
  targetId: string;
  metric?: "cosine" | "euclidean";
}

export interface MatchResult {
  id: string;
  name: string;
  similarity: number;
  distance: number;
}

export interface VerificationResponse {
  verified: boolean;
  match: MatchResult | null;
  status: "SUCCESS" | "FAILURE";
  metric: string;
}

export interface EnrolledUser {
  id: string;
  adminId: string;
  name: string;
  descriptor: number[];
  createdAt: string;
}

export interface LivenessApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
  token?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export declare class LivenessApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status?: number, data?: any);
}

export declare function computeIntegrity(
  descriptor: number[],
  sessionToken: string,
  timestamp: number,
  sessionSecret?: string | null,
): Promise<string>;

export declare class LivenessApiClient {
  baseUrl: string;
  apiKey: string | null;
  token: string | null;

  constructor(options?: LivenessApiClientOptions);

  setApiKey(apiKey: string): void;
  setToken(token: string): void;
  health(): Promise<{ status: string; database: string; timestamp: string }>;

  liveness: {
    createSession(params?: CreateSessionOptions): Promise<SessionResponse>;
    enroll(payload: EnrollPayload): Promise<EnrolledUser>;
    verify(payload: VerifyPayload): Promise<VerificationResponse>;
    verifyOne(payload: VerifyOnePayload): Promise<VerificationResponse>;
  };

  apiKeys: {
    list(): Promise<any[]>;
    create(name: string): Promise<any>;
    revoke(id: string): Promise<any>;
    delete(id: string): Promise<any>;
  };

  users: {
    list(): Promise<any[]>;
    delete(id: string): Promise<any>;
  };

  logs: {
    list(limit?: number): Promise<any[]>;
  };

  stats: {
    getOverview(days?: number): Promise<any>;
  };

  request<T = any>(
    endpoint: string,
    options?: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      requiresApiKey?: boolean;
      requiresAuth?: boolean;
    },
  ): Promise<T>;
}
