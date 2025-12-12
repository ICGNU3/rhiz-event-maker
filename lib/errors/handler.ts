import { AppError, ErrorCode } from "./codes";

type ErrorResponse = {
  success: false;
  error: string;
  code: ErrorCode;
};

export function handleError(error: unknown): ErrorResponse {
  console.error("Application Error:", error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  };
}

/**
 * Helper to ensure we never leak sensitive details in production
 * (Currently simple pass-through, but expandable)
 */
export function sanitizeErrorMessage(message: string): string {
    if (process.env.NODE_ENV === 'production') {
        // Hide specific DB errors etc if needed
        return message; 
    }
    return message;
}
