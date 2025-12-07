/**
 * Custom error classes for the Rhiz Event Maker application
 * These provide typed error handling for different failure scenarios
 */

export class BAMLGenerationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'BAMLGenerationError';
    Object.setPrototypeOf(this, BAMLGenerationError.prototype);
  }
}

export class APIConnectionError extends Error {
  constructor(
    message: string,
    public readonly endpoint?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'APIConnectionError';
    Object.setPrototypeOf(this, APIConnectionError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeoutMs?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Type guard to check if error is one of our custom types
 */
export function isCustomError(error: unknown): error is BAMLGenerationError | APIConnectionError | ValidationError | TimeoutError {
  return (
    error instanceof BAMLGenerationError ||
    error instanceof APIConnectionError ||
    error instanceof ValidationError ||
    error instanceof TimeoutError
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof BAMLGenerationError) {
    return "We're having trouble generating your event. Please try again.";
  }
  
  if (error instanceof APIConnectionError) {
    return "Connection lost. Please check your internet and try again.";
  }
  
  if (error instanceof ValidationError) {
    return `Invalid ${error.field || 'input'}: ${error.message}`;
  }
  
  if (error instanceof TimeoutError) {
    return "Request took too long. Please try again.";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again.";
}
