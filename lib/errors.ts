/**
 * Base application error.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = "AUTH_ERROR") {
    super(message, code, 401);
    this.name = "AuthError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class PermissionError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "PERMISSION_DENIED", 403);
    this.name = "PermissionError";
  }
}
