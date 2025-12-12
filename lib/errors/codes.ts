export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // Resource
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  
  // Service / Infrastructure
  DB_ERROR = "DB_ERROR",
  AI_GENERATION_FAILED = "AI_GENERATION_FAILED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public context?: Record<string, unknown>;

  constructor(message: string, code: ErrorCode, statusCode = 500, context?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}
