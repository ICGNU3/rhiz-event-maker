import { ErrorCode } from "./codes";

export function getUserFriendlyMessage(error: unknown): string {
  if (typeof error === "string") return error;

  const code = (error as Record<string, unknown>)?.code as ErrorCode | undefined;

  if (code) {
    switch (code) {
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return "You've reached the limit for now. Please wait a bit before trying again.";
      case ErrorCode.AI_GENERATION_FAILED:
        return "Our AI architect is having a moment. Please try again.";
      case ErrorCode.UNAUTHORIZED:
        return "You need to be signed in to do that.";
      case ErrorCode.FORBIDDEN:
        return "You don't have permission to perform this action.";
      case ErrorCode.VALIDATION_ERROR:
        return "Please check your inputs and try again.";
      // Fallthrough for others
    }
  }

  if (error instanceof Error) {
      return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
