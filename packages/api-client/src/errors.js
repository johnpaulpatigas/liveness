export class LivenessApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "LivenessApiError";
    this.status = status;
    this.data = data;
  }
}
