import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(body: ApiErrorBody) {
    super(body.error);
    this.name = "ApiError";
    this.status = body.status;
    this.fields = body.fields;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidation() {
    return this.status === 400 || this.status === 422;
  }

  get isConflict() {
    return this.status === 409;
  }
}
